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


function createDatabaseGrid(type) {
  var main = document.createElement("div");
  main.className = "grid-container";
  main.id = type + Date.now(); // Unique ID for each new element
  main.draggable = true;
  main.tagName = type;
  main.style.minHeight = "450px";
  main.style.display = "flex";
  return main;
}

function editDatabaseGrid(type, element, content) {
  const button = document.createElement("button");
  button.textContent = "update";
  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    updateGridData(main, content);
  };
  content.appendChild(button);
  content.appendChild(createMultiSelectItem("Data", "data", "data"));
  content.appendChild(createMultiSelectItem("Link", "link", "link"));

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
  if (element.getAttribute("datasetgrid") != null) {
    var target = content.querySelector("#Data");
    var jsonData = JSON.parse(element.getAttribute("datasetgrid"));
    jsonData.forEach((fieldJson) => {
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
}

function updateGridData(main, content) {
  console.log("updateGridData");

  // get all the span elements from data
  var data = content.querySelectorAll('span[name="dataContainer"]');
  // generate the json of all the data
  var jsonData = [];
  data.forEach((span) => {
    // get the json data from the span
    var json = JSON.parse(span.getAttribute("data-field"));
    // add the field to the json
    jsonData.push(json);
  });
  main.setAttribute("dataSetGrid", JSON.stringify(jsonData));
  // create intermedite div container

  renderGrid(main);
}

function renderGrid(main) {
  // get the data from the element
  var data = main.getAttribute("dataSetGrid");
  // parse the json
  var jsonData = JSON.parse(data);
  // get the main div
  var datasetFields = ["rowid"];
  var datasetFieldsTypes = ["rowid"];
  jsonData.forEach((field) => {
    datasetFields.push(field.fieldName);
    datasetFieldsTypes.push(field.fieldType);
  });
  main.innerHTML = "";
  main.style.padding = "10px";

  var table = document.createElement("div");
  table.className = "table-container";
  table.setAttribute("tag-Name", "dataTable");
  table.id = "Data-Grid_" + jsonData[0].tableName;
  table.setAttribute("DBName", jsonData[0].DBName); 

  createGrid(table,jsonData[0].DBName, jsonData[0].tableName, datasetFields, datasetFieldsTypes);
  main.appendChild(table);
  // generate div for the dataset
  var datasetDiv = document.createElement("div");
  datasetDiv.className = "dataset-container";
  datasetDiv.id = "DataSet_" + jsonData[0].tableName;
  datasetDiv.setAttribute("grid-id", table.id);
  main.appendChild(datasetDiv);
  insertNavBar(
    datasetDiv,
    jsonData[0].DBName,
    jsonData[0].tableName,
    datasetFields,
    datasetFieldsTypes
  );
}

function insertNavBar(
  gridContainer,
  DBName,
  tableName,
  datasetFields,
  datasetFieldsTypes
) {
  // create search structure
  // search header
  var search = document.createElement("div");
  search.style.display = "table";
  var searchfields = document.createElement("select");
  searchfields.className = "input-element";
  searchfields.setAttribute("id", "searchfields");
  search.appendChild(searchfields);
  for (var i = 0; i < datasetFields.length; i++) {
    field = datasetFields[i];
    const cell = document.createElement("option");

    if (field !== "rowid") {
      cell.textContent = field;
      cell.value = field;
    }
    searchfields.appendChild(cell);
  }
  searchOperator = document.createElement("select");
  searchOperator.className = "input-element";
  searchOperator.setAttribute("id", "searchOperator");
  search.appendChild(searchOperator);
  const operators = ["like", "eq", "gt", "lt", "gte", "lte"];
  for (var i = 0; i < operators.length; i++) {
    const cell = document.createElement("option");
    cell.textContent = operators[i];
    cell.value = operators[i];
    searchOperator.appendChild(cell);
  }
  var input = document.createElement("input");
  input.type = "text";
  input.className = "input-element";
  input.setAttribute("id", "searchValue");
  // set search event on keyup
  //get the search fields by options index

  input.setAttribute(
    "onkeyup",
    `searchGrid(searchfields.options[searchfields.options.selectedIndex].value,searchOperator.value,this.value,"${gridContainer.parentElement.id}")`
  );

  search.appendChild(input);

  var html = `<div class="right-panel">`;
  html += `<div class="navigation-bar-title">Record: </div>`;
  html += search.outerHTML;

  html += `<span style='font-size:8px'>Page Size:</span><select id="gridPage" class="input-element" onchange='grid_page_size(event,"${gridContainer.parentElement.id}")' style='width:60px;font-size:8px'>`;
  html += `<option value='5'>5</option>`;
  html += `<option value='10'>10</option>`;
  html += `<option value='20'>20</option>`;
  html += `<option value='50'>50</option>`;
  html += `<option value='100'>100</option>`;
  html += `</select>`; // record count

  html += `<button name='revGRIDBtn'  title='Previus Page'  grid-id='${gridContainer.parentElement.id}' onclick='gridPrev(event,"${DBName}","${tableName}")'><i class='bi bi-arrow-left-circle-fill' grid-id='${gridContainer.parentElement.id}'  style='color:blue;'></i></button>`;
  html += `<button name='NextGRIDBtn' title='Next Page'  grid-id='${gridContainer.parentElement.id}' onclick='gridNext(event,"${DBName}","${tableName}")'><i class='bi bi-arrow-right-circle-fill' grid-id='${gridContainer.parentElement.id}' style='color:blue;'></i></button>`;
  html += `<button name='RefreshGRIDBtn' title='Refresh'  grid-id='${gridContainer.parentElement.id}' onclick='refresh(event,"${DBName}","${tableName}")'><i class='bi bi-arrow-repeat' grid-id='${gridContainer.parentElement.id}'  style='color:green;'></i></button>`;
  html += `<button name='PostitGRIDBtn' title='Postit'  grid-id='${gridContainer.parentElement.id}' onclick='postit(event,"${DBName}","${tableName}")'><i class='bi bi-card-text' grid-id='${gridContainer.parentElement.id}' style='color:#aa0;'></i></button>`;
  html += `<button name='ExportGRIDBtn' title='Export Data'  grid-id='${gridContainer.parentElement.id}' onclick='export2CSV(event,"${DBName}","${tableName}")'><i class='bi bi-file-spreadsheet' grid-id='${gridContainer.parentElement.id}' style='color:green;'></i></button></div>`;
  html += `<div id="Data-Grid-Postit" style="display:none;position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0.5); z-index: 1000;"></div>`;
  html += "</div>";

  gridContainer.innerHTML += html;
}

//Grid code
function createGrid(grid,DBName, tableName, datasetFields, datasetFieldsTypes) {
  //header
  grid.setAttribute("dataset-table-name", tableName);
  grid.setAttribute("current_page", 1);
  grid.setAttribute("page_size", 5);
  grid.setAttribute("Table-Name", tableName);
  grid.setAttribute("DBName", DBName);

  // table header
  var header = document.createElement("div");
  header.className = "grid-header";

  // header
  var row = document.createElement("div");
  row.className = "grid-row";

  datasetFields.forEach((field) => {
    if (field !== "rowid") {
      const cell = document.createElement("div");
      cell.className = "grid-cell-header";
      cell.textContent = field !== "rowid" ? field : "";
      row.appendChild(cell);
    } else {
      const cell = document.createElement("div");
      cell.style.display = "none";
      cell.className = "";
      cell.textContent = "";
      row.appendChild(cell);
    }
  });
  header.appendChild(row);
  grid.appendChild(header);
  // search inputs

  grid.setAttribute("Dataset-Fields-Names", datasetFields);
  grid.setAttribute("Dataset-Fields-Types", datasetFieldsTypes);
  const body = document.createElement("div");
  body.className = "grid-body";
  grid.appendChild(body);
  //set search inputs
  gridFetchData(grid);
}

function grid_page_size(e, dataGridId) {
  e.preventDefault();
  // get selected page size
  var pageSize = e.target[e.target.selectedIndex].value;
  // get parent grid
  const grid = document.getElementById(dataGridId);
  const gridTable = grid.querySelector('[tag-Name="dataTable"]');

  gridTable.setAttribute("page_size", pageSize);
  gridTable.setAttribute("current_page", 1);
  searchGrid("", "", "", dataGridId);
}

function gridPrev(e,DBName, tableName) {
  e.preventDefault();

  // get parent grid n
  const mainID = e.target.getAttribute("grid-id");
  const grid = document
    .getElementById(mainID)
    .querySelector('[dataset-table-name="' + tableName + '"]');
  if (grid) {
    var currentPage = parseInt(grid.getAttribute("current_page"));
    if (currentPage > 1) {
      currentPage--;
    }

    grid.setAttribute("current_page", currentPage);
    removeAllChildRows(grid);
    gridFetchData(grid);
  }
}

function gridNext(e,DBName, tableName) {
  e.preventDefault();
  // get parent grid n
  const mainID = e.target.getAttribute("grid-id");
  const grid = document
    .getElementById(mainID)
    .querySelector('[dataset-table-name="' + tableName + '"]');
  // get the json

  if (grid) {
    var currentPage = parseInt(grid.getAttribute("current_page"));
    currentPage++;
    grid.setAttribute("current_page", currentPage);
    removeAllChildRows(grid);
    gridFetchData(grid);
  }
}

function searchGrid(DBName,filterName, FilterOp, filterValue, gridID) {
  const grid = document.getElementById(gridID);
  const tableGrid = grid.querySelector('[tag-name="dataTable"]');
  tableGrid.setAttribute("current_page", 1);
  var tableName = tableGrid.getAttribute("Table-Name");
  var datasetFields = tableGrid.getAttribute("Dataset-Fields-Names");
  var datasetFieldsTypes = tableGrid.getAttribute("Dataset-Fields-Types");
  removeAllChildRows(tableGrid);
  var pageSize = parseInt(tableGrid.getAttribute("page_size"));
  // check if filter is empty
  var filter = filterName + "|" + FilterOp + "|" + filterValue;
  if (filterValue == "") {
    filter = "";
  }
  gridGetData(tableGrid, DBName,tableName, 1, pageSize, datasetFields, filter);
}

// export grid to csv
function export2CSV(e,DBName, tabelName) {
  e.preventDefault();
  const grid = document.getElementById("Data-Grid_" + tabelName);
  var tableName = grid.getAttribute("Table-Name");
  var datasetFields = grid.getAttribute("Dataset-Fields-Names");
  // call the export service
  const url = `/export-table/${DBName}/${tableName}?fields=${datasetFields}`;
  window.open(url, "_blank");
}

//remove all rows except the row get have the header attribute
function removeAllChildRows(grid) {
  // get body form the table
  const body = grid.querySelector(".grid-body");
  //remove all rows in the body
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }
}

function gridFetchData(grid, body) {
  var DBName = grid.getAttribute("DBName");
  var tableName = grid.getAttribute("Table-Name");

  var currentPage = parseInt(grid.getAttribute("current_page"));
  var pageSize = parseInt(grid.getAttribute("page_size"));
  var datasetFields = grid.getAttribute("dataset-fields-names");
  var currentPage = parseInt(currentPage);
  fetchTableData(grid,DBName, tableName, currentPage, pageSize, datasetFields);
}

function fetchTableData(grid,DBName, tableName, page, pageSize, datasetFields) {
  // Prepare the fields query parameter
  // create filter for search based on the input values, with field name and value separated by | and each filter separated by ,
  var filter = "";
  var i = 0;
  var filtervalue = grid.querySelectorAll('input[id^="searchValue"]');
  var searchfields = grid.querySelectorAll('select[id^="searchfields"]');
  var searchOperator = grid.querySelectorAll('select[id^="searchOperator"]');
  if (filtervalue.length > 0) {
    filter = filtervalue[0].value;
    filter += "|";
    filter += searchfields[0].value;
    filter += "|";
    filter += searchOperator[0].value;
  }

  gridGetData(grid,DBName, tableName, page, pageSize, datasetFields, filter);
}

// get the filter type based on the field type
function getFilterType(fieldType) {
  switch (fieldType) {
    case "string":
      return "like";
    case "number":
      return "eq";
    case "date":
      return "eq";
    default:
      return "like";
  }
}

async function gridGetData(
  grid,
  DBName,
  tableName,
  page,
  pageSize,
  datasetFields,
  filter
) {
  //get body form the table
  const body = grid.querySelector(".grid-body");
  // Prepare the URL
  const url = `/table-data/${DBName}/${tableName}/${page}/${pageSize}?fields=${datasetFields}&filter=${filter}`;
  // Fetch the data from the web service
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    // The data is now available
    for (var j = 0; j < data.length; j++) {
      let record = j;
      const row = Object.values(data[j]);
      const keys = Object.keys(data[j]);

      var rowDiv = document.createElement("div");
      if (j % 2 == 0) rowDiv.style.backgroundColor = "#f2f2f2";
      else rowDiv.style.backgroundColor = "#ffffff";
      rowDiv.className = "grid-row";
      rowDiv.setAttribute("rowid", row[0]);
      // add click event to row to call linkRecordToGrid(tableName, rowId)
      rowDiv.addEventListener("click", function (event) {
        event.preventDefault();
        // find div in dataset
        /* var datasetDivs = document.querySelectorAll('#DataSet_' + tableName);
                  console.log(".----"+datasetDivs + " - " + tableName);
                  // get the datasetFieldsLink
                  datasetDivs.forEach(datasetDiv => {
                      const datasetFieldsLink = datasetDiv.getAttribute("Dataset-Fields-List");
                      console.log(datasetFieldsLink + " " + row.rowid + " " + j + page * pageSize);
                      linkRecordToGrid(tableName, datasetFieldsLink, row.rowid, j + page * pageSize);
                  });
                  */
        var datasetDiv = document.getElementById("DataSet_" + tableName);
        const datasetFieldsLink = datasetDiv.getAttribute(
          "Dataset-Fields-List"
        );
        linkRecordToGrid(DBName,tableName, row[0], record + (page - 1) * pageSize);
      });
      var i = 0;
      row.forEach((field, index) => {
        const cell = document.createElement("div");
        cell.className = "grid-cell";

        rowDiv.appendChild(cell);
        // skip rowid field
        if (i == 0) {
          cell.style.display = "none";
          cell.textContent = field;
        } else {
          let subField = field.toString().trim().split(";");
          if (subField.length > 1) {
            // Clear any previous content
            cell.innerHTML = "";

            // Create a container for the content
            const contentDiv = document.createElement("div");
            contentDiv.style.maxHeight = "200px"; // Adjust height as needed
            contentDiv.style.overflowY = "auto";
            contentDiv.style.whiteSpace = "pre-wrap"; // Preserve white spaces and line breaks

            subField.forEach((item, subIndex) => {
              const line = document.createElement("div");
              line.textContent = `${
                keys[index] == "droit" ? droit[subIndex] : "gama"
              }: ${item}`;
              contentDiv.appendChild(line);
            });

            cell.appendChild(contentDiv);
          } else {
            cell.textContent = field;
          }
        }
        i++;
      });
      body.appendChild(rowDiv);
    }
    let row = document.createElement("div");
    row.style.height = "100%";
    body.appendChild(row);
  } catch (error) {
    console.error("Error:", error);
  }
}
