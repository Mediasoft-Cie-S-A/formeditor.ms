var apiUrl;

function parseOpenApiJson(openApiJson) {
  const controllers = [];
  // Determine OpenAPI version
  const openApiVersion = openApiJson.openapi
    ? "3.0"
    : openApiJson.swagger
    ? "2.0"
    : null;
  if (!openApiVersion) {
    throw new Error("Unsupported OpenAPI version");
  }
  const servers = openApiJson.servers || [];
  const paths = openApiJson.paths || {};

  const components =
    openApiJson.components ||
    (openApiJson.definitions
      ? { schemas: openApiJson.definitions }
      : { schemas: {} });

  for (const path in paths) {
    const pathObj = paths[path];

    for (const method in pathObj) {
      const methodObj = pathObj[method];

      if (method === "parameters" || method === "servers") continue;

      const tags = methodObj.tags || [];
      const summary = Array.isArray(methodObj.summary)
        ? methodObj.summary
        : typeof methodObj.summary === "string"
        ? [methodObj.summary]
        : [];

      const parameters = methodObj.parameters || [];
      const requestBody = methodObj.requestBody || {};
      const responses = methodObj.responses || {};

      const mapper = tags.length > 0 ? tags : summary;
      mapper.forEach((tag) => {
        let controller = controllers.find((c) => c.controllerName === tag);
        if (!controller) {
          controller = {
            controllerName: tag,
            serverUrl: servers.length > 0 ? servers[0].url : "",
            apis: [],
          };
          controllers.push(controller);
        }
        const requestBodyContent = parseRequestBody(requestBody, components);
        const responseContent = Object.keys(responses)
          .filter(
            (statusCode) =>
              statusCode !== "default" &&
              responses[statusCode].content &&
              responses[statusCode].content["application/json"] &&
              responses[statusCode].content["application/json"].schema
          )
          .reduce((acc, statusCode) => {
            acc[statusCode] = parseResponseContent(
              responses[statusCode].content["application/json"].schema,
              components
            );
            return acc;
          }, {});

        const queryParameters = parameters
          .filter((param) => param.in === "query")
          .map((param) => ({
            name: param.name,
            required: param.required,
            type: param.schema ? param.schema.type : "undefined",
          }));

        const pathParameters = parameters
          .filter((param) => param.in === "path")
          .map((param) => ({
            name: param.name,
            required: param.required,
            type: param.schema ? param.schema.type : "undefined",
          }));

        const api = {
          id: path + "_" + method,
          method: method.toUpperCase(),
          path: path,
          name: summary,
          queryParameters: queryParameters.length > 0 ? queryParameters : false,
          pathParameters: pathParameters.length > 0 ? pathParameters : false,
          requestBody: requestBodyContent,
          response: responseContent,
        };

        controller.apis.push(api);
      });
    }
  }
  return controllers;
}

function parseRequestBody(requestBody, components) {
  if (!requestBody.content) return false;

  const content = requestBody.content["application/json"];
  if (!content || !content.schema) return false;

  if (content.schema.$ref) {
    return {
      required: requestBody.required || false,
      content: {
        type: resolveSchemaType(content.schema, components),
        properties: resolveSchemaProperties(content.schema.$ref, components),
      },
    };
  }

  return {
    required: requestBody.required || false,
    content: {
      type: content.schema.type,
      properties: content.schema.properties
        ? Object.keys(content.schema.properties).map((propertyName) => ({
            name: propertyName,
            type: content.schema.properties[propertyName].type,
            required: content.schema.required?.includes(propertyName) || false,
            format: content.schema.properties[propertyName].format || false,
          }))
        : [],
    },
  };
}

