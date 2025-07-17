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

// This function creates a new HTML element of a given type, sets its ID and tag name, and makes it draggable.
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
  content.appendChild(createMultiSelectItem("Exception", "exception", "exception"));
  content.appendChild(createSelectItem("Filter", "filter", "filter", element.getAttribute("filter"), "text", true));


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

  // sql
  if (element.getAttribute("sql") != null) {
    var target = content.querySelector("#SQL");
    var jsonData = JSON.parse(element.getAttribute("sql"));

    // add the db name
    if (jsonData.DBName != null) {
      var dbinput = target.querySelector("[tagname='dbname']");
      dbinput.value = jsonData.DBName;
    }
    // add the select
    if (jsonData.select != null) {
      var select = target.querySelector("[tagname='select']");
      select.value = jsonData.select;
    }
    // add the update
    if (jsonData.update != null) {
      var update = target.querySelector("[tagname='update']");
      update.value = jsonData.update
    }
    // add the insert
    if (jsonData.insert != null) {
      var insert = target.querySelector("[tagname='insert']");
      insert.value = jsonData.insert;
    }
    // add the delete
    if (jsonData.delete != null) {
      var del = target.querySelector("[tagname='delete']");
      del.value = jsonData.delete;

    }
  } // end if sql


  // filter
  if (element.getAttribute("filter") != null) {
    var target = content.querySelector("#Filter");
    target.value = element.getAttribute("filter");
  }
}

async function updateDataSet(main, content) {
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
    console.log(json);
    if (jsonData.find((field) => field.fieldName === json.fieldName) == null) {
      jsonData.push(json);
    }

  });

  // SQL
  var sqlJson = {}
  //update the sql json
  var sql = content.querySelector("#SQL");
  console.log(sql);
  var DBName = sql.querySelector("[tagname='dbname']");
  console.log(DBName);
  if (DBName != null) {
    sqlJson["DBName"] = DBName.value;
  }
  // get the textarea with the tagname="select"
  var sqlData = sql.querySelector("[tagname='select']");
  console.log(sqlData);
  if (sqlData != null) {
    sqlJson["select"] = sqlData.value;
  }
  var sqlData = sql.querySelector("[tagname='update']");
  if (sqlData != null) {
    sqlJson["update"] = sqlData.value;
  }
  var sqlData = sql.querySelector("[tagname='insert']");
  if (sqlData != null) {
    sqlJson["insert"] = sqlData.value;
  }


  main.setAttribute("sql", JSON.stringify(sqlJson));
  console.log(sqlJson);

  if (sqlJson.DBName != null) {
    // get the db name

    // get the data with query select "/table-data-sql/:database/:page/:pageSize"?sqlQuery=select * from table
    const response = await fetch(`/table-data-sql/${sqlJson.DBName}/1/1?sqlQuery=${sqlJson.select}`).then((response) => {
      if (!response.ok) {
        showToast("Error retrieving data", 5000);
      }
      return response.json();
    });

    // if data is not empty, update the dataset
    if (response.length > 0) {
      // generate the json of all the data
      const keys = Object.keys(response[0]);
      jsonData = [];
      keys.forEach((field) => {
        jsonData.push({ DBName: sqlJson.DBName, fieldName: field, tabelName: "", fieldType: "string" });
      });
      main.setAttribute("dataSet", JSON.stringify(jsonData));
    } // end if data is not empty
  } // end if DBName is not empty


  datalink.forEach((span) => {
    var json = JSON.parse(span.getAttribute("data-field"));
    // check if the field exists in the linkData
    if (linkData.find((field) => field.fieldName === json.fieldName) == null) {
      linkData.push(json);
    }
  });
  exception.forEach((span) => {
    var json = JSON.parse(span.getAttribute("data-field"));
    // check if the field exists in the exceptionData
    if (exceptionData.find((field) => field.fieldName === json.fieldName) == null) {
      exceptionData.push(json);
    }
  });

  main.setAttribute("dataSet", JSON.stringify(jsonData));
  main.setAttribute("datalink", JSON.stringify(linkData));
  main.setAttribute("exceptionSet", JSON.stringify(exceptionData));
  renderDataSet(main);
}

