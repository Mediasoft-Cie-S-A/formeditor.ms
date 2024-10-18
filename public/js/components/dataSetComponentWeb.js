/*
 * Copyright (c) 2023 Mediasoft & Cie S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function createElementDataSetWeb(type) {
  var main = document.createElement("div");
  main.className = "form-container";
  main.id = type + Date.now();
  main.style.minHeight = "50px";
  main.draggable = true;
  main.tagName = type;
  const list = document.getElementById("ContentTableList");
  const detailsDiv = document.getElementById("tableDetails");

  return main;
}

function editElementDataSetWeb(type, element, content) {
  const button = document.createElement("button");
  button.textContent = "update";
  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    updateDataSetWeb(main, content);
  };
  content.appendChild(button);
  content.appendChild(
    createMultiSelectItemWeb("Data", "Array-Outputs", "data", false)
  );
  content.appendChild(createMultiSelectItemWeb("Data", "Id", "data", true));
  content.appendChild(createSelectApiWeb("Data", "CreateApi"));
  content.appendChild(createSelectApiWeb("Data", "GetById"));
  content.appendChild(createSelectApiWeb("Data", "UpdateById"));
  // load the data
  // check if jsonData is not empty
  if (element.getAttribute("dataSet") != null) {
    var target = content.querySelectorAll("#Data")[0];
    var jsonData = JSON.parse(element.getAttribute("dataSet"));
    jsonData.forEach((fieldJson) => {
      if (fieldJson.fieldType !== "rowid")
        addFieldToPropertiesBarWeb(target, fieldJson);
    });

    var target1 = content.querySelectorAll("#Data")[1];
    var jsonData = JSON.parse(element.getAttribute("dataSet"));
    jsonData.forEach((fieldJson) => {
      if (fieldJson.fieldType == "rowid")
        addFieldToPropertiesBarWeb(target1, fieldJson);
    });

    var target2 = content.querySelectorAll("#Data")[2];
    const createApiDiv = element.querySelector("div[create-api]");
    var createApi = JSON.parse(createApiDiv.getAttribute("create-api"));
    if (createApi != null) {
      addApiToPropertiesBarWeb(target2, createApi, "CreateApi");
    }
    var target3 = content.querySelectorAll("#Data")[3];
    const getByIdDiv = element.querySelector("div[get-by-id]");
    var getById = JSON.parse(getByIdDiv.getAttribute("get-by-id"));
    if (getById != null) {
      addApiToPropertiesBarWeb(target3, getById, "GetById");
    }
    var target4 = content.querySelectorAll("#Data")[4];
    const updateByIdDiv = element.querySelector("div[update-by-id]");
    var getById = JSON.parse(updateByIdDiv.getAttribute("update-by-id"));
    if (getById != null) {
      addApiToPropertiesBarWeb(target4, getById, "UpdateById");
    }
  }
}

function updateDataSetWeb(main, content) {
  // get all the span elements from data
  var data = content.querySelectorAll('span[name="dataContainer"]');
  if (data.length == 0) return; // no data to update
  //get id for Update
  var dataId = content.querySelectorAll('span[name="dataContainerId"]');

  var dataGetById = content.querySelectorAll(
    'span[name="dataContainerGetById"]'
  );
  var dataUpdateById = content.querySelectorAll(
    'span[name="dataContainerUpdateById"]'
  );
  var dataCreateApi = content.querySelectorAll(
    'span[name="dataContainerCreateApi"]'
  );
  var getById = {};
  var updateById = {};
  var createApi = {};

  try {
    createApi = JSON.parse(dataCreateApi[0].getAttribute("data-field"));
  } catch {}
  try {
    getById = JSON.parse(dataGetById[0].getAttribute("data-field"));
    updateById = JSON.parse(dataUpdateById[0].getAttribute("data-field"));
  } catch {
    getById = {};
    updateById = {};
  }

  var firstJson;
  // get the first span element
  if (dataId.length > 0)
    firstJson = JSON.parse(dataId[0].getAttribute("data-field"));
  else firstJson = JSON.parse(data[0].getAttribute("data-field"));

  // generate the json of all the data
  var jsonData = [
    {
      controllerControllerName: firstJson.controllerControllerName,
      apiId: firstJson.apiId,
      fieldId: `${main.id}_${firstJson.fieldId}`,
      fieldName: firstJson.fieldName,
      fieldArrayName: firstJson.fieldArrayName,
      fieldArray: firstJson.fieldArray,
      fieldType: "rowid",
      fieldDataType: "rowid",
      fieldLabel: "rowid",
      fieldMandatory: "0",
      fieldWidth: "0",
      fieldDefaultValue: "0",
      fieldValues: "",
      fieldSQL: "",
    },
  ];

  data.forEach((span) => {
    // get the json data from the span
    var json = JSON.parse(span.getAttribute("data-field"));
    // add the field to the json
    json.fieldId = `${main.id}_${json.fieldId}`;
    jsonData.push(json);
  });
  main.setAttribute("dataSet", JSON.stringify(jsonData));
  main.setAttribute(
    "data-api-url",
    firstJson.controllerServerUrl + firstJson.apiPath.slice(1)
  );
  main.setAttribute("data-api-method", firstJson.apiMethod);
  main.setAttribute("data-api-id", firstJson.apiId);
  renderDataSetWeb(main, getById, updateById, createApi);
}

function renderDataSetWeb(main, getById, updateById, createApi) {
  main.innerHTML = "";
  main.style.height = "200px";
  // get the data from the main
  var jsonData = JSON.parse(main.getAttribute("dataSet"));
  var apiUrl = main.getAttribute("data-api-url");
  var apiMethod = main.getAttribute("data-api-method");
  var apiId = main.getAttribute("data-api-id");
  // generate the div for the dataset
  var dataset = document.createElement("div");
  dataset.id = "DataSetWeb_" + apiId;
  dataset.className = "dataSetContainer";
  jsonData.forEach((fieldJson) => {
    var createField = createFieldFromJsonWeb(fieldJson, apiUrl);
    dataset.appendChild(createField);
  });
  main.appendChild(dataset);
  main.appendChild(
    createNavigationBarWeb(
      apiUrl,
      apiMethod,
      jsonData,
      apiId,
      getById,
      updateById,
      createApi
    )
  );
  moveFirstWeb(apiUrl, apiMethod, apiId);
}

function createFieldFromJsonWeb(fieldJson, apiUrl) {
  var element = null;
  if (fieldJson.fieldType) {
    switch (fieldJson.fieldType) {
      case "combo_array":
      case "array":
        element = createElementInput(fieldJson.fieldType);
        einput = element.querySelector("input"); // Adjust to your combobox selector
        einput.style.display = "none";
        break;
      case "sequence":
        element = createElementInput(fieldJson.fieldType);
        einput = element.querySelector("input"); // Adjust to your combobox selector
        break;
      case "combo_sql":
        element = createElementInput(fieldJson.fieldType);
        einput = element.querySelector("input"); // Adjust to your combobox selector
        break;
      //for different field formats
      case "rowid":
        element = createElementInput("hidden");
        einput = element.querySelector("input");
        element.style.display = "none";
        break;

      case "number":
      case "float":
      case "double":
      case "decimal":
        element = createElementInput("number");
        einput = element.querySelector("input");
        break;
      case "string":
        element = createElementInput("text");
        einput = element.querySelector("input");
        break;
      default:
        // Handle default case or unknown field formats
        element = createElementInput("text");
        einput = element.querySelector("input");
        break;
    }
  }

  if (element !== undefined && element !== null) {
    element.style.maxWidth = "500px";
    // get label from the element
    var label = element.querySelector("label");
    // if the label exists set the text
    if (label !== null) label.textContent = fieldJson.fieldName;
    // set the input attributes
    einput.id = fieldJson.fieldId;
    einput.setAttribute("dataset-field-values", fieldJson.fieldValues);
    einput.setAttribute("dataset-field-name", fieldJson.fieldName);
    einput.setAttribute("dataset-field-SQL", fieldJson.fieldSQL);
    einput.setAttribute("apiUrl", apiUrl);
    // currently no attribute is required separately
    // einput.setAttribute("dataset-table-name", fieldJson.tableName);
    // currently outputs does not have a mandatory attribute
    // if (fieldJson.fieldMandatory) {
    //   einput.required = true;
    // }
  }
  return element;
}

// --- internal functions ---
function createNavigationBarWeb(
  apiUrl,
  apiMethod,
  jsonData,
  apiId,
  getById,
  updateById,
  createApi
) {
  console.log("createNavigationBarWeb");
  // Create the navigation bar div
  var navigationBar = document.createElement("div");
  navigationBar.id = "navigationBar_" + apiId;
  navigationBar.type = "navigation-bar";
  navigationBar.className = "navigation-bar";
  navigationBar.setAttribute("data-current-row", "0");
  navigationBar.setAttribute("data-current-length", "0");
  navigationBar.setAttribute("data-api-url", apiUrl);
  navigationBar.setAttribute("data-api-method", apiMethod);
  navigationBar.setAttribute("data-api-id", apiId);
  navigationBar.setAttribute("get-by-id", JSON.stringify(getById));
  navigationBar.setAttribute("update-by-id", JSON.stringify(updateById));
  navigationBar.setAttribute("create-api", JSON.stringify(createApi));

  navigationBar.innerHTML = '<div class="navigation-bar-title">record: </div>';
  // Create buttons and append them to the navigation bar
  var buttons = [
    {
      name: "firstDSBtn",
      title: "First",
      text: '<i class="bi bi-arrow-up-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "moveFirstWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
    },
    {
      name: "PreviusDSBtn",
      title: "Previus",
      text: '<i class="bi bi-arrow-left-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "movePrevWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
    },
    {
      name: "NextDSBtn",
      title: "Next",
      text: '<i class="bi bi-arrow-right-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "moveNextWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
    },
    {
      name: "LastDSBtn",
      title: "Last",
      text: '<i class="bi bi-arrow-down-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "moveLastWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
    },
    {
      name: "EditDSBtn",
      title: "Edit Record",
      text: '<i class="bi bi-credit-card-2-front" style="color:blue;margin-left:-6px"></i>',
      event: "EditRecordWeb('" + apiId + "')",
    },
    {
      name: "InsertDSBtn",
      title: "Create Record",
      text: '<i class="bi bi-sticky-fill" style="color:green;margin-left:-6px"></i>',
      event: "InsertRecordWeb('" + apiId + "')",
    },
    {
      name: "SaveDSBtn",
      title: "Save Record",
      text: '<i class="bi bi-sim-fill" style="color:red;margin-left:-6px"></i>',
      event: "SaveRecordWeb('" + apiId + "')",
    },
    {
      name: "RefreshDSBtn",
      title: "Refresh Data",
      text: '<i class="bi bi-arrow-clockwise" style="color:green;margin-left:-6px"></i>',
      event: "RefreshRecordWeb('" + apiId + "')",
    },
  ];
  var htm = "";
  //for the dom2json is mandatory to create a html for the events
  buttons.forEach((buttonInfo) => {
    htm += `<button name='${buttonInfo.name}'  title="${
      buttonInfo.title
    }" onclick="${buttonInfo.event.trim()}" style="width:30px;">${
      buttonInfo.text
    }</button>`;
  });
  navigationBar.innerHTML +=
    '<div class="navigation-bar-buttons">' + htm + "</div>";
  // Append the navigation bar to the body or another element in your document
  return navigationBar;
}

async function linkRecordToGridWeb(selectedData, record) {
  try {
    let idObject = getIdObject();
    const main = document.getElementById(idObject.dataSetWeb);
    const jsonData = JSON.parse(main.getAttribute("dataSet"));
    const apiId = jsonData[0].apiId;
    const data = { data: [selectedData] };
    updateInputsWeb(data, jsonData, apiId, 0);
    setRowNumWeb(apiId, record);
  } catch {}
}

//--- data set navigation ---
async function moveFirstWeb(apiUrl, apiMethod, apiId) {
  console.log("DataSetWeb Move First");
  const dataSetId = "DataSetWeb_" + apiId;
  const dataSet = document.getElementById(dataSetId);
  const main = dataSet.parentNode;
  const apiFilter = main.getAttribute("apiFilter");
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  if (!apiUrl) return;
  const data = await apiData(apiUrl, apiMethod, apiFilter);
  if (!data) return;
  updateInputsWeb(data, jsonData, apiId, 0);
  setDataLength(apiId, data[jsonData[1].fieldArrayName].length);
  setRowNumWeb(apiId, 0);
}

async function moveLastWeb(apiUrl, apiMethod, apiId) {
  console.log("DataSetWeb Move Last");
  const dataSetId = "DataSetWeb_" + apiId;
  const dataSet = document.getElementById(dataSetId);
  const main = dataSet.parentNode;
  const apiFilter = main.getAttribute("apiFilter");
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  if (!apiUrl) return;
  const data = await apiData(apiUrl, apiMethod, apiFilter);
  if (!data) return;
  let length;
  const searchFilter = apiFilter?.split("|");
  if (searchFilter?.length < 3 || apiFilter == false) {
    length = getDataLength(apiId);
  } else {
    length = data?.data?.length;
  }
  // if(fromInsertRecord) length = data[jsonData[1].fieldArrayName].length;
  updateInputsWeb(data, jsonData, apiId, length - 1);
  setRowNumWeb(apiId, length - 1);
  setDataLength(apiId, data[jsonData[1].fieldArrayName].length);
}

async function movePrevWeb(apiUrl, apiMethod, apiId) {
  const row = getRowNumWeb(apiId);
  if (row === 0) return;
  const dataSetId = "DataSetWeb_" + apiId;
  const dataSet = document.getElementById(dataSetId);
  const main = dataSet.parentNode;
  const apiFilter = main.getAttribute("apiFilter");
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  if (!apiUrl) return;
  const data = await apiData(apiUrl, apiMethod, apiFilter);
  if (!data) return;
  updateInputsWeb(data, jsonData, apiId, row - 1);
  setRowNumWeb(apiId, row - 1);
  setDataLength(apiId, data[jsonData[1].fieldArrayName].length);
}

async function moveNextWeb(apiUrl, apiMethod, apiId) {
  console.log("DataSetWeb Move Next");
  const row = getRowNumWeb(apiId);
  const length = getDataLength(apiId);
  if (row === length - 1) return;
  const dataSetId = "DataSetWeb_" + apiId;
  const dataSet = document.getElementById(dataSetId);
  const main = dataSet.parentNode;
  const apiFilter = main.getAttribute("apiFilter");
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  if (!apiUrl) return;
  const data = await apiData(apiUrl, apiMethod, apiFilter);
  if (!data) return;
  updateInputsWeb(data, jsonData, apiId, row + 1);
  setRowNumWeb(apiId, row + 1);
  setDataLength(apiId, data[jsonData[1].fieldArrayName].length);
}

async function apiData(apiUrl, apiMethod, apiFilter = false) {
  const response = await callApi(apiUrl, apiMethod);
  if (!response || response.status !== 200) return;
  const data = await response.json();
  if (apiFilter != false && data?.data) {
    try {
      const searchFilter = apiFilter.split("|");
      if (searchFilter.length < 3) {
        throw new Error(
          "Invalid filter format. Expected format: 'field|operator|value'."
        );
      }
      const [field, operator, value] = searchFilter;
      const operatorMap = {
        eq: (a, b) => a === b,
        lt: (a, b) => a < b,
        lte: (a, b) => a <= b,
        gt: (a, b) => a > b,
        gte: (a, b) => a >= b,
        like: (a, b) =>
          a.toString().toLowerCase().includes(b.toString().toLowerCase()),
      };
      if (!operatorMap.hasOwnProperty(operator)) {
        throw new Error(`Invalid operator: ${operator}`);
      }
      data.data = data.data.filter((item) => {
        const fieldValue = item[field];
        if (fieldValue == null) {
          return false;
        }
        let processedFieldValue;
        let processedValue;
        const isFieldDate = !isNaN(Date.parse(fieldValue));
        const isValueDate = !isNaN(Date.parse(value));
        if (isFieldDate && isValueDate) {
          processedFieldValue = new Date(fieldValue);
          processedValue = new Date(value);
          return operatorMap[operator](
            processedFieldValue.getTime(),
            processedValue.getTime()
          );
        } else if (!isNaN(fieldValue) && !isNaN(value)) {
          processedFieldValue = parseFloat(fieldValue);
          processedValue = parseFloat(value);
          return operatorMap[operator](processedFieldValue, processedValue);
        } else if (
          typeof fieldValue === "string" &&
          typeof value === "string"
        ) {
          processedFieldValue = fieldValue.toString();
          processedValue = value.toString();
          return operatorMap[operator](processedFieldValue, processedValue);
        } else if (operator === "like") {
          processedFieldValue = fieldValue.toString();
          processedValue = value.toString();
          return operatorMap[operator](processedFieldValue, processedValue);
        }
        return false;
      });
    } catch {}
  }
  return data;
}

function EditRecordWeb(apiId, handle = false) {
  console.log("Edit Input");
  const dataSetId = "#DataSetWeb_" + apiId;
  const escapedDateSetId = dataSetId.replace(/\//g, "\\/");
  const datasets = document.querySelectorAll(escapedDateSetId);
  datasets.forEach((dataset) => {
    const inputs = dataset.querySelectorAll("input");
    inputs.forEach((input) => {
      input.readOnly = handle;
    });
  });
}

async function InsertRecordWeb(apiId) {
  console.log("Create new Record Web");
  const dataSetId = "DataSetWeb_" + apiId;
  const dataSet = document.getElementById(dataSetId);
  const main = dataSet.parentNode;
  const jsonData = JSON.parse(main.getAttribute("dataSet"));

  const navBar = document.getElementById("navigationBar_" + apiId);
  const createApi = JSON.parse(navBar.getAttribute("create-api"));
  const apiMethod = createApi.apiMethod;
  var apiUrl = createApi.controllerServerUrl + createApi.apiPath.slice(1);

  let fieldData = {};
  let payload = {};

  jsonData.map((field, index) => {
    if (index === 0) return;
    const fieldIdTemp = "#" + field.fieldId;
    let escapedFieldId = fieldIdTemp.replace(/\//g, "\\/");
    escapedFieldId = escapedFieldId.replace(/\ /g, "\\ ");
    const inputs = document.querySelectorAll(escapedFieldId);
    let input = inputs[0];
    if (inputs.length > 1) input = inputs[1];
    const name = field.fieldName;
    const fieldValue = input.value;
    fieldData[name] = fieldValue;
  });
  const filteredBody = createApi.apiDataInputs.filter(
    (item) => item.Location === "Body"
  );
  filteredBody.map((item) => {
    const val = findValue(fieldData, item.Name);
    if (val) payload[item.Name] = val;
  });

  const responseCreateApi = await callApi(apiUrl, apiMethod, payload);
  if (!responseCreateApi || responseCreateApi.status !== 200) return;

  const getAllApiUrl = navBar.getAttribute("data-api-url");
  const getAllApiMethod = navBar.getAttribute("data-api-method");
  moveLastWeb(getAllApiUrl, getAllApiMethod, apiId, true);
}
async function SaveRecordWeb(apiId) {
  console.log("DataSetWeb Update");
  const dataSetId = "DataSetWeb_" + apiId;
  const dataSet = document.getElementById(dataSetId);
  const main = dataSet.parentNode;
  const jsonData = JSON.parse(main.getAttribute("dataSet"));
  const input = document.getElementById(jsonData[0].fieldId);
  const rowId = input.value;
  if (!rowId) return;
  const navBar = document.getElementById("navigationBar_" + apiId);
  const getById = JSON.parse(navBar.getAttribute("get-by-id"));
  const apiMethod = getById.apiMethod;
  var apiUrl = getById.controllerServerUrl + getById?.apiPath?.slice(1);
  const replaceString = "{" + getById.apiDataInputs[0].Name + "}";
  apiUrl = apiUrl.replace(replaceString, rowId);
  if (!apiUrl) return;
  const responseGetById = await callApi(apiUrl, apiMethod);
  if (!responseGetById || responseGetById.status !== 200) return;
  let dataGetById = await responseGetById.json();
  jsonData.map((field, index) => {
    if (index === 0) return;
    const input = document.getElementById(field.fieldId);
    const val = input.value;
    if (!val) return;
    dataGetById[field.fieldArrayName][field.fieldName] = val;
  });

  const updateById = JSON.parse(navBar.getAttribute("update-by-id"));
  const apiMethodUpdate = updateById.apiMethod;

  var apiUrlUpdate =
    updateById.controllerServerUrl + updateById.apiPath.slice(1);
  const replaceStringUpdate = "{" + updateById.apiDataInputs[0].Name + "}";
  apiUrlUpdate = apiUrlUpdate.replace(replaceStringUpdate, rowId);

  const filteredBody = updateById.apiDataInputs.filter(
    (item) => item.Location === "Body"
  );

  let payload = {};

  filteredBody.map((item) => {
    const val = findValue(dataGetById, item.Name);
    if (val) payload[item.Name] = val;
  });

  if (!apiUrlUpdate) return;
  const responseUpdateById = await callApi(
    apiUrlUpdate,
    apiMethodUpdate,
    payload
  );
  if (!responseUpdateById || responseUpdateById.status !== 200) return;
  let dataUpdateById = await responseUpdateById.json();

  EditRecordWeb(apiId, true);

  let idObject = getIdObject();
  if (idObject?.dataGridWeb) {
    let filedName = "";
    let operator = "";
    let searchValue = "";
    if (idObject?.dataSearchWeb) {
      const grid = document.getElementById(idObject?.dataSearchWeb);
      const filter = grid.getAttribute("filter")?.split("|");
      if (filter) {
        filedName = filter[0];
        operator = filter[1];
        searchValue = filter[2];
      }
    }
    searchGridWeb(filedName, operator, searchValue, idObject.dataGridWeb);
  }
}

async function RefreshRecordWeb(apiId) {
  console.log("DataSetWeb Refresh ");
  const row = getRowNumWeb(apiId);
  const dataSetId = "DataSetWeb_" + apiId;
  const dataSet = document.getElementById(dataSetId);
  const main = dataSet.parentNode;
  const jsonData = JSON.parse(main.getAttribute("dataSet"));

  const navBar = document.getElementById("navigationBar_" + apiId);
  const apiUrl = navBar.getAttribute("data-api-url");
  const apiMethod = navBar.getAttribute("data-api-method");
  const response = await callApi(apiUrl, apiMethod);
  if (!response || response.status !== 200) return;
  const data = await response.json();
  if (!data) return;
  updateInputsWeb(data, jsonData, apiId, row);
}

function findValue(obj, key) {
  if (typeof obj !== "object" || obj === null) {
    return undefined;
  }

  if (key in obj) {
    return obj[key];
  }

  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      const value = findValue(obj[prop], key);
      if (value !== undefined) {
        return value;
      }
    }
  }

  return undefined;
}

function updateInputsWeb(data, jsonData, apiId, row) {
  console.log("Update Inputs");
  const dataSetId = "#DataSetWeb_" + apiId;
  const escapedDateSetId = dataSetId.replace(/\//g, "\\/");
  const datasets = document.querySelectorAll(escapedDateSetId);

  datasets.forEach((dataset) => {
    const inputs = dataset.querySelectorAll("input");
    inputs.forEach((input) => {
      const fieldData = jsonData.filter((field) => field.fieldId === input.id);
      const fieldLabel = input.getAttribute("dataset-field-name");
      if (fieldData.length < 1) return;
      let fieldValue = getFieldValue(fieldData[0], data, row);
      if (fieldData[0].fieldFormat === "date-time") {
        fieldValue = fieldValue.split("T")[0];
      }
      const fieldType = input.getAttribute("type");
      input.value = "";
      input.readOnly = true;

      if (fieldType === "array") {
        input.style.display = "none";
        let fieldId = input.getAttribute("dataset-field-name");

        // Remove existing field container
        let existingFieldContainer = document.getElementById(fieldId);
        if (existingFieldContainer) {
          existingFieldContainer.parentElement.removeChild(
            existingFieldContainer
          );
        }

        // Create a new container for the checkboxes
        let fieldContainer = document.createElement("div");
        fieldContainer.style.height = "auto";
        fieldContainer.style.maxWidth = "100%";
        fieldContainer.style.display = "flex";
        fieldContainer.style.flexDirection = "column";
        fieldContainer.style.flexWrap = "wrap";
        fieldContainer.className = "subFieldContainer";
        fieldContainer.id = fieldId;
        input.parentElement.appendChild(fieldContainer);
        let labelsvalues = input.getAttribute("dataset-field-values");
        let labels = labelsvalues.split(",");

        // Function to render subfields as checkboxes
        function renderSubFields(subField, fieldId, fieldValue) {
          fieldContainer.innerHTML = "";

          subField.forEach((val, index) => {
            let checkboxWrapper = document.createElement("div");
            checkboxWrapper.style.display = "flex";
            checkboxWrapper.style.alignItems = "center";
            checkboxWrapper.style.justifyContent = "space-between";
            checkboxWrapper.style.width = "140px";
            checkboxWrapper.style.marginBottom = "10px";

            let label = document.createElement("label");
            label.htmlFor = `checkbox_${index}`;
            label.innerText =
              labels[index] === undefined || labels[index] === "undefined"
                ? input.getAttribute("dataset-field-name") + "__" + index
                : labels[index];

            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `checkbox_${index}`;
            checkbox.checked = val != 0;
            checkbox.style.marginLeft = "1px";

            checkbox.addEventListener("click", (event) => {
              const isChecked = event.target.checked;
              subField[index] = isChecked ? 1 : 0;

              fieldValue = subField.join(";");
              input.value = fieldValue;
              input.disabled = false;

              // Re-render the subfields after the update
              renderSubFields(subField, fieldId, fieldValue);

              console.log(`Updated sequence for ${fieldId}:`, fieldValue);
            });

            checkboxWrapper.appendChild(label);
            checkboxWrapper.appendChild(checkbox);
            fieldContainer.appendChild(checkboxWrapper);
          });
        }

        // Function to handle initial setup of subfields
        function setupSubFields(fieldValue, fieldId, data) {
          let subField = fieldValue?.toString().trim().split(";");
          if (subField.length >= 1) {
            let arrayType = subField.every(
              (item) =>
                item === true || item === false || item == 0 || item == 1
            );
            if (arrayType) {
              renderSubFields(subField, fieldId, fieldValue);
            } else {
              subField.forEach((val, index) => {
                let fieldJson = {
                  fieldDataType: input.getAttribute("data-field-type"), // fixed typo: "dataset-field-type" to "data-field-type"
                  fieldDefaultValue: val,
                  fieldLabel:
                    labels[index] === undefined || labels[index] === "undefined"
                      ? input.getAttribute("dataset-field-name") + "__" + index
                      : labels[index],
                  fieldMandatory: "0",
                  fieldName:
                    input.getAttribute("dataset-field-name") + "__" + index,
                  fieldWidth: "1",
                  tableName: input.getAttribute("data-table-name"), // fixed typo: "dataset-table-name" to "data-table-name"
                };

                let createField = createFieldFromJson(fieldJson);
                createField.style.display = "flex";
                createField.style.maxWidth = "180px";
                createField.style.alignItems = "center";
                createField.style.justifyContent = "space-between";
                let childInput = createField.querySelector("input");

                if (childInput) {
                  childInput.value = val;
                  childInput.style.maxWidth = "60px";
                  childInput.style.marginLeft = "8px";
                  childInput.readOnly = true;
                }
                fieldContainer.appendChild(createField);
              });
            }
          }
        }

        // Initial setup
        setupSubFields(fieldValue, fieldId, data?.data);
      } else if (fieldType === "combo_array") {
        let fieldvalues = input.getAttribute("dataset-field-values");
        handleSelectFieldWeb(input, fieldvalues, fieldValue);
      } else if (fieldType === "combo_sql") {
        let fieldSQL = input.getAttribute("dataset-field-SQL");
        handleSelectFieldSQLWeb(input, fieldSQL, fieldLabel);
      } else {
        if (!fieldValue) return;
        input.value = fieldValue.toString().trim();
        input.disabled = false;
      }

      dataset.parentElement.querySelector("[name=SaveDSBtn]").disabled = false;
    });
  });
}

async function handleSelectFieldSQLWeb(input, SQL, fieldLabel, selectedValue) {
  if (!input) return;
  // Check if a select element already exists, else create it
  let selectElement = input.parentElement.querySelector("select");
  let apiUrl = input.getAttribute("apiUrl");
  if (!selectElement) {
    if (!apiUrl) return;
    const data = await callApi(SQL, "GET");
    if (!data) return;
    // convert the options to an array by fieldLabel
    let options = data?.map((row) => row[fieldLabel]);
    selectElement = document.createElement("select");
    // Add options to the select element
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      if (typeof option === "object") {
        optionElement.value = option.value;
        optionElement.text = option.text;
      } else {
        optionElement.value = option;
        optionElement.text = option;
      }
      selectElement.appendChild(optionElement);
    });
    selectElement.setAttribute(
      "dataset-field-name",
      input.getAttribute("dataset-field-name")
    );
    selectElement.name = input.name;
    selectElement.className = input.className;
    input.parentElement.appendChild(selectElement);
    input.style.display = "none"; // Hide the original input

    // Add an event listener to sync the select value with the hidden input field
    selectElement.addEventListener("change", () => {
      input.value = selectElement.value; // Update the hidden input with the select's value
      input.dispatchEvent(new Event("input")); // Trigger input event for change detection
    });
    // Set the value of the select element
    selectElement.value = selectedValue || "";
    selectElement.disabled = true;
    // Enable the select field
    // Initially sync the input field with the selected value
    input.value = selectElement.value || "";
    input.dispatchEvent(new Event("input")); // Trigger input event for change detection
  }
  // Set the value of the select element
  selectElement.value = selectedValue || "";
  selectElement.disabled = true;
  // Enable the select field
  // Initially sync the input field with the selected value
  input.value = selectElement.value || "";
  input.dispatchEvent(new Event("input")); // Trigger input event for change detection
}

function handleSelectFieldWeb(input, options, selectedValue) {
  if (!input) return;
  // Convert the options to an array
  options = options.split(",");
  // Check if a select element already exists, else create it
  let selectElement = input.parentElement.querySelector("select");
  if (!selectElement) {
    selectElement = document.createElement("select");
    // Add options to the select element
    options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.text = option;
      // Set the selected attribute if the option matches the selectedValue
      if (option === selectedValue) {
        optionElement.selected = true; // Mark this option as selected
      }

      selectElement.appendChild(optionElement);
    });

    // Set attributes for the select element
    selectElement.setAttribute(
      "dataset-field-name",
      input.getAttribute("dataset-field-name")
    );
    selectElement.name = input.name;
    selectElement.className = input.className;

    // Append the select element to the DOM and hide the original input
    input.parentElement.appendChild(selectElement);
    input.style.display = "none"; // Hide the original input
  }

  // Add an event listener to sync the select value with the hidden input field
  selectElement.addEventListener("change", () => {
    input.value = selectElement.value; // Update the hidden input with the select's value
    input.dispatchEvent(new Event("input")); // Trigger input event for change detection
  });

  // Explicitly set the select element's value to the selectedValue
  selectElement.value = selectedValue || "";

  // Initially sync the input field with the selected value
  input.value = selectElement.value || "";
  input.dispatchEvent(new Event("input")); // Trigger input event for change detection
}

function getFieldValue(fieldData, data, row) {
  if (fieldData.fieldArray === "true") {
    return data[fieldData.fieldArrayName][row][fieldData.fieldName];
  }
}

function setDataLength(apiId, length) {
  navbar = document.getElementById("navigationBar_" + apiId);
  navbar.setAttribute("dataset-current-length", length);
}

function getDataLength(apiId) {
  navbar = document.getElementById("navigationBar_" + apiId);
  length = parseInt(navbar.getAttribute("dataset-current-length"));
  return length;
}

function setRowNumWeb(apiId, row) {
  navbar = document.getElementById("navigationBar_" + apiId);
  navbar.setAttribute("dataset-current-row", row);
  // get the div with the name navigation-bar-title
  var title = navbar.querySelector(".navigation-bar-title");
  // set the text of the div with the row number
  title.textContent = "record: " + row;
}

function getRowNumWeb(apiId) {
  navbar = document.getElementById("navigationBar_" + apiId);
  rowNum = parseInt(navbar.getAttribute("dataset-current-row"));
  return rowNum;
}