function parseResponseContent(schema, components) {
  if (schema.$ref) {
    return {
      content: {
        type: resolveSchemaType(schema, components),
        properties: resolveSchemaProperties(schema.$ref, components),
      },
    };
  }

  return {
    content: {
      type: schema.type,
      properties: schema.properties
        ? Object.keys(schema.properties).map((propertyName) => {
            const propertySchema = schema.properties[propertyName];
            if (propertySchema.$ref) {
              return {
                name: propertyName,
                type: resolveSchemaType(propertySchema, components),
                properties: resolveSchemaProperties(
                  propertySchema.$ref,
                  components
                ),
              };
            } else if (
              propertySchema.type === "array" &&
              propertySchema.items.$ref
            ) {
              return {
                name: propertyName,
                type: propertySchema.type,
                properties: resolveSchemaProperties(
                  propertySchema.items.$ref,
                  components
                ),
              };
            } else {
              return {
                name: propertyName,
                type: propertySchema.type,
                format: propertySchema.format || false,
              };
            }
          })
        : [],
    },
  };
}

function resolveSchemaType(schema, components) {
  if (schema.$ref) {
    const schemaName = schema.$ref.split("/").pop();
    return components.schemas[schemaName]?.type || "object";
  }
  return schema.type || "object";
}

function resolveSchemaProperties(ref, components) {
  const schemaName = ref.split("/").pop();
  const schema = components.schemas[schemaName];
  if (!schema || !schema.properties) return [];

  return Object.keys(schema.properties).map((propertyName) => {
    const propertySchema = schema.properties[propertyName];
    if (propertySchema.$ref) {
      return {
        name: propertyName,
        type: resolveSchemaType(propertySchema, components),
        properties: resolveSchemaProperties(propertySchema.$ref, components),
      };
    } else if (propertySchema.type === "array" && propertySchema.items.$ref) {
      return {
        name: propertyName,
        type: propertySchema.type,
        properties: resolveSchemaProperties(
          propertySchema.items.$ref,
          components
        ),
      };
    } else {
      return {
        name: propertyName,
        type: propertySchema.type,
        format: propertySchema.format || false,
      };
    }
  });
}

function retrieveResponseProperties(content, components) {
  if (content?.$ref) {
    return {
      content: {
        type: "object",
        properties: retrieveResponseFromRef(
          content.$ref,
          components.schemas,
          true
        ),
      },
    };
  }

  return {
    content: {
      type: content?.type,
      properties: Object.keys(content?.properties).map((propertyName) => {
        if (content.properties[propertyName]?.$ref) {
          return retrieveResponseFromRef(
            content.properties[propertyName]?.$ref,
            components.schemas
          );
        } else if (content.properties[propertyName]?.type === "array") {
          return {
            name: propertyName,
            type: content.properties[propertyName].type,
            properties: retrieveResponseFromRef(
              content.properties[propertyName].items.$ref,
              components.schemas,
              true
            ),
          };
        } else {
          return {
            name: propertyName,
            type: content.properties[propertyName].type,
            format: content.properties[propertyName].format || false,
          };
        }
      }),
    },
  };
}

function retrieveResponseFromRef(ref, schemas, topLevel = false) {
  const schemaName = ref.split("/").pop();
  const schema = schemas[schemaName];
  if (topLevel) {
    if (!schema || !schema.properties) return [];
    return Object.keys(schema.properties || {}).map((propertyName) => ({
      name: propertyName,
      type: schema.properties[propertyName].type,
      format: schema.properties[propertyName].format || false,
    }));
  }
  if (!schema || !schema.properties)
    return { name: "", type: "object", properties: [] };
  return {
    name: "",
    type: "object",
    properties: Object.keys(schema.properties || {}).map((propertyName) => ({
      name: propertyName,
      type: schema.properties[propertyName].type,
      format: schema.properties[propertyName].format || false,
    })),
  };
}

function retrievePropertiesFromRef(ref, schemas) {
  const schemaName = ref.split("/").pop();
  const schema = schemas[schemaName];
  if (!schema || !schema.properties)
    return { required: false, content: { type: "object", properties: [] } };
  return {
    required: schema?.required?.length > 0 || false,
    content: {
      type: schema?.type,
      properties: Object.keys(schema.properties || {}).map((propertyName) => ({
        name: propertyName,
        type: schema.properties[propertyName].type,
        required: schema?.required?.includes(propertyName) || false,
        format: schema.properties[propertyName].format || false,
      })),
    },
  };
}