function renderDataSet(main) {
  // Clear the main content
  main.innerHTML = "";
  main.style.display = "flex";
  main.style.flexDirection = "column";
  main.style.alignItems = "center";
  main.style.padding = "16px"; // Add inner spacing
  main.style.boxSizing = "border-box";
  main.style.overflowX = "hidden"; // Prevent overflow

  // Retrieve dataset JSON from the main element
  var jsonData = JSON.parse(main.getAttribute("dataSet"));

  // Generate the dataset container
  var dataset = document.createElement("div");
  dataset.id = "DataSet_" + (jsonData[0]?.tableName || "");
  dataset.setAttribute("data-table-name", jsonData[0]?.tableName || "");
  dataset.className = "dataSetContainer";

  // Style the dataset container as a responsive grid
  dataset.style.display = "grid";
  dataset.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))"; // Wider min-width
  dataset.style.gap = "16px";
  dataset.style.width = "100%"; // Take full available width
  dataset.style.maxWidth = "1200px"; // Limit maximum width for better readability
  dataset.style.margin = "0 auto"; // Center horizontally
  dataset.style.padding = "16px";
  dataset.style.border = "1px solid #ccc";
  dataset.style.borderRadius = "10px";
  dataset.style.backgroundColor = "#fafafa";
  dataset.style.boxSizing = "border-box";

  var datasetFields = [];

  // Add a 'rowid' field at the beginning if it does not exist
  var rowid = jsonData.find((field) => field.fieldType === "rowid");
  if (!rowid && jsonData.length > 0) {
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


  // Fill the dataset or display "dataset empty" if no data
  if (jsonData.length > 0) {
    jsonData.forEach((fieldJson) => {
      var createField = createFieldFromJson(fieldJson);

      // Style each field to be flexible inside the grid
      createField.style.minHeight = "100px";
      if (fieldJson.fieldType === "hidden" || fieldJson.fieldType === "rowid") {
        createField.style.display = "none"; // Hide hidden and rowid fields
      } else {
        createField.style.display = "flex";
      }
      createField.style.flexDirection = "column";
      createField.style.justifyContent = "center";
      createField.style.boxSizing = "border-box";

      // Wrap the field inside a panel for navigation compatibility
      var panel = document.createElement("div");
      panel.className = "panel";
      panel.style.border = "1px solid #ddd";
      panel.style.borderRadius = "6px";
      panel.style.padding = "8px";
      panel.style.backgroundColor = "#fff";
      panel.style.boxSizing = "border-box";
      if (fieldJson.fieldType === "hidden" || fieldJson.fieldType === "rowid") {
        panel.style.display = "none"; // Hide the panel for hidden and rowid fields
      } else {
        panel.style.display = "flex"; // Show the panel for visible fields
      }
      panel.style.flexDirection = "column";
      panel.style.justifyContent = "center";

      panel.appendChild(createField);
      dataset.appendChild(panel);

      datasetFields.push(fieldJson.fieldName);
    });
  } else {
    // Case when no data is available
    var emptyMsg = document.createElement("div");
    emptyMsg.textContent = "Dataset vide...";
    emptyMsg.style.fontStyle = "italic";
    emptyMsg.style.color = "#777";
    emptyMsg.style.padding = "20px";
    dataset.appendChild(emptyMsg);
  }

  // Update attributes of the main element
  dataset.setAttribute("DataSet-Fields-List", datasetFields);
  main.setAttribute("DataSet-Fields-List", datasetFields);

  // Append the dataset to the main container
  main.appendChild(dataset);
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
      searchButton.style.width = "20px";
      searchButton.style.height = "20px";
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
        showQueryResultModal(DBName, datasetJson, queryArray[1], einput.id);
      };
      element.appendChild(searchButton);
      break;

    case "text":
      switch (fieldJson.fieldDataType) {
        case "integer":
        case "bigint":
        case "float":
        case "double":
        case "decimal":
        case "int64":
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
        case "logical":
        case "boolean":
        case "bool":
        case "bit":
          element = createElementInput("checkbox");
          einput = element.querySelector("input");
          einput.className = "apple-switch";

          // Set initial state
          if (fieldJson.fieldValues == "1") {
            einput.checked = true;
            einput.value = "1";
          } else {
            einput.checked = false;
            einput.value = "0";
          }

          // Listen to changes
          einput.addEventListener("change", function () {
            if (einput.checked) {
              einput.value = "1";
            } else {
              einput.value = "0";
            }
          });
          break;
        default:
          element = createElementInput("text");
          einput = element.querySelector("input");
          break;
      }


      break;
    case "rowid":
    case "hidden":
      element = createElementInput("hidden");
      einput = element.querySelector("input");
      element.style.display = "none";
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
    einput.setAttribute("tagname", fieldJson.fieldType);
    einput.setAttribute("validation", fieldJson.validation);

    // set einput disabled and readonly
    console.log("dataSetComponent einput readonly");
    einput.disabled = true;
    einput.readOnly = true;
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



