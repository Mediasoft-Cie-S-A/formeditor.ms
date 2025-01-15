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

const { json } = require("body-parser");

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
  button.style.width = "100%";
  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    updateDataSet(main, content);
  };
  content.appendChild(button);

  // button showModalDbStrc for show the database structure
  const buttonShowDbStrc = document.createElement("button");
  buttonShowDbStrc.style.width = "100%";
  buttonShowDbStrc.textContent = "Show DB";
  buttonShowDbStrc.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    showModalDbStrc(content, type);
  };
  content.appendChild(buttonShowDbStrc);

  content.appendChild(createMultiSelectItem("SQL", "sql", "sql"));
  content.appendChild(createMultiSelectItem("Data", "data", "data"));
  content.appendChild(createMultiSelectItem("Link", "link", "link"));
  content.appendChild(createMultiSelectItem("Exception","exception","exception"));
  content.appendChild(createSelectItem("Filter","filter","filter",element.getAttribute("filter"),"text",true));


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

  if (element.getAttribute("datalink") != null) {
    var target = content.querySelector("#Link");
    var jsonData = JSON.parse(element.getAttribute("datalink"));
    jsonData.forEach((fieldJson) => {
      addFieldToPropertiesBar(target, fieldJson);
    });
  }
  // exception
  if (element.getAttribute("exceptionSet") != null) {
    var target = content.querySelector("#Exception");
    var jsonData = JSON.parse(element.getAttribute("exceptionSet"));
    jsonData.forEach((fieldJson) => {
      addFieldToPropertiesBar(target, fieldJson);
    });
  }

  // filter
  if (element.getAttribute("filter") != null) {
    var target = content.querySelector("#Filter");
    target.value = element.getAttribute("filter");
  }
}

function updateDataSet(main, content) {
  console.log("updateDataSet");
  var jsonData = [];
  var linkData = [];
  var exceptionData = [];
  var data = content.querySelector("#Data").querySelectorAll("span[name='dataContainer']");
  var exception = content.querySelector("#Exception").querySelectorAll("span[name='dataContainer']");
  var datalink = content.querySelector("#Link").querySelectorAll("span[name='dataContainer']");
  data = Array.from(data).filter((span) => !span.closest("#exception"));

  if (data.length == 0) return;
 
  data.forEach((span) => {
    var json = JSON.parse(span.getAttribute("data-field"));
    // check if the field exists in the jsonData
    if (jsonData.find((field) => field.fieldName === json.fieldName) == null)
    {
      jsonData.push(json);
    }
     
  });
  datalink.forEach((span) => {
    var json = JSON.parse(span.getAttribute("data-field"));
    // check if the field exists in the linkData
    if (linkData.find((field) => field.fieldName === json.fieldName) == null)
    {
          linkData.push(json);
    }
  });
  exception.forEach((span) => {
    var json = JSON.parse(span.getAttribute("data-field"));
    // check if the field exists in the exceptionData
    if (exceptionData.find((field) => field.fieldName === json.fieldName) == null)
    {
    exceptionData.push(json);
    }
  });

  main.setAttribute("dataSet", JSON.stringify(jsonData));
  main.setAttribute("datalink", JSON.stringify(linkData));
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
  // add rowid jsonData, in the first position if not exists
  var rowid = jsonData.find((field) => field.fieldType === "rowid");
  if (!rowid)
  {
    jsonData.unshift({
      DBName: jsonData[0].DBName,
      tableName: jsonData[0].tableName,
      fieldLabel: "rowid",
      fieldDataType: "rowid",
      fieldDefaultValue: "0",
      fieldName: "rowid",
      fieldType: "rowid",
      fieldSize: "10",
      fieldMandatory: "0",
      fieldValues: "",
      fieldSQL: ""
    });
      
  }

  jsonData.forEach((fieldJson) => {
    var createField = createFieldFromJson(fieldJson);
    dataset.appendChild(createField);
    datasetFields.push(fieldJson.fieldName);
  });
  dataset.setAttribute("DataSet-Fields-List", datasetFields);
  main.setAttribute("DataSet-Fields-List", datasetFields);
  main.appendChild(dataset);

  // get the data from the main
}

