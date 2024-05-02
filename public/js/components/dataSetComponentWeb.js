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
    content.appendChild(
      createMultiSelectItemWeb("Data", "Id", "data",true)
    );
    content.appendChild(
      createSelectApiWeb("Data", 'GetById')
    );
    content.appendChild(
      createSelectApiWeb("Data", 'UpdateById')
    );
    // load the data
    // check if jsonData is not empty
    if (element.getAttribute("dataSet") != null) {
      var target = content.querySelector("#Data");
      var jsonData = JSON.parse(element.getAttribute("dataSet"));
      jsonData.forEach((fieldJson) => {
        if (fieldJson.fieldType !== "rowid")
          addFieldToPropertiesBarWeb(target, fieldJson);
      });
    }
  }
  
  function updateDataSetWeb(main, content) {
    console.log("updateDataSetWeb");
  
    // get all the span elements from data
    var data = content.querySelectorAll('span[name="dataContainer"]');
    if (data.length == 0) return; // no data to update
    //get id for Update
    var dataId = content.querySelectorAll('span[name="dataContainerId"]');

    var dataGetById = content.querySelectorAll('span[name="dataContainerGetById"]');
    var dataUpdateById = content.querySelectorAll('span[name="dataContainerUpdateById"]');
    var getById={};
    var updateById={};
    try{
     getById = JSON.parse(dataGetById[0].getAttribute("data-field"));
     updateById = JSON.parse(dataUpdateById[0].getAttribute("data-field"));
    }catch{
     getById = {};
     updateById = {};
    }
    
    var firstJson;
    // get the first span element
    if(dataId.length > 0)
     firstJson = JSON.parse(dataId[0].getAttribute("data-field"));
    else
     firstJson = JSON.parse(data[0].getAttribute("data-field"));
     
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
    renderDataSetWeb(main, getById, updateById);
  }
  
  function renderDataSetWeb(main, getById, updateById) {
    main.innerHTML = "";
    main.style.height = "200px";
    console.log("renderDataSetWeb");
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
      var createField = createFieldFromJsonWeb(fieldJson);
      dataset.appendChild(createField);
    });
    main.appendChild(dataset);
    main.appendChild(createNavigationBarWeb(apiUrl, apiMethod, jsonData, apiId, getById, updateById));
    moveFirstWeb(apiUrl, apiMethod, apiId);
  }
  
  function createFieldFromJsonWeb(fieldJson, mainId) {
    var element = null;
    if (fieldJson.fieldFormat) {
      switch (fieldJson.fieldFormat) {
        //for different field formats
        case "rowid":
          element = createElementInput("hidden");
          einput = element.querySelector("input");
          element.style.display = "none";
          break;
        case "date-time":
          element = createElementInput("date");
          einput = element.querySelector("input");
          break;
        default:
          // Handle default case or unknown field formats
          element = createElementInput("text");
          einput = element.querySelector("input");
          break;
      }
    } else if (fieldJson.fieldType) {
      switch (fieldJson.fieldType) {
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
  function createNavigationBarWeb(apiUrl, apiMethod, jsonData, apiId,getById, updateById) {
    console.log("createNavigationBarWeb");
    // Create the navigation bar div
    var navigationBar = document.createElement("div");
    navigationBar.id = "navigationBar_" + apiId;
    navigationBar.type = "navigation-bar";
    navigationBar.className = "navigation-bar";
    navigationBar.setAttribute("data-current-row", "0");
    navigationBar.setAttribute("data-current-length", "0");
    // navigationBar.setAttribute("data-api", "");
    navigationBar.setAttribute("data-api-url", apiUrl);
    navigationBar.setAttribute("data-api-method", apiMethod);
    navigationBar.setAttribute("data-api-id", apiId);
    navigationBar.setAttribute("get-by-id", JSON.stringify(getById));
    navigationBar.setAttribute("update-by-id", JSON.stringify(updateById));

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
        event: "movePrevWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
      },
      {
        name: "NextDSBtn",
        title: "Next",
        text: '<i class="bi bi-arrow-right-circle-fill" style="color:green;margin-left:-6px"></i>',
        event: "moveNextWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
      },
      {
        name: "LastDSBtn",
        title: "Last",
        text: '<i class="bi bi-arrow-down-circle-fill" style="color:green;margin-left:-6px"></i>',
        event: "moveLastWeb('" + apiUrl + "','" + apiMethod + "','" + apiId + "')",
      },
      { name:'EditDSBtn', title: 'Edit Record',text: '<i class="bi bi-credit-card-2-front" style="color:blue;margin-left:-6px"></i>', event: "EditRecordWeb('" + apiId + "')" },
      { name: 'SaveDSBtn', title: 'Save Record', text: '<i class="bi bi-sim-fill" style="color:red;margin-left:-6px"></i>', event: "SaveRecordWeb('" + apiId + "')" },
      
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
  
  //--- data set navigation ---
  
  async function moveFirstWeb(apiUrl, apiMethod, apiId) {
    console.log("DataSetWeb Move First");
    const dataSetId = "DataSetWeb_" + apiId;
    const dataSet = document.getElementById(dataSetId);
    const main = dataSet.parentNode;
    const jsonData = JSON.parse(main.getAttribute("dataSet"));
  
    if (!apiUrl) return;
    const response = await callApi(apiUrl, apiMethod);
    if (!response || response.status !== 200) return;
    const data = await response.json();
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
    const jsonData = JSON.parse(main.getAttribute("dataSet"));
  
    if (!apiUrl) return;
    const response = await callApi(apiUrl, apiMethod);
    if (!response || response.status !== 200) return;
    const data = await response.json();
    if (!data) return;

    const length = getDataLength(apiId);
    updateInputsWeb(data, jsonData, apiId, length - 1);
    setRowNumWeb(apiId, length - 1);
    setDataLength(apiId, data[jsonData[1].fieldArrayName].length);
  }
  
  async function movePrevWeb(apiUrl, apiMethod, apiId) {
    console.log("DataSetWeb Move Prev");
  
    const row = getRowNumWeb(apiId);
    if (row === 0) return;
  
    const dataSetId = "DataSetWeb_" + apiId;
    const dataSet = document.getElementById(dataSetId);
    const main = dataSet.parentNode;
    const jsonData = JSON.parse(main.getAttribute("dataSet"));
  
    if (!apiUrl) return;
    const response = await callApi(apiUrl, apiMethod);
    if (!response || response.status !== 200) return;
    const data = await response.json();
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
    const jsonData = JSON.parse(main.getAttribute("dataSet"));
  
    if (!apiUrl) return;
    const response = await callApi(apiUrl, apiMethod);
    if (!response || response.status !== 200) return;
    const data = await response.json();
    if (!data) return;
    updateInputsWeb(data, jsonData, apiId, row + 1);
    setRowNumWeb(apiId, row + 1);
    setDataLength(apiId, data[jsonData[1].fieldArrayName].length);
  }

  function EditRecordWeb(apiId, handle=false)
{
  console.log('Edit Input')
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
  
async  function SaveRecordWeb(apiId)
{
    console.log("DataSetWeb Update");
  
    const dataSetId = "DataSetWeb_" + apiId;
    const dataSet = document.getElementById(dataSetId);
    const main = dataSet.parentNode;
    const jsonData = JSON.parse(main.getAttribute("dataSet"));
    const input = document.getElementById(jsonData[0].fieldId);

    const rowId = input.value;
    if(!rowId) return;

    const navBar = document.getElementById("navigationBar_"+apiId);
    const getById=JSON.parse(navBar.getAttribute('get-by-id'));
    const apiMethod= getById.apiMethod;
    var apiUrl= getById.controllerServerUrl+getById.apiPath.slice(1);

    const replaceString = "{"+getById.apiDataInputs[0].Name+"}";
    apiUrl = apiUrl.replace(replaceString, rowId);

    if (!apiUrl) return;
    const responseGetById = await callApi(apiUrl, apiMethod);
    if (!responseGetById || responseGetById.status !== 200) return;
    let dataGetById = await responseGetById.json();

    jsonData.map((field,index) => {
      if(index === 0) return;
      const input = document.getElementById(field.fieldId);
      const val = input.value;
      if(!val) return;
      dataGetById[field.fieldArrayName][field.fieldName]=val;
    }
    );

    const updateById=JSON.parse(navBar.getAttribute('update-by-id'));
    const apiMethodUpdate= updateById.apiMethod;

    var apiUrlUpdate= updateById.controllerServerUrl+updateById.apiPath.slice(1);
    const replaceStringUpdate = "{"+updateById.apiDataInputs[0].Name+"}";
    apiUrlUpdate = apiUrlUpdate.replace(replaceStringUpdate, rowId);

    const filteredBody=updateById.apiDataInputs.filter((item) => item.Location==='Body');

    let payload ={};

    filteredBody.map((item) => {
      const val= findValue(dataGetById, item.Name)
      if(val) payload[item.Name]=val
    });

    if (!apiUrlUpdate) return;
    const responseUpdateById = await callApi(apiUrlUpdate, apiMethodUpdate, payload);
    if (!responseUpdateById || responseUpdateById.status !== 200) return;
    let dataUpdateById = await responseUpdateById.json();

    EditRecordWeb(apiId, true);
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
    // get all the datasets
    console.log("Update Inputs");
    const dataSetId = "#DataSetWeb_" + apiId;
  
    const escapedDateSetId = dataSetId.replace(/\//g, "\\/");
    const datasets = document.querySelectorAll(escapedDateSetId);
    // for all the datasets check the div with name DataSet
    datasets.forEach((dataset) => {
      const inputs = dataset.querySelectorAll("input");
      inputs.forEach((input) => {
        const fieldData = jsonData.filter((field) => {
          return field.fieldId === input.id;
        });
        if (fieldData.length < 1) return;
        let fieldValue = getFieldValue(fieldData[0], data, row);
        if (fieldData[0].fieldFormat === "date-time") {
          fieldValue = fieldValue.split("T")[0];
        }
        input.value = "";
        input.readOnly = true;
        if (!fieldValue) return;
        input.value = fieldValue.toString().trim();
      
        // currently we do not have save button on this component
        // disable save record button with name SaveRecordBtn
        // dataset.parentElement.querySelector("[name=SaveDSBtn]").disabled = true;
      });
    });
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
  