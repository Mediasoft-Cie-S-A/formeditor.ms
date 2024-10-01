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

const e = require("express");

function createElementDateSet(type) {
  var main = document.createElement("div");
  main.className = "form-container";
  main.id = type + Date.now(); // Unique ID for each new element
  main.draggable = true;
  main.tagName = type;
  const list = document.getElementById("ContentTableList");
  const detailsDiv = document.getElementById("tableDetails");

  return main;
}

function editElementDataSet(type, element, content) {
  const button = document.createElement("button");
  button.textContent = "update";
  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    updateDataSet(main, content);
  };
  content.appendChild(button);
  content.appendChild(
    createMultiSelectItem(
      "Data",
      "data",
      "data",
      element.getAttribute("data"),
      "text",
      true
    )
  );
  content.appendChild(
    createMultiSelectItem(
      "exception",
      "exception",
      "exception",
      element.getAttribute("exception"),
      "text",
      true
    )
  );
  content.appendChild(
    createSelectItem(
      "Filter",
      "filter",
      "filter",
      element.getAttribute("filter"),
      "text",
      true
    )
  );

  // load the data
  // check if jsonData is not empty
  if (element.getAttribute("dataSet") != null) {
    var target = content.querySelector("#Data");
    var jsonData = JSON.parse(element.getAttribute("dataSet"));
    jsonData.forEach((fieldJson) => {
      if (fieldJson.fieldType !== "rowid")
        addFieldToPropertiesBar(target, fieldJson);
    });
  }
}