// link record to grid using this web service /get-record-by-rowid/:tableName/:rowID and update the inputs with the data
// use the fetch function to call the web service and update the inputs with the data
// use the updateInputs function to update the inputs with the data
// use the setRowID function to set the current row id in the navigation bar
async function linkRecordToGrid(DBName, tableName, rowId, rowNum, dataset, link, rows) {
  /*
  console.log("linkRecordToGrid");
  console.log("DBName", DBName);
  console.log("tableName", tableName);
  console.log("rowId", rowId);
  console.log("rowNum", rowNum);
  console.log("dataset", dataset);
  console.log("link", link);
  console.log("rows", rows);
  */
  const saveBtn = document.querySelector("[name=SaveDSBtn]");
  if (saveBtn) saveBtn.disabled = true;

  try {
    // activate all the loaders by class name miniLoader
    activateLoaders();
    // get all the datasets
    var datasetsDiv = document.querySelectorAll("[tagname='dataSet']");

    // check if the datasetDiv exists
    if (datasetsDiv.length === 0) {
      showToast("No dataset found", 5000);
      return;
    }
    // get the datasetDiv
    const datasetDiv = datasetsDiv[0];

    // get the datasetJSON from the datasetDiv
    const dataset = JSON.parse(datasetDiv.getAttribute("dataSet"));
    //  console.log("dataset", dataset);

    // get the fields from the dataset
    const datasetFields = datasetDiv.getAttribute("dataset-fields-list");

    if (!link) { // if link is not defined
      link = [];
    }
    if (link.length === 0) {
      //console.log("link.length ===0");
      const url = `/get-record-by-rowid/${dataset[0].DBName}/${dataset[0].tableName}/${rowId}?fields=${datasetFields}`;
      //console.log("[FETCH by ROWID] URL:", url);

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            updateInputs(data[0], dataset[0].DBName, dataset[0].tableName, datasetDiv);
          }
          deactivateLoaders();
        })
        .catch((error) => console.error("Error:", error));
    } // end if link.length ===0
    else {
      console.log("link.length !==0");
      // check if the link exists in the dataset 

      // get the fields from the dataset and values from rows
      // and generate indexes and values in order to pass to             "/get-records-by-idexes/:database/:tableName",


      let indexes = [];
      let values = [];
      for (let j = 0; j < link.length; j++) {
        const field = link[j];
        indexes.push(field.fieldName);
        // get id for filed by array index dataset
        let idx = -1;
        // get the index of the field in the dataset
        console.log("rows", rows);

        for (let i = 0; i < dataset.length; i++) {
          let f = dataset[i];

          if (f.fieldName === field.fieldName) {
            console.log("f", f);

            f.fieldType = "hidden";
            // search the iput with the fieldname
            const input = datasetDiv.querySelector(`[dataset-field-name=${f.fieldName}]`);
            // convert the input to hidden
            input.type = "hidden";
            // set the parent to display none
            input.parentElement.style.display = "none";
            // idx+1 is the value of the field in the rows array considering 0 is the rowid
            values.push(rows[field.fieldName]);
          }  // end if

        }// end for i
      } // end for j
      console.log("indexes", indexes);
      console.log("values", values);


      const url = `/get-records-by-indexes/${dataset[0].DBName}/${dataset[0].tableName}?indexes=${indexes}&values=${values}&fields=${datasetFields}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          // get the divs document.querySelectorAll("#DataSet_" + tableName);


          // get the data length
          const dataLength = data.length;
          // check if datalength = datasetsFieldDiv.length
          // if datasetsFieldDiv.length > dataLength remove the extra divs
          if (datasetsDiv.length > dataLength && dataLength > 0) {
            for (let i = dataLength; i < datasetsDiv.length; i++) {
              datasetsDiv[i].remove();
            }
          }
          else // if datasetsFieldDiv.length < dataLength add the extra divs and copy the first div
            if (datasetsDiv.length < dataLength) {
              console.log("datasetsFieldDiv.length < dataLength");
              console.log("datasetsFieldDiv", datasetsDiv);
              console.log(datasetsDiv[0]);
              // get the first div html
              const firstDiv = datasetsDiv[0].outerHTML;
              for (let i = datasetsDiv.length; i < dataLength; i++) {
                // create a new div
                const newDiv = document.createElement("div");
                newDiv.innerHTML = firstDiv;
                // add the new div to the datasetDiv
                console.log("newDiv", newDiv);
                console.log("datasetsDiv", datasetsDiv);
                datasetsDiv[0].parentElement.appendChild(newDiv);
              }
            } // end else

          // update datasetsDiv
          datasetsDiv = document.querySelectorAll("[tagname='dataSet']");
          // update the inputs with the data for each datasetDiv
          datasetsDiv.forEach((datasetDiv, index) => {
            console.log(data[index]);
            console.log(datasetDiv);
            updateInputs(data[index], dataset[0].tableName, dataset[0].DBName, datasetDiv);
          });
          deactivateLoaders();
        })
        .catch((error) => console.error("Error:", error));
    } // end else

  } catch (error) {
    console.error("Error:", error);
  }
}

async function updateInputs(data, DBName, tableName, dataset) {
  /*
  console.log("updateInputs");
  console.log("data", data);
  */
  const datasetTableName = dataset.getAttribute("data-table-name");

  const inputs = dataset.querySelectorAll("input, select");

  inputs.forEach(async (input) => {
    const dbFieldName = input.getAttribute("DBName");
    const fieldLabel = input.getAttribute("dataset-field-name");
    // const fieldType = input.tagName.toLowerCase();
    const fieldType = input.getAttribute("type");
    input.value = "";

    //input.disabled = true;
    //input.readOnly = true;

    switch (fieldType) {
      case "array":
        let subField = data[fieldLabel]?.toString().trim().split(";");
        let arrayType = subField.every(
          (item) =>
            item === true || item === false || item == 0 || item == 1
        );
        input.value = data[fieldLabel];

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
                data[fieldLabel] = subField.join(";");
                input.value = data[fieldLabel];
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
            let subField = data[fieldLabel]
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
              console.log("Dtaset component read only child input");
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
        handleSelectField(input, fieldvalues, data[fieldLabel]);
        break;
      case "combo_sql":

        // get the values of the field
        let fieldSQL = input.getAttribute("dataset-field-SQL");
        handleSelectFieldSQL(
          DBName,
          input,
          fieldSQL,
          fieldLabel,
          data[fieldLabel]
        );
        break;

      default:
        // if (fieldType === "input") {
        input.value = data[fieldLabel]?.toString().trim() || "";
        input.disabled = false;
        if (input.type === "checkbox") {
          input.checked = data[fieldLabel] == 1 ? true : false;
        }
        if (input.tagName.toLowerCase() === "select") {
          input.value = data[fieldLabel]?.toString().trim() || "";
        }

        // }
        break;
    } // end switch
    // Enable the save button for the dataset
    // dataset.parentElement.querySelector(
    //   "[name=SaveDSBtn]"
    // ).disabled = false;
  }); // end inputs.forEach


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
      //check if the option has pipe | and split it
      if (option.includes("|")) {
        const [value, text] = option.split("|");
        optionElement.value = value.trim();
        optionElement.text = text.trim();
      } else if (option.includes("=")) {
        const [value, text] = option.split("=");
        optionElement.value = value.trim();
        optionElement.text = text.trim();
      } else if (option.includes(":")) {
        const [value, text] = option.split(":");
        optionElement.value = value.trim();
        optionElement.text = text.trim();
      } else if (option.includes(";")) {
        const [value, text] = option.split(";");
        optionElement.value = value.trim();
        optionElement.text = text.trim();
      }
      else {
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

/*
function regexp(event, fieldtable)
{
  console.log(event);
  const closestDataFieldElement = event.target.closest('[data-field]');

  console.log(closestDataFieldElement);

  // 
}
  */
function regexp(event, fieldtable) {
  // Log the event object for debugging
  console.log(event);

  // Find the closest parent element that has the 'data-field' attribute
  const closestDataFieldElement = event.target.closest('[data-field]');
  const dataContainer = closestDataFieldElement.querySelector('[name="dataContainer"]');
  // If no matching element is found, exit the function
  if (!closestDataFieldElement) {
    console.warn("No [data-field] element found.");
    return;
  }

  // Parse the JSON data stored in the 'data-field' attribute
  const fieldJson = JSON.parse(closestDataFieldElement.getAttribute('data-field'));

  // Get the new regular expression string from the input
  const newRegexp = event.target.value.trim();
  console.log(newRegexp);

  fieldJson['validation'] = newRegexp;

  // Save the updated JSON back into the 'data-field' attribute
  closestDataFieldElement.setAttribute('data-field', JSON.stringify(fieldJson));
  dataContainer.setAttribute('data-field', JSON.stringify(fieldJson));
  // Update the 'dataset-field-regexp' attribute on the actual input or select element
  const inputElement = closestDataFieldElement.querySelector('input, select');
  if (inputElement) {
    inputElement.setAttribute('dataset-field-regexp', newRegexp);
  }
  // Log the updated regular expression to the console
  console.log("Regular expression updated:", newRegexp);
}