function createFieldFromJson(fieldJson) {
  var element = null;
  let einput = null;
  switch (fieldJson.fieldType) {
    
    case "array":
      case "combo_array":
        case "combo_sql":
      element = createElementInput(fieldJson.fieldType);
      einput = element.querySelector("input"); // Adjust to your combobox selector
      einput.style.display = "none";
      break;
     
      
    case "sequence":
      element = createElementInput(fieldJson.fieldType);
      einput = element.querySelector("input"); // Adjust to your combobox selector

      break;
    case "search_win":
      element = createElementInput(fieldJson.fieldType);
      einput = element.querySelector("input"); // Adjust to your combobox selector
      // adding the search button
      var searchButton = document.createElement("button");
      searchButton.style.float = "right";
      searchButton.style.width = "20px" ;
      searchButton.style.height = "20px" ;
      searchButton.style.padding = "0px";
      // icon for the search button
      var icon = document.createElement("i");
      icon.className = "fas fa-search";      
      searchButton.appendChild(icon);
      searchButton.onclick = function () {
        var input = einput;
        var filter = input.value.toUpperCase();
        // generate the modalwindow for the search
        // Example JSON dataset and query
        
        query = einput.getAttribute("dataset-field-SQL");
        console.log("query", query);
        // split the query
        var queryArray = query.split("|");
        // get the database name
        DBName = queryArray[0];
        // get the query
        query = queryArray[1];
        // extract all fields from the query
        var fields = query.match(/SELECT(.*?)FROM/)[1];
        // get the dataset from the query in this format  { fieldName: "field", fieldType: "string" },
       const datasetJson = fields.split(",").map((field) => {
          return {
            fieldName: field.trim(),
            fieldType: "string",
          };
        });
     // Show the modal with the query results
          showQueryResultModal(DBName, datasetJson, queryArray[1],einput.id);
      };
      element.appendChild(searchButton);
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

// refresh record
function RefreshRecord(DBName, tableName) {
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
        updateInputs(data, DBName, tableName);
        rowNum = rowNum == "" ? 0 : rowNum;
        setRowNum(tableName, rowNum);
      } else {
        updateInputs(data, DBName, tableName);
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




// link record to grid using this web service /get-record-by-rowid/:tableName/:rowID and update the inputs with the data
// use the fetch function to call the web service and update the inputs with the data
// use the updateInputs function to update the inputs with the data
// use the setRowID function to set the current row id in the navigation bar
async function linkRecordToGrid(DBName, tableName, rowId, rowNum,dataset,link,rows) {
  console.log("linkRecordToGrid");
  console.log("DBName", DBName);
  console.log("tableName", tableName);
  console.log("rowId", rowId);
  console.log("rowNum", rowNum);
  console.log("dataset", dataset);
  console.log("link", link);
  console.log("rows", rows);
  const saveBtn = document.querySelector("[name=SaveDSBtn]");
  if (saveBtn) saveBtn.disabled = true;
  
  try {
    // get all the datasets
    const datasetsDiv = document.querySelectorAll("#DataSet_" + tableName);
    // for all the datasets check the div with name DataSet
    datasetsDiv.forEach((datasetDiv) => {
      //get db name from the dataset
      datasetDBName = datasetDiv.getAttribute("DBName");
      // get table name from the dataset
      datasetTableName = datasetDiv.getAttribute("data-table-name");
      // if the table name is the same as the table name of the record
      if (datasetTableName == tableName) {
        // get the fields from the dataset
        const datasetFields = datasetDiv.getAttribute("dataset-fields-list");
        if (!link) { // if link is not defined
          link = [];
        }
        if (link.length ===0) {
           console.log("link.length ===0");
            const url = `/get-record-by-rowid/${DBName}/${tableName}/${rowId}?fields=${datasetFields}`;
            fetch(url)
              .then((response) => response.json())
              .then((data) => {
                updateInputs(data, DBName, tableName);
              
              })
              .catch((error) => console.error("Error:", error));
          } // end if link.length ===0
          else {
            console.log("link.length !==0");
            // get the fields from the dataset and values from rows
            // and generate indexes and values in order to pass to             "/get-records-by-idexes/:database/:tableName",
            let indexes = [];
            let values = [];
            link.forEach((field) => {
              indexes.push(field.fieldName);
              // get id for filed by array index dataset
              let idx = -1;
              // get the index of the field in the dataset
              dataset.forEach((f, i) => {
                if (f.fieldName == field.fieldName) {
                  idx = i+1;
                }});
              // idx+1 is the value of the field in the rows array considering 0 is the rowid
              values.push(rows[idx]);
            }
            );
            const url = `/get-records-by-indexes/${DBName}/${tableName}?indexes=${indexes}&values=${values}&fields=${datasetFields}`;
            fetch(url)
              .then((response) => response.json())
              .then((data) => {
                updateInputs(data, DBName, tableName);
              
              })
              .catch((error) => console.error("Error:", error));
          } // end else

      

        } // end if datasetTableName == tableName
      
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

async function updateInputs(data, DBName, tableName) {
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
        input.readOnly = true;
        switch (fieldType) {
          case "array":
            let subField = data[0][fieldLabel]?.toString().trim().split(";");
            let arrayType = subField.every(
              (item) =>
                item === true || item === false || item == 0 || item == 1
            );
            input.value = data[0][fieldLabel];

            input.style.display = "none"; // Hide the original input
            let fieldId = input.getAttribute("data-field-name");
            let existingFieldContainer = document.getElementById(fieldId);
            if (existingFieldContainer) {
              existingFieldContainer.parentElement.removeChild(
                existingFieldContainer
              );
            }

            let fieldContainer = document.createElement("div");
            fieldContainer.style.height = "600px";
            fieldContainer.style.maxWidth = "400%";
            fieldContainer.style.overflowX = "scroll";
            fieldContainer.style.display = "flex";
            fieldContainer.style.flexDirection = "column";
            fieldContainer.style.flexWrap = "wrap";
            fieldContainer.className = "subFieldContainer";
            fieldContainer.id = fieldId;
            input.parentElement.appendChild(fieldContainer);
            let labelsvalues = input.getAttribute("dataset-field-values");
            let labels = labelsvalues.split(",");
            if (arrayType) {
              // Function to render subfields
              function renderSubFields(
                input,
                subField,
                fieldLabel,
                fieldContainer,
                data
              ) {
                // Clear any existing content inside the field container
                fieldContainer.innerHTML = "";

                subField.forEach((val, index) => {
                  // Create a container for the checkbox and its label
                  let checkboxWrapper = document.createElement("div");
                  checkboxWrapper.style.display = "flex";
                  checkboxWrapper.style.alignItems = "center";
                  checkboxWrapper.style.justifyContent = "space-between"; // Space between label and checkbox
                  checkboxWrapper.style.width = "140px"; // Fixed width for each checkbox container
                  checkboxWrapper.style.marginBottom = "10px"; // Spacing between checkboxes

                  // Create label for the checkbox
                  let label = document.createElement("label");
                  label.htmlFor = `checkbox_${index}`;
                  label.innerText =
                    labels[index] === undefined || labels[index] === "undefined"
                      ? input.getAttribute("dataset-field-name") + "__" + index
                      : labels[index];

                  // Create checkbox
                  let checkbox = document.createElement("input");
                  checkbox.type = "checkbox";
                  checkbox.id = `${fieldLabel}__checkbox_${index}`; // Give each checkbox a unique id
                  checkbox.checked = val != 0; // Set checked based on value (1 or 0)
                  checkbox.style.marginLeft = "1px"; // Spacing between checkbox and label

                  checkbox.addEventListener("click", (event) => {
                    const isChecked = event.target.checked;
                    subField[index] = isChecked ? 1 : 0;
                    data[0][fieldLabel] = subField.join(";");
                    input.value = data[0][fieldLabel];
                    input.disabled = false;
                    // console.log(
                    //   `Updated data for ${fieldLabel}:`,
                    //   data[0][fieldLabel]
                    // );
                    renderSubFields(
                      input,
                      subField,
                      fieldLabel,
                      fieldContainer,
                      data
                    );
                  });
                  checkboxWrapper.appendChild(label);
                  checkboxWrapper.appendChild(checkbox);
                  fieldContainer.appendChild(checkboxWrapper);
                });
              }

              // Function to handle initial setup of subfields
              function setupSubFields(input, data, fieldLabel) {
                let subField = data[0][fieldLabel]
                  ?.toString()
                  .trim()
                  .split(";");

                if (subField.length > 1) {
                  input.style.display = "none"; // Hide the original input
                  let fieldId = input.getAttribute("data-field-name");
                  let existingFieldContainer = document.getElementById(fieldId);

                  if (existingFieldContainer) {
                    existingFieldContainer.parentElement.removeChild(
                      existingFieldContainer
                    );
                  }

                  let fieldContainer = document.createElement("div");
                  fieldContainer.style.height = "600px";
                  fieldContainer.style.maxWidth = "400%";
                  fieldContainer.style.overflowX = "scroll";
                  fieldContainer.style.display = "flex";
                  fieldContainer.style.flexDirection = "column";
                  fieldContainer.style.flexWrap = "wrap";
                  fieldContainer.className = "subFieldContainer";
                  fieldContainer.id = fieldId;
                  input.parentElement.appendChild(fieldContainer);
                  // Initial render of the subfields
                  renderSubFields(
                    input,
                    subField,
                    fieldLabel,
                    fieldContainer,
                    data
                  );
                }
              }
              datasets.forEach((dataset) => {
                const datasetTableName =
                  dataset.getAttribute("data-table-name");

                if (datasetTableName === tableName) {
                  const inputs = dataset.querySelectorAll("input, select");

                  inputs.forEach((input) => {
                    const fieldLabel = input.getAttribute("dataset-field-name");
                    setupSubFields(input, data, fieldLabel);
                  });
                }
              });
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
                const fieldLabel = input.getAttribute("dataset-field-name");

                if (childInput) {
                  childInput.id = `${fieldLabel}__childInput_${index}`; // Give each checkbox a unique id

                  childInput.value = val;
                  childInput.style.maxWidth = "60px";
                  childInput.style.marginLeft = "8px";
                  childInput.readOnly = true;
                }
                fieldContainer.appendChild(createField);
              });
            }

            break;
          // Handle specific cases based on fieldLabel for select fields
          case "combo_array":
            // get the values of the field
            let fieldvalues = input.getAttribute("dataset-field-values");
            handleSelectField(input, fieldvalues, data[0][fieldLabel]);
            break;
          case "combo_sql":
         
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
        // dataset.parentElement.querySelector(
        //   "[name=SaveDSBtn]"
        // ).disabled = false;
      }); // end inputs.forEach
    } // end if
  }); // end datasets.forEach
}

// Helper function to handle select fields
// Helper function to handle select fields and sync with input field

function handleSelectField(input, options, selectedValue) {
  console.log("handleSelectField");
  if (!input) return;

  console.log(input);
  console.log(options);
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

function handleSelectFieldSQL(DBName, input, SQL, fieldLabel, selectedValue) {
  if (!input) return;
  // call the fetch function to get the data queryData query-data/${DBName}/${SQL}

  // Check if a select element already exists, else create it
  let selectElement = input.parentElement.querySelector("select");

  if (!selectElement) {
    const url = `/query-data/${DBName}/${encodeURIComponent(SQL)}`;
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