function updateDataSet(main, content) {
  console.log("updateDataSet");

  var data = content.querySelectorAll('span[name="dataContainer"]');
  var exception = Array.from(data).filter((span) => span.closest("#exception"));
  data = Array.from(data).filter((span) => !span.closest("#exception"));

  if (data.length == 0) return;
  var firstJson = JSON.parse(data[0].getAttribute("data-field"));
  var jsonData = [
    {
      DBName: firstJson.DBName,
      tableName: firstJson.tableName,
      fieldName: "rowid",
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
  var exceptionData = [
    {
      DBName: firstJson.DBName,
      tableName: firstJson.tableName,
      fieldName: "rowid",
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
    var json = JSON.parse(span.getAttribute("data-field"));
    jsonData.push(json);
  });
  exception.forEach((span) => {
    var json = JSON.parse(span.getAttribute("data-field"));
    exceptionData.push(json);
  });

  main.setAttribute("dataSet", JSON.stringify(jsonData));
  main.setAttribute("exceptionSet", JSON.stringify(exceptionData));
  renderDataSet(main);
}

function renderDataSet(main) {
  main.innerHTML = "";
  main.style.height = "auto";
  main.style.display = "flex";
  // get the data from the main
  var jsonData = JSON.parse(main.getAttribute("dataSet"));
  // generate the div for the dataset
  var dataset = document.createElement("div");
  dataset.id = "DataSet_" + jsonData[0].tableName;
  dataset.setAttribute("data-table-name", jsonData[0].tableName);
  dataset.className = "dataSetContainer";
  var datasetFields = [];
  jsonData.forEach((fieldJson) => {
    var createField = createFieldFromJson(fieldJson);
    dataset.appendChild(createField);
    datasetFields.push(fieldJson.fieldName);
  });
  dataset.setAttribute("DataSet-Fields-List", datasetFields);
  main.setAttribute("DataSet-Fields-List", datasetFields);
  main.appendChild(dataset);
  main.appendChild(createNavigationBar(jsonData[0].DBName,jsonData[0].tableName, datasetFields));
 // console.log(jsonData[0]);
  moveFirst(jsonData[0].DBName,  jsonData[0].tableName, datasetFields);
}

function createFieldFromJson(fieldJson) {
  var element = null;
  let einput = null;
  switch (fieldJson.fieldType) {
    case "combo_array": 
    case "combo_sql": 
    case "array":
      element = createElementInput(fieldJson.fieldType);
      einput = element.querySelector("input"); // Adjust to your combobox selector
      einput.style.display = "none";
      break;
    case "sequence":
        element = createElementInput(fieldJson.fieldType);
        einput = element.querySelector("input"); // Adjust to your combobox selector
       
        break;
    case "character":
    case "varchar":
    case "text":
    case "fixchar":
      element = createElementInput("text");
      einput = element.querySelector("input");
      break;
    case "rowid":
      element = createElementInput("hidden");
      einput = element.querySelector("input");
      element.style.display = "none";
      break;
    case "INT":
    case "integer":
    case "bigint":
    case "float":
    case "double":
    case "decimal":
      element = createElementInput("number");
      einput = element.querySelector("input");
      break;
    case "date":
    case "datetime":
      element = createElementInput("date");
      einput = element.querySelector("input");
      break;
    case "time":
      element = createElementInput("time");
      einput = element.querySelector("input");
      break;
    case "boolean":
    case "bool":
    case "bit":
      element = createElementInput("checkbox");
      einput = element.querySelector("input");
      einput.className = "apple-switch";
      break;

    default:
      // Handle default case or unknown types
      element = createElementInput("text");
      einput = element.querySelector("input");
      break;
  }
  if (element !== undefined && element !== null) {
    element.style.maxWidth = "500px";

    // get label from the element
    var label = element.querySelector("label");
    // if the label exists set the text
    if (label !== null)
      label.textContent =
        fieldJson.fieldLabel === "" || fieldJson.fieldLabel === "null"
          ? fieldJson.fieldName
          : fieldJson.fieldLabel; // Set label to column name
    // set the input attributes
    einput.id = fieldJson.tableName + "_" + fieldJson.fieldName;
    einput.setAttribute("DBName", fieldJson.DBName);
    einput.setAttribute("dataset-table-name", fieldJson.tableName);
    einput.setAttribute("dataset-field-name", fieldJson.fieldName);
    einput.setAttribute("dataset-field-type", fieldJson.fieldType);
    einput.setAttribute("dataset-field-size", fieldJson.fieldSize);
    einput.setAttribute("dataset-field-mandatory", fieldJson.fieldMandatory);
    einput.setAttribute("dataset-field-values", fieldJson.fieldValues);
    einput.setAttribute("dataset-field-SQL", fieldJson.fieldSQL);
    if (fieldJson.fieldMandatory) {
      einput.required = true;
    }
  }
  return element;
}

// --- internal functions ---

function createNavigationBar(DBName, tableName, datasetFields) {
//  console.log("createNavigationBar");
//  console.log(DBName);

  // Create the navigation bar div
  var navigationBar = document.createElement("div");
  navigationBar.id = "navigationBar_" + tableName;
  navigationBar.type = "navigation-bar";
  navigationBar.className = "navigation-bar";
  navigationBar.setAttribute("DBName", DBName);
  navigationBar.setAttribute("data-table-name", tableName);
  navigationBar.setAttribute("data-current-row", "0");
  navigationBar.setAttribute("data-dataset-fields", datasetFields);
  navigationBar.innerHTML = '<div class="navigation-bar-title">record: </div>';

  // Create buttons and append them to the navigation bar
  var buttons = [
    {
      name: "firstDSBtn",
      title: "First",
      text: '<i class="bi bi-arrow-up-circle-fill" style="color:green;margin-left:-6px"></i>',
      event: "moveFirst('" + DBName + "','" + tableName + "','" + datasetFields + "')",
    },
    {
      name: "PreviusDSBtn",
      title: "Previus",
      text: '<i class="bi bi-arrow-left-circle-fill" style="color:green;margin-left:-6px"></i>',
      event: "movePrev('" + DBName + "','" + tableName + "','" + datasetFields + "')",
    },
    {
      name: "NextDSBtn",
      title: "Next",
      text: '<i class="bi bi-arrow-right-circle-fill" style="color:green;margin-left:-6px"></i>',
      event: "moveNext('" + DBName + "','" + tableName + "','" + datasetFields + "')",
    },
    {
      name: "LastDSBtn",
      title: "Last",
      text: '<i class="bi bi-arrow-down-circle-fill" style="color:green;margin-left:-6px"></i>',
      event: "moveLast('" + DBName + "','" + tableName + "','" + datasetFields + "')",
    },
    {
      name: "EditDSBtn",
      title: "Edit Record",
      text: '<i class="bi bi-credit-card-2-front" style="color:blue;margin-left:-6px"></i>',
      event: "EditRecord('" + tableName + "', false)",
    },
    {
      name: "InsertDSBtn",
      title: "Insert Record",
      text: '<i class="bi bi-sticky-fill" style="color:green;margin-left:-6px"></i>',
      event: "InsertRecord('" + DBName + "','" + tableName + "','" + datasetFields + "')",
    },
    {
      name: "CopyDSBtn",
      title: "Copy",
      text: '<i class="bi bi-clipboard" style="color:red;margin-left:-6px"></i>',
      event: "CopyRecord('" + DBName + "','" + tableName + "', '" + datasetFields + "')",
    },
    {
      name: "SaveDSBtn",
      title: "Save Record",
      text: '<i class="bi bi-sim-fill" style="color:red;margin-left:-6px"></i>',
      event: "SaveRecord('" + DBName + "','" + tableName + "')",
    },
    {
      name: "RefreshDSBtn",
      title: "Refresh Data",
      text: '<i class="bi bi-arrow-clockwise" style="color:green;margin-left:-6px"></i>',
      event: "RefreshRecord('" + DBName + "','" + tableName + "')",
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

function insertTable() {
  const modal = document.getElementById("tableDetailsModal");
  const overl = document.getElementById("overlayModal");
  modal.style.display = "none";
  overl.style.display = "none";
  const formContainer = document.getElementById(
    modal.getAttribute("data-main-id")
  );
  const tableName = document
    .getElementById("TableDetails_TableName")
    .getAttribute("table-name");
  element = document.createElement("div");
  createFormElementsFromStructure(tableName, element);

  formContainer.appendChild(element);
}

//--- data set navigation ---
function moveFirst(DBName,tableName, datasetFields) {
  if (tableName) {
    navigateRecords("move-to-first",DBName, tableName, datasetFields);
  }
}

function movePrev(DBName,tableName, datasetFields) {
  if (tableName) {
    const rowNum = getRowNum(tableName);
    if (rowNum == 0) return;
    navigateRecords("move-to-previous",DBName, tableName, datasetFields, rowNum - 1);
  }
}

function moveNext(DBName,tableName, datasetFields) {
  if (tableName) {
    navigateRecords(
      "move-to-next",
      DBName,
      tableName,
      datasetFields,
      getRowNum(tableName) + 1
    );
  }
}

function moveLast(DBName,tableName, datasetFields) {
  if (tableName)
    navigateRecords("move-to-last",DBName, tableName, datasetFields, "", "", true);
}

// refresh record
function RefreshRecord(DBName,tableName) {
  if (tableName) {
    navigateRecords(
      "move-to-next",
      DBName,
      tableName,
      datasetFields,
      getRowNum(tableName)
    );
  }
}

async function navigateRecords(
  action,
  DBName,
  tableName,
  datasetFields,
  rowNum = "",
  filter = "",
  isMoveLast = false
) {
  if (!filter) {
    const formContainer = document.getElementById("formContainer");
    var childElements = formContainer.children;
    var idObject = {};
    for (var i = 0; i < childElements.length; i++) {
      var fullId = childElements[i].id;
      var name = fullId.match(/[a-zA-Z]+/)[0];
      idObject[name] = fullId;
    }
    if (idObject.dataSet) {
      const main = document.getElementById(idObject.dataSet);
      let filterData = main.getAttribute("filter");
      if (filterData) {
        filter = filterData;
      }
    }
  }
  const url =
    `/${action}/${DBName}/${tableName}` +
    (rowNum >= 0 ? `/${rowNum}` : "") +
    `?fields=${datasetFields}&filter=${filter}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!isMoveLast) {
        updateInputs(data, DBName,tableName);
        rowNum = rowNum == "" ? 0 : rowNum;
        setRowNum(tableName, rowNum);
      } else {
        updateInputs(data, DBName,tableName);
        rowNum = data == "" ? 0 : data.length - 1;
        setRowNum(tableName, rowNum);
      }
    })
    .catch((error) => console.error("Error:", error));
  
  EditRecord(tableName, true);
}
async function getRecords(action, DBName, tableName, datasetFields) {
  const url = `/${action}/${DBName}/${tableName}?fields=${datasetFields}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

function CopyRecord(DBName,tableName, datasetFields) {
  const inputs = document.querySelectorAll(`#DataSet_${tableName} input`);
  const selects = document.querySelectorAll(`#DataSet_${tableName} select`);
  const idObject = getIdObject();
  const main = document.getElementById(idObject.dataSet);
  const exceptionData = JSON.parse(main.getAttribute("exceptionSet"));
  const exceptionFieldNames = exceptionData.map((field) => field.fieldName);
  inputs.forEach((input) => {
    input.readOnly = false; // Make input editable
    const field = input.getAttribute("dataset-field-name");
    input.setAttribute("value", "new"); // Set all non-exception inputs to "new"

    if (exceptionFieldNames.includes(field) && field !== "rowid") {
      input.value = ""; // Clear the value for exception fields
    }
  });

  // Process all select fields
  selects.forEach((select) => {
    const field = select.getAttribute("dataset-field-name");

    // If the select field is in the exception list and not "rowid"
    if (exceptionFieldNames.includes(field) && field !== "rowid") {
      select.selectedIndex = -1; // Clear the selection for exception fields
    } else {
      select.selectedIndex; // Set to the first option or a default value
    }
  });
}

async function navigateSequence(action) {
  const url = `/${action}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// link record to grid using this web service /get-record-by-rowid/:tableName/:rowID and update the inputs with the data
// use the fetch function to call the web service and update the inputs with the data
// use the updateInputs function to update the inputs with the data
// use the setRowID function to set the current row id in the navigation bar
async function linkRecordToGrid(DBName,tableName, rowId, rowNum) {
  try {
    // get all the datasets
    const datasets = document.querySelectorAll("#DataSet_" + tableName);
    // for all the datasets check the div with name DataSet
    datasets.forEach((dataset) => {
      //get db name from the dataset
      datasetDBName = dataset.getAttribute("DBName");
      // get table name from the dataset
      datasetTableName = dataset.getAttribute("data-table-name");
      // if the table name is the same as the table name of the record
      if (datasetTableName == tableName) {
        // get the fields from the dataset
        const datasetFields = dataset.getAttribute("dataset-fields-list");

        const url = `/get-record-by-rowid/${DBName}/${tableName}/${rowId}?fields=${datasetFields}`;
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            updateInputs(data,DBName, tableName);
            setRowNum(tableName, rowNum); // Assuming the data includes ROWID to-do check if the data includes ROWID
          })
          .catch((error) => showToast("Error:" + error));
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

async function updateInputs(data,DBName, tableName) {
  const datasets = document.querySelectorAll("#DataSet_" + tableName);
  datasets.forEach(async (dataset) => {
    const datasetTableName = dataset.getAttribute("data-table-name");

    if (datasetTableName === tableName) {
      const inputs = dataset.querySelectorAll("input, select");

      inputs.forEach(async (input) => {
        const dbFieldName = input.getAttribute("DBName");
        const fieldLabel = input.getAttribute("dataset-field-name");
        // const fieldType = input.tagName.toLowerCase();
        const fieldType = input.getAttribute("type");
        input.value = "";
        input.disabled = true;
       
        switch (fieldType) {
          case "array":
        let subField = data[0][fieldLabel]?.toString().trim().split(";");

          input.style.display = "none";
          let fieldId = input.getAttribute("data-field-name");
          let existingFieldContainer = document.getElementById(fieldId);
          if (existingFieldContainer) {
            existingFieldContainer.parentElement.removeChild(
              existingFieldContainer
            );
          }

          let fieldContainer = document.createElement("div");
          fieldContainer.style.height = "600px";
          fieldContainer.style.maxWidth = "400px";
          fieldContainer.style.overflowX = "scroll";
          fieldContainer.style.overflowY = "clip";

          fieldContainer.style.display = "flex";
          fieldContainer.style.flexDirection = "column";
          fieldContainer.style.flexWrap = "wrap";
          fieldContainer.className = "subFieldContainer";
          fieldContainer.id = fieldId;
          input.parentElement.appendChild(fieldContainer);
          let labelsvalues = input.getAttribute("dataset-field-values");
          let labels = labelsvalues.split(",");

          subField.forEach((val, index) => {
            let fieldJson = {
              fieldDataType: input.getAttribute("data-field-type"), // fixed typo: "dataset-field-type" to "data-field-type"
              fieldDefaultValue: val,
              fieldLabel:
              labels[index] !== undefined
                  ? labels[index]
                  : input.getAttribute("dataset-field-name") + "__" + index,
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

        break;
          // Handle specific cases based on fieldLabel for select fields
          case "combo_array":

            // get the values of the field
            let fieldvalues = input.getAttribute("dataset-field-values");
            handleSelectField(
              input,
              fieldvalues,
              data[0][fieldLabel]
            );
            break;
          case  "combo_sql":
            // get the values of the field
            let fieldSQL = input.getAttribute("dataset-field-SQL");
            handleSelectFieldSQL(
              DBName,
              input,
              fieldSQL,
              fieldLabel,
              data[0][fieldLabel]

            );
            break;
          
          default:
            // if (fieldType === "input") {
            input.value = data[0][fieldLabel]?.toString().trim() || "";
            input.disabled = false;
            // }
            break;
        
        } // end switch
        // Enable the save button for the dataset
        dataset.parentElement.querySelector(
          "[name=SaveDSBtn]"
        ).disabled = false;
        
      }); // end inputs.forEach
    } // end if
  }); // end datasets.forEach
}


// Helper function to handle select fields
// Helper function to handle select fields and sync with input field

function handleSelectField(input, options, selectedValue) {
  if (!input) return;

  // convert the options to an array
  options = options.split(",");
 
  // Check if a select element already exists, else create it
  let selectElement = input.parentElement.querySelector("select");
  if (!selectElement) {
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
  }

  

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


function handleSelectFieldSQL(DBName, input, SQL, fieldLabel,selectedValue) {
  if (!input) return;
 // call the fetch function to get the data queryData query-data/${DBName}/${SQL}

   // Check if a select element already exists, else create it
   let selectElement = input.parentElement.querySelector("select");
 
  if (!selectElement) {
    const url = `/query-data/${DBName}/${SQL}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // convert the options to an array by fieldLabel
        options = data.map((row) => row[fieldLabel]);
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
})
  .catch((error) => console.error("Error:", error));
  }
  // Set the value of the select element
  selectElement.value = selectedValue || "";
  selectElement.disabled = true; 
  // Enable the select field
  // Initially sync the input field with the selected value
  input.value = selectElement.value || "";
  input.dispatchEvent(new Event("input")); // Trigger input event for change detection
}

function setRowNum(tabelName, Num) {
  navbar = document.getElementById("navigationBar_" + tabelName);
  navbar.setAttribute("dataset-current-row", Num);
  // get the div with the name navigation-bar-title
  var title = navbar.querySelector(".navigation-bar-title");
  // set the text of the div with the row number
  title.textContent = "record: " + Num;
}

function getRowNum(tabelName) {
  navbar = document.getElementById("navigationBar_" + tabelName);
  rowNum = parseInt(navbar.getAttribute("dataset-current-row"));
  return rowNum;
}

function EditRecord(tableName, action) {
  const inputs = document.querySelectorAll(`#DataSet_${tableName} input, #DataSet_${tableName} select`);

  inputs.forEach((input) => {
    const tableLabel = input.getAttribute("dataset-table-name");    
    input.readOnly = action;
    input.disabled = action;
    // }
  });

  document.querySelector("[name=SaveDSBtn]").disabled = action;
}

function InsertRecord(DBName,tableName) {
  const inputs = document.querySelectorAll(`#DataSet_${tableName} input`);
  inputs.forEach((input) => {
    const tableLabel = input.getAttribute("dataset-table-name");
    if (tableLabel == tableName) {
      input.readOnly = false;
      const field = inputs[i].getAttribute("dataset-field-name");
      if (field !== null && field !== "rowid") {
        input.value = "new";
      } else {
        input.value = "";
      }
    }
  });
  document.getElementById("SaveRecordBtn").disabled = false;
}

function CreateUpdated(DBName,tableName) {
  const inputs = document.querySelectorAll(
    `#DataSet_${tableName} input[dataset-field-name]`
  );
  let updateFields = [];
  let fieldGroups = {};

  inputs.forEach((input) => {
    const field = input.getAttribute("dataset-field-name");
    const value = input.value;
    if (field === "rowid") {
      return; // Skip rowid field
    }
    // Extract the prefix and index
    const match = field.match(/^([a-zA-Z]+)__(\d+)$/);
    if (match) {
      const prefix = match[1]; // Extract the base prefix (e.g., 'droit')
      const index = parseInt(match[2], 10); // Extract and convert the index
      if (!fieldGroups[prefix]) {
        fieldGroups[prefix] = [];
      }
      // Ensure the array is large enough to hold the value at the given index
      if (fieldGroups[prefix].length <= index) {
        fieldGroups[prefix].length = index + 1;
      }

      fieldGroups[prefix][index] = value; // Store the value at the correct index
    } else {
      // Handle fields without a detectable prefix
      if (value) {
        // Only add fields with non-empty values
        updateFields.push(`"${field}" = '${value}'`);
      }
    }

    input.readOnly = true;
  });

  // Format grouped values and ensure only the last non-empty value is kept
  for (const prefix in fieldGroups) {
    const valuesArray = fieldGroups[prefix];
    const valuesString = valuesArray
      .filter((v) => v !== undefined && v !== "")
      .join(";");

    // Add to updateFields only if valuesString is not empty
    if (valuesString) {
      updateFields.push(`"${prefix}" = '${valuesString}'`);
    }
  }

  // Return the final formatted string
  return updateFields.join(", ");
}

function addIdToData(data, id, value) {
  let fieldsArray = data.fields.replace(/"/g, "").split(",");
  let valuesArray = data.values.replace(/'/g, "").split(",");
  const idIndex = fieldsArray.indexOf("id");
  if (idIndex !== -1) {
    const valueIndex = idIndex;
    valuesArray[valueIndex] = value;
  } else {
    fieldsArray.push("id");
    valuesArray.push(value);
  }
  data.fields = fieldsArray.map((f) => `"${f}"`).join(",");
  data.values = valuesArray.map((v) => `'${v}'`).join(",");
  return data;
}

async function SaveRecord(DBName,tableName) {
  try {
    console.log("SaveRecord");
    const nextRowIds = document.querySelectorAll("#" + tableName + "_rowid");
    for (const nextRowId of nextRowIds) {
      console.log(nextRowId);
      const datasetTableName = nextRowId.getAttribute("dataset-table-name");
      const dbName = nextRowId.getAttribute("DBName");
      if (datasetTableName === tableName) {
        const rowIdValue = nextRowId.value;
        let result;
        if (rowIdValue === "new") {
          let data = CreateInsert(DBNametableName);
          
          result = await insertRecordDB(DBName,tableName, data);
        } else {
          const data = {
            body: CreateUpdated(DBName,tableName),
          };
          result = await updateRecordDB(DBName,tableName, rowIdValue, data);
        }
        document.querySelector("[name=SaveDSBtn]").disabled = true;
        return result;
      }
    }
  } catch (error) {
    showToast("Error:" + error);
  }
}

// create insert data structure
function CreateInsert(tableName) {
  // create data for insert following this structure  `INSERT INTO ${tableName} (${data.fields}) VALUES (${data.values})`;
  // return data with data.fields and data.values
  const inputs = document.querySelectorAll(`#DataSet_${tableName} input`);
  var insertFields = "";
  var insertValues = "";
  for (i = 0; i < inputs.length; i++) {
    if (inputs[i].type != "hidden" && inputs[i].fieldType != "sequence") {
      const field = inputs[i].getAttribute("dataset-field-name");
      insertFields += `"${field}"`;
      insertValues += `'${inputs[i].value}'`;
      if (i < inputs.length - 1) {
        insertFields += ",";
        insertValues += ",";
      }
    }
      else {
        const field = inputs[i].getAttribute("dataset-field-name");
        insertFields += `"${field}"`;
        // get sequence value from the the attribute dataset-field-values
        let sequence = inputs[i].getAttribute("dataset-field-values");
        let sequenceValue = navigateSequence(sequence);
        insertValues += `'${insertValues}'`;
        if (i < inputs.length - 1) {
          insertFields += ",";
          insertValues += ",";
        }
      }
      inputs[i].readOnly = true;
    }
  }
  return { fields: insertFields, values: insertValues };
}

async function updateRecordDB(DBName,tableName, nextRowId, updateData) {
  try {
    const response = await fetch(`/update-record/${DBName}/${tableName}/${nextRowId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      showToast(`HTTP error! status: ${response.status}`);
    }
    const updateResult = await response.json();
    let idObject = getIdObject();
    let filedName = "";
    let operator = "";
    let searchValue = "";
    if (idObject?.dataGrid) {
      const grid = document.getElementById(idObject?.dataGrid);
      filedName = grid.getAttribute("filedName") || "";
      operator = grid.getAttribute("operator") || "";
      searchValue = grid.getAttribute("searchValue") || "";
    }
    searchGrid(filedName, operator, searchValue, idObject?.dataGrid);

    showToast("Record updated successfully", 5000); // Show toast for 5 seconds
    return updateResult;
  } catch (error) {
    showToast("Error:" + error);
  }
}

async function insertRecordDB(DBName,tableName, data) {
  try {
    const payload = JSON.stringify(data);
    const response = await fetch(`/insert-record/${DBName}/${tableName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include other headers as needed, like authentication tokens
      },
      body: payload,
    });

    if (!response.ok) {
      showToast(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    showToast("Record inserted successfully", 5000); // Show toast for 5 seconds
    return result;
  } catch (error) {
    showToast("Error inserting record:" + error);
  }
}