async function fetchAndParseOpenApiJson(url) {
  try {
    const response = await fetch(url);
    const openApiJson = await response.json();
    return parseOpenApiJson(openApiJson);
  } catch (error) {
    console.error("Error fetching or parsing OpenAPI JSON:", error);
    return null;
  }
}

function getApiDataInputs(api) {
  let apiDataInputs = [];
  if (api.pathParameters) {
    api.pathParameters.map((item) => {
      apiDataInputs.push({
        Name: item.name,
        Type: item.type,
        Required: item.required,
        Location: "Path",
        Format: item.format || false,
      });
    });
  }

  if (api.queryParameters) {
    api.queryParameters.map((item) => {
      apiDataInputs.push({
        Name: item.name,
        Type: item.type,
        Required: item.required,
        Location: "Query",
        Format: item.format || false,
      });
    });
  }

  if (api.requestBody) {
    if (api.requestBody.content.type === "object") {
      api.requestBody.content.properties.map((item) => {
        apiDataInputs.push({
          Name: item.name,
          Type: item.type,
          Required: item.required,
          Location: "Body",
          Format: item.format || false,
        });
      });
    }
  }
  return apiDataInputs;
}

function getApiDataOutputs(api) {
  let apiDataOutputs = [];

  if (api.response) {
    Object.keys(api.response || {}).map((propertyName) => {
      api.response[propertyName].content.properties.map((item) => {
        if (item.type !== "object" && item.type !== "array") {
          apiDataOutputs.push({
            object: false,
            objectName: "",
            array: false,
            arrayName: "",
            name: item.name,
            type: item.type,
            format: item.format || false,
            code: propertyName,
          });
        } else if (item.type === "object") {
          item?.properties?.map((innerItem) => {
            apiDataOutputs.push({
              object: true,
              objectName: item.name,
              array: false,
              arrayName: "",
              name: innerItem.name,
              type: innerItem.type,
              format: innerItem.format || false,
              code: propertyName,
            });
          });
        } else if (item.type === "array") {
          item?.properties?.map((innerItem) => {
            apiDataOutputs.push({
              object: false,
              objectName: "",
              array: true,
              arrayName: item.name,
              name: innerItem.name,
              type: innerItem.type,
              format: innerItem.format || false,
              code: propertyName,
            });
          });
        }
      });
    });
  }

  return apiDataOutputs;
}

