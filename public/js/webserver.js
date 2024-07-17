var apiUrl;

function parseOpenApiJson(openApiJson) {
  const controllers = [];

  // Extracting servers information
  const servers = openApiJson.servers || [];

  for (const path in openApiJson.paths) {
    const pathObj = openApiJson.paths[path];

    for (const method in pathObj) {
      const methodObj = pathObj[method];

      if (method === "parameters" || method === "servers") continue; // Skip irrelevant keys

      const tags = methodObj.tags || [];
      const summary = methodObj.summary || "";
      const parameters = methodObj.parameters || [];
      const requestBody = methodObj.requestBody || {};
      const responses = methodObj.responses || {};

      tags.forEach((tag) => {
        let controller = controllers.find((c) => c.controllerName === tag);
        if (!controller) {
          controller = {
            controllerName: tag,
            serverUrl: servers.length > 0 ? servers[0].url : "",
            apis: [],
          };
          controllers.push(controller);
        }

        // Check if there is a request body
        let requestBodyContent = false;
        if (requestBody.content) {
          if (requestBody.content["application/json"].schema.$ref) {
            requestBodyContent = retrievePropertiesFromRef(
              requestBody,
              requestBody.content["application/json"].schema.$ref,
              openApiJson.components.schemas
            );
          } else {
            requestBodyContent = {
              required: requestBody?.required || false,
              content: {
                type: requestBody?.content["application/json"]?.schema?.type,
                properties: requestBody.content["application/json"].schema
                  .properties
                  ? Object.keys(
                      requestBody.content["application/json"].schema.properties
                    ).map((propertyName) => ({
                      name: propertyName,
                      type: requestBody.content["application/json"].schema
                        .properties[propertyName].type,
                      required:
                        requestBody?.content["application/json"]?.schema
                          ?.required?.length > 0
                          ? requestBody?.content[
                              "application/json"
                            ]?.schema?.required.includes(propertyName)
                          : false,
                      format:
                        requestBody.content["application/json"].schema
                          .properties[propertyName].format || false,
                    }))
                  : [],
              },
            };
          }
        }

        // Extract responses
        const responseContent = Object.keys(responses)
          .filter(
            (statusCode) =>
              statusCode !== "default" &&
              responses[statusCode].content &&
              responses[statusCode].content["application/json"] &&
              responses[statusCode].content["application/json"].schema
          )
          .reduce((acc, statusCode) => {
            acc[statusCode] = retrieveResponseProperties(
              responses[statusCode].content["application/json"].schema,
              openApiJson
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

function retrieveResponseProperties(content, openApiJson) {
  if (content?.$ref) {
    return {
      content: {
        type: "object",
        properties: retrieveResponseFromRef(
          content,
          content.$ref,
          openApiJson.components.schemas,
          null,
          true
        ),
      },
    };
  }

  return {
    content: {
      type: content?.type,
      properties: Object.keys(content?.properties).map((propertyName) => {
        if (content.properties[propertyName]?.$ref)
          return retrieveResponseFromRef(
            content,
            content.properties[propertyName]?.$ref,
            openApiJson.components.schemas,
            propertyName
          );
        else if (content.properties[propertyName]?.type === "array")
          return {
            name: propertyName,
            type: content.properties[propertyName].type,
            properties: retrieveResponseFromRef(
              content,
              content.properties[propertyName].items.$ref,
              openApiJson.components.schemas,
              null,
              true
            ),
          };
        else
          return {
            name: propertyName,
            type: content.properties[propertyName].type,
            format: content.properties[propertyName].format || false,
          };
      }),
    },
  };
}

function retrieveResponseFromRef(
  content,
  ref,
  schemas,
  propertyName,
  topLevel = false
) {
  const schemaName = ref.split("/").pop();
  const schema = schemas[schemaName];
  if (topLevel) {
    if (!schema || !schema.properties) return;
    [];
    return Object.keys(schema.properties || {}).map((propertyName) => ({
      name: propertyName,
      type: schema.properties[propertyName].type,
      format: schema.properties[propertyName].format || false,
    }));
  }
  if (!schema || !schema.properties)
    return {
      name: propertyName,
      type: "object",
      properties: [],
    };
  return {
    name: propertyName,
    type: "object",
    properties: Object.keys(schema.properties || {}).map((propertyName) => ({
      name: propertyName,
      type: schema.properties[propertyName].type,
      format: schema.properties[propertyName].format || false,
    })),
  };
}

function retrievePropertiesFromRef(reqB, ref, schemas) {
  const schemaName = ref.split("/").pop();
  const schema = schemas[schemaName];
  if (!schema || !schema.properties)
    return {
      required: false,
      content: {
        type: "object",
        properties: [],
      },
    };
  return {
    required: schema?.required?.length > 0 ? true : false,
    content: {
      type: schema?.type,
      properties: Object.keys(schema.properties || {}).map((propertyName) => ({
        name: propertyName,
        type: schema.properties[propertyName].type,
        required:
          schema?.required?.length > 0
            ? schema?.required.includes(propertyName)
            : false,
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
          item.properties.map((innerItem) => {
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
          item.properties.map((innerItem) => {
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

// Function load web server and populate tables when button is clicked
function loadWebServer() {
  apiUrl=document.getElementById("apiUrlLink").value
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0]; 

  if (file) {
    const reader = new FileReader();
    reader.onload =async function(event) {
      const fileContent = JSON.parse(event.target.result);
      const parseApiJson= parseOpenApiJson(fileContent);
      if(parseApiJson){
        loadData(parseApiJson);
      } else{
        console.error("Failed to fetch or parse OpenAPI JSON.");
      }

    };
    reader.readAsText(file);
  }else{
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
    reader.onload = event => resolve(event.target.result);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}

// function to create the api selection list on editor screen
async function dragDropApiList(list) {
  var parsedControllers;
  const fileInput = document.getElementById("fileInput");
  const file = fileInput?.files[0];
  if (file) {
    try {
      const fileContent = await readFile(file);
      const parsedJson = JSON.parse(fileContent);
      parsedControllers = parseOpenApiJson(parsedJson);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  } else {
    try {
      parsedControllers = await fetchAndParseOpenApiJson(apiUrl);
    } catch (error) {
      console.error("Error fetching and parsing OpenAPI JSON:", error);
    }}          
      list.innerHTML = "";

      apiList = [];
      var i = 0;
      parsedControllers.forEach((controller) => {
        const h5 = document.createElement("h5");
        h5.textContent = controller.controllerName;
        h5.style.minWidth = "145px";
        h5.style.marginTop = "8px";
        h5.style.textAlign = "center";
        var c = 0;
        controller.apis.forEach((api) => {
          var listItem = document.createElement("div");

          listItem.id = `API_${api.id}`;

          listItem.className = "api-list-item";

          listItem.textContent = api.name;
          const apiDataInputs = getApiDataInputs(api);
          const apiDataOutputs = getApiDataOutputs(api);
          listItem.setAttribute('api-data-inputs',JSON.stringify(apiDataInputs));
          listItem.setAttribute('api-data-outputs',JSON.stringify(apiDataOutputs));
          listItem.setAttribute(
            "data-controller-controllerName",
            controller.controllerName
          );
          listItem.setAttribute(
            "data-controller-serverUrl",
            controller.serverUrl
          );
          listItem.setAttribute("data-api-id", api.id);
          listItem.setAttribute("data-api-name", api.name);
          listItem.setAttribute("data-api-method", api.method);
          listItem.setAttribute("data-api-path", api.path);
          var apiDetailsDiv = document.createElement("div");

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
          i++;
          c++;
        });
      });
    // })
    // .catch((error) => console.error("Error:", error));
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
  console.log("API Call " + apiUrl);
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