function generateAPIHTML(api) {
  const div = document.createElement("div");
  div.classList.add("web-api");

  const h3 = document.createElement("h3");
  h3.textContent = api.name;

  const pMethod = document.createElement("p");
  pMethod.innerHTML = `<span class="web-method">${api.method}</span>`;

  var containerDiv = document.createElement("div");
  containerDiv.id = "web-controller-split";

  //Input Data
  let tableDataInputs = getApiDataInputs(api);

  if (tableDataInputs.length < 1) {
    tableDataInputs = [
      {
        Name: "None",
        Type: "None",
        Required: "None",
        Location: "None",
        Format: "None",
      },
    ];
  }

  const tableInputs = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  Object.keys(tableDataInputs[0]).forEach((key) => {
    const th = document.createElement("th");
    th.classList.add("web-api-bold");
    th.textContent = key;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  const tbody = document.createElement("tbody");

  tableDataInputs.forEach((data) => {
    const row = document.createElement("tr");
    Object.values(data).forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });

  tableInputs.appendChild(thead);
  tableInputs.appendChild(tbody);
  tableInputs.classList.add("input-output-table");
  tableInputs.style.borderCollapse = "collapse";
  tableInputs.style.width = "100%";
  tableInputs.style.border = "1px solid #ddd";

  //Output Data
  let tableDataOutputs = getApiDataOutputs(api);

  if (tableDataOutputs.length < 1) {
    tableDataOutputs = [
      {
        Name: "None",
        Type: "None",
        Required: "None",
        Location: "None",
        Format: "None",
      },
    ];
  }

  const tableOutputs = document.createElement("table");
  const theadOutput = document.createElement("thead");
  const headerRowOutput = document.createElement("tr");
  const outputHeaders = ["Name", "Type", "Format", "Code"];
  outputHeaders.map((key) => {
    const th = document.createElement("th");
    th.classList.add("web-api-bold");
    th.textContent = key;
    headerRowOutput.appendChild(th);
  });

  theadOutput.appendChild(headerRowOutput);
  const tbodyOutput = document.createElement("tbody");

  tableDataOutputs.forEach((data, index) => {
    const row = document.createElement("tr");
    Object.values(data).forEach((value, index) => {
      if (index < 4) return;
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    tbodyOutput.appendChild(row);
  });

  tableOutputs.appendChild(theadOutput);
  tableOutputs.appendChild(tbodyOutput);

  tableOutputs.classList.add("input-output-table");
  tableOutputs.style.borderCollapse = "collapse";
  tableOutputs.style.width = "100%";
  tableOutputs.style.border = "1px solid #ddd";

  // INPUTS SECTION
  var inputSectionDiv = document.createElement("div");
  inputSectionDiv.classList.add("web-api-section");

  inputSectionDiv.innerHTML = `
  <h3>Inputs</h3>
  <div class="web-api-inputsContent">
  </div>
  `;

  inputSectionDiv
    .querySelector(".web-api-inputsContent")
    .appendChild(tableInputs);

  //OUTPUTS SECTION
  var outputSectionDiv = document.createElement("div");
  outputSectionDiv.classList.add("web-api-section");

  outputSectionDiv.innerHTML = `
    <h3>Outputs</h3>
    <div class="web-api-outputsContent">
    </div>
  `;

  outputSectionDiv
    .querySelector(".web-api-outputsContent")
    .appendChild(tableOutputs);

  // APPEND TO MAIN CONTAINER
  containerDiv.appendChild(inputSectionDiv);
  containerDiv.appendChild(outputSectionDiv);

  div.appendChild(h3);
  div.appendChild(pMethod);
  div.appendChild(containerDiv);

  return div;
}

// Function to generate HTML for a controller
function generateControllerHTML(controller) {
  // Create HTML elements dynamically
  const div = document.createElement("div");
  div.classList.add("web-controller");
  const h2 = document.createElement("h2");
  h2.textContent = controller.controllerName;
  const h4 = document.createElement("h4");
  h4.textContent = "Server Address= " + controller.serverUrl;

  // Append elements to the div
  div.appendChild(h2);
  div.appendChild(h4);

  // Loop through APIs and generate HTML for each API
  controller.apis.forEach((api) => {
    const apiHTML = generateAPIHTML(api);
    div.appendChild(apiHTML);
  });

  return div;
}

// Function to load data into HTML
function loadData(data) {
  const apiContainer = document.getElementById("web-api-container");

  // Loop through controller data and generate HTML for each controller
  data.forEach((controller) => {
    const controllerHTML = generateControllerHTML(controller);
    apiContainer.appendChild(controllerHTML);
  });
}

async function loadWebServer() {
  const apiUrl = document.getElementById("apiUrlLink").value;
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  const handleFileRead = async (file) => {
    const reader = new FileReader();
    reader.onload = async function (event) {
      try {
        const content = event.target.result;
        let jsonContent;

        try {
          // Try to parse as JSON
          jsonContent = JSON.parse(content);
        } catch (jsonError) {
          // If it fails, assume it's YAML and try to convert to JSON
          try {
            jsonContent = jsyaml.load(content);
          } catch (yamlError) {
            throw new Error("Error parsing file as JSON or YAML.");
          }
        }
        const parseApiJson = parseOpenApiJson(jsonContent);
        if (parseApiJson) {
          loadData(parseApiJson);
        } else {
          throw new Error("Failed to parse OpenAPI JSON.");
        }
      } catch (error) {
        console.error("Error processing file:", error);
      }
    };
    reader.readAsText(file);
  };

  if (file) {
    await handleFileRead(file);
  } else {
    fetchAndParseOpenApiJson(apiUrl)
      .then((parsedControllers) => {
        if (parsedControllers) {
          loadData(parsedControllers);
        } else {
          console.error("Failed to fetch or parse OpenAPI JSON.");
        }
      })
      .catch((error) => {
        console.error("Error fetching or parsing OpenAPI JSON:", error);
      });
  }
}

async function readFile(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

async function dragDropApiList(list) {
  const apiUrl = document.getElementById("apiUrlLink").value;
  const fileInput = document.getElementById("fileInput");
  let parsedControllers;

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const processFileContent = (content) => {
    try {
      return JSON.parse(content);
    } catch (jsonError) {
      try {
        return jsyaml.load(content);
      } catch (yamlError) {
        throw new Error("Error parsing file as JSON or YAML.");
      }
    }
  };

  const file = fileInput?.files[0];

  if (file) {
    try {
      const fileContent = await readFile(file);
      const parsedJson = processFileContent(fileContent);
      parsedControllers = parseOpenApiJson(parsedJson);
      updateList(list, parsedControllers);
    } catch (error) {
      console.error("Error reading or processing file:", error);
    }
  } else {
    try {
      parsedControllers = await fetchAndParseOpenApiJson(apiUrl);
      updateList(list, parsedControllers);
    } catch (error) {
      console.error("Error fetching and parsing OpenAPI JSON:", error);
    }
  }
}

function updateList(list, parsedControllers) {
  list.innerHTML = "";
  let apiList = [];
  parsedControllers?.forEach((controller) => {
    const h5 = document.createElement("h5");
    h5.textContent = controller.controllerName;
    h5.style.minWidth = "145px";
    h5.style.marginTop = "8px";
    h5.style.textAlign = "center";
    let c = 0;
    controller.apis.forEach((api) => {
      const listItem = document.createElement("div");
      listItem.id = `API_${api.id}`;
      listItem.className = "api-list-item";
      listItem.textContent = api.name;

      const apiDataInputs = getApiDataInputs(api);
      const apiDataOutputs = getApiDataOutputs(api);

      listItem.setAttribute("api-data-inputs", JSON.stringify(apiDataInputs));
      listItem.setAttribute("api-data-outputs", JSON.stringify(apiDataOutputs));
      listItem.setAttribute(
        "data-controller-controllerName",
        controller.controllerName
      );
      listItem.setAttribute("data-controller-serverUrl", controller.serverUrl);
      listItem.setAttribute("data-api-id", api.id);
      listItem.setAttribute("data-api-name", api.name);
      listItem.setAttribute("data-api-method", api.method);
      listItem.setAttribute("data-api-path", api.path);

      const apiDetailsDiv = document.createElement("div");
      listItem.appendChild(apiDetailsDiv);
      listItem.draggable = true;
      listItem.ondragstart = function (event) {
        drag(event);
      };
      listItem.onclick = function (event) {
        event.preventDefault();
        fetchApiFields(controller, api, apiDetailsDiv);
      };

      if (c === 0) list.appendChild(h5);
      list.appendChild(listItem);
      apiList.push(api.name);
      c++;
    });
  });
}

function fetchApiFields(controller, api, detailsDiv) {
  var existingItems = detailsDiv.childElementCount;
  removeAllChildNodes(detailsDiv);
  if (existingItems > 0) return;

  const apiDataInputs = getApiDataInputs(api);
  const apiDataOutputs = getApiDataOutputs(api);

  const notfound = document.createElement("h6");
  notfound.textContent = "None";
  const inputsText = document.createElement("h5");
  inputsText.textContent = "Inputs";
  const outPutsText = document.createElement("h5");
  outPutsText.style.marginTop = "8px";
  outPutsText.textContent = "Outputs";

  //inputs
  detailsDiv.appendChild(inputsText);
  if (apiDataInputs < 1) detailsDiv.appendChild(notfound);
  apiDataInputs.forEach((field) => {
    const fieldId =
      controller.controllerName +
      "_" +
      api.id +
      "_" +
      field.Name +
      "_" +
      field.Type +
      "_" +
      field.Required +
      "_" +
      field.Location +
      "_" +
      field.Format +
      "_Editor";
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "field-item";
    if (field.Required) fieldDiv.style.borderLeft = "7px solid red";
    fieldDiv.id = fieldId;
    fieldDiv.draggable = true;
    fieldDiv.ondragstart = function (event) {
      drag(event);
    };
    fieldDiv.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
    };
    fieldDiv.textContent = field.Name;
    //attributes
    fieldDiv.setAttribute(
      "data-controller-controllerName",
      controller.controllerName
    );
    fieldDiv.setAttribute("data-controller-serverUrl", controller.serverUrl);
    fieldDiv.setAttribute("data-api-id", api.id);
    fieldDiv.setAttribute("data-api-name", api.name);
    fieldDiv.setAttribute("data-api-method", api.method);
    fieldDiv.setAttribute("data-api-path", api.path);
    fieldDiv.setAttribute("title", field.Name);
    fieldDiv.setAttribute("data-field-name", field.Name);
    fieldDiv.setAttribute("data-field-kind", "inputs");
    fieldDiv.setAttribute("data-field-type", field.Type);
    fieldDiv.setAttribute("data-field-required", field.Required);
    fieldDiv.setAttribute("data-field-location", field.Location);
    fieldDiv.setAttribute("data-field-format", field.Format);
    fieldDiv.setAttribute("data-field-id", fieldId);
    detailsDiv.appendChild(fieldDiv);
  });

  //outputs
  detailsDiv.appendChild(outPutsText);
  if (apiDataOutputs < 1) detailsDiv.appendChild(notfound);
  apiDataOutputs.forEach((field) => {
    const fieldId =
      controller.controllerName +
      "_" +
      api.id +
      "_" +
      field.name +
      "_" +
      field.type +
      "_" +
      field.format +
      "_" +
      field.code +
      "_" +
      field.object +
      "_" +
      field.objectName +
      "_" +
      field.array +
      "_" +
      field.arrayName +
      "_Editor";
    const fieldDiv = document.createElement("div");
    fieldDiv.className = "field-item";

    fieldDiv.id = fieldId;
    fieldDiv.draggable = true;
    fieldDiv.ondragstart = function (event) {
      drag(event);
    };
    fieldDiv.onclick = function (event) {
      event.preventDefault();
      event.stopPropagation();
    };
    fieldDiv.textContent = field.name;
    //attributes
    fieldDiv.setAttribute(
      "data-controller-controllerName",
      controller.controllerName
    );
    fieldDiv.setAttribute("data-controller-serverUrl", controller.serverUrl);
    fieldDiv.setAttribute("data-api-id", api.id);
    fieldDiv.setAttribute("data-api-name", api.name);
    fieldDiv.setAttribute("data-api-method", api.method);
    fieldDiv.setAttribute("data-api-path", api.path);
    fieldDiv.setAttribute("title", field.name);
    fieldDiv.setAttribute("data-field-name", field.name);
    fieldDiv.setAttribute("data-field-kind", "outputs");
    fieldDiv.setAttribute("data-field-type", field.type);
    fieldDiv.setAttribute("data-field-format", field.format);
    fieldDiv.setAttribute("data-field-code", field.code);
    fieldDiv.setAttribute("data-field-object", field.object);
    fieldDiv.setAttribute("data-field-objectName", field.objectName);
    fieldDiv.setAttribute("data-field-array", field.array);
    fieldDiv.setAttribute("data-field-arrayName", field.arrayName);
    fieldDiv.setAttribute("data-field-id", fieldId);
    detailsDiv.appendChild(fieldDiv);
  });
}

function searchApi(search, contentDivID) {
  var filter = search.toUpperCase();
  var list = document.getElementById(contentDivID);
  var items = list.getElementsByClassName("api-list-item");
  for (var i = 0; i < items.length; i++) {
    var txtValue = items[i].getAttribute("data-api-name");
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      items[i].style.display = "";
    } else {
      items[i].style.display = "none";
    }
  }
}

// function to call webserver apis
async function callApi(apiUrl, apiMethod, body = {}) {
  try {
    let response;
    switch (apiMethod) {
      case "GET":
        response = await fetch(apiUrl, {
          method: "GET",
        });
        break;

      case "POST":
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        break;

      case "PUT":
        response = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        break;

      case "PATCH":
        response = await fetch(apiUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        break;

      case "Delete":
        response = await fetch(apiUrl, {
          method: "DELETE",
        });
        break;
    }
    if (!response) return;
    return response;
  } catch (error) {
    console.error("Error during calling an API:", error);
    return null;
  }
}
