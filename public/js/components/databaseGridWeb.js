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

function createDatabaseGridWeb(type) {
  var main = document.createElement("div");
  main.className = "grid-container";
  main.id = type + Date.now(); // Unique ID for each new element
  main.draggable = true;
  main.tagName = type;
  main.style.height = "450px";
  return main;
}

function editDatabaseGridWeb(type, element, content) {
  const button = document.createElement("button");
  button.textContent = "update";
  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    updateGridDataWeb(main, content);
  };
  content.appendChild(button);
  content.appendChild(
    createMultiSelectItemWeb("DataGrid", "data", "data", false)
  );

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
    var target = content.querySelector("#DataGrid");
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

function updateGridDataWeb(main, content) {
  // get all the span elements from data
  var data = content.querySelectorAll('span[name="dataContainer"]');
  if (data.length == 0) return; // no data to update

  var firstJson;
  // get the first span element
  firstJson = JSON.parse(data[0].getAttribute("data-field"));
  // generate the json of all the data
  var jsonData = [];
  data.forEach((span) => {
    // get the json data from the span
    var json = JSON.parse(span.getAttribute("data-field"));
    // add the field to the json
    json.fieldId = `${main.id}_${json.fieldId}`;
    jsonData.push(json);
  });
  main.setAttribute("dataSetGrid", JSON.stringify(jsonData));
  main.setAttribute(
    "data-api-url",
    firstJson.controllerServerUrl + firstJson.apiPath.slice(1)
  );
  main.setAttribute("data-api-method", firstJson.apiMethod);
  main.setAttribute("data-api-id", firstJson.apiId);
  // create intermedite div container

  renderGridWeb(main);
}

function renderGridWeb(main) {
  // get the data from the element
  var data = main.getAttribute("dataSetGrid");
  // parse the json
  var jsonData = JSON.parse(data);
  var apiUrl = main.getAttribute("data-api-url");
  var apiMethod = main.getAttribute("data-api-method");
  var apiId = main.getAttribute("data-api-id");
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
  table.id = "Data-Grid_" + jsonData[0]?.apiName;
  table.setAttribute("apiUrl", apiUrl);
  table.setAttribute("apiMethod", apiMethod);
  table.setAttribute("apiId", apiId);
  var datasetDiv = document.createElement("div");
  // datasetDiv.className = "dataset-container";
  datasetDiv.id = "DataSet_" + jsonData[0].apiName;
  datasetDiv.setAttribute("grid-id", table.id);
  main.appendChild(datasetDiv);
  insertNavBarWeb(
    datasetDiv,
    jsonData[0].apiName,
    datasetFields,
    datasetFieldsTypes
  );
  createGridWeb(table, jsonData[0].apiName, datasetFields, datasetFieldsTypes);
  main.appendChild(table);
  // generate div for the dataset
}

function insertNavBarWeb(
  gridContainer,
  apiName,
  datasetFields,
  datasetFieldsTypes
) {
  // create search structure
  // search header
  var search = document.createElement("div");
  search.style.display = "flex";
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
  var searchOperator = document.createElement("select");
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
    `searchGridWeb(searchfields.options[searchfields.options.selectedIndex].value,searchOperator.options[searchOperator.options.selectedIndex].value,this.value,"${gridContainer.parentElement.id}")`
  );
  search.appendChild(input);

  var html = `<div class="right-panel">`;
  // html += `<div class="navigation-bar-title">Record: </div>`;
  // <span style='font-size:8px'>Page Size:</span>
  html += search.outerHTML;
  html += `<div style='display: flex; align-items: center; gap: 10px;'>`;
  html += `<button name='revGRIDBtn'  title='Previous Page'  grid-id='${gridContainer.parentElement.id}' onclick='gridPrevWeb(event,"${apiName}",searchfields.options[searchfields.options.selectedIndex].value,searchOperator.value)'><i class='bi bi-arrow-left-circle-fill' grid-id='${gridContainer.parentElement.id}'  style='color:blue;'></i></button>`;
  html += `<button name='NextGRIDBtn' title='Next Page'  grid-id='${gridContainer.parentElement.id}' onclick='gridNextWeb(event,"${apiName}",searchfields.options[searchfields.options.selectedIndex].value,searchOperator.value)'><i class='bi bi-arrow-right-circle-fill' grid-id='${gridContainer.parentElement.id}' style='color:blue;'></i></button>`;
  html += `<button name='RefreshGRIDBtn' title='Refresh'  grid-id='${gridContainer.parentElement.id}' onclick='refreshWeb(event,"${apiName}")'><i class='bi bi-arrow-repeat' grid-id='${gridContainer.parentElement.id}'  style='color:green;'></i></button>`;
  html += `<button name='PostitGRIDBtn' title='Postit'  grid-id='${gridContainer.parentElement.id}' onclick='postitWeb(event,"${apiName}")'><i class='bi bi-card-text' grid-id='${gridContainer.parentElement.id}' style='color:#aa0;'></i></button>`;
  html += `<button name='ExportGRIDBtn' title='Export Data'  grid-id='${gridContainer.parentElement.id}' onclick='export2CSVWeb(event,"${apiName}")'><i class='bi bi-file-spreadsheet' grid-id='${gridContainer.parentElement.id}' style='color:green;'></i></button>`;

  html += `<button name='gridView' title='Grid View'  grid-id='${gridContainer.parentElement.id}'onclick='switchViewWeb(event,"${apiName}","${gridContainer.parentElement.id}","grid")'>` +
    `<i class='bi bi-grid-3x3-gap-fill' style='color:blue;'></i>` + `</button>`;

  html += `<button name='panelView' title='Panel View'  grid-id='${gridContainer.parentElement.id}'onclick='switchViewWeb(event,"${apiName}","${gridContainer.parentElement.id}","panel")'>` +
    `<i class='bi bi-card-list'  style='color:blue;'></i>` + `</button></div>`;

  html += `<div id="Data-Grid-Postit" style="display:none;position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0.5); z-index: 1000;"></div>`;
  html += `<select id="gridPage" class="input-element" onchange='grid_page_sizeWeb(event,"${gridContainer.parentElement.id}",searchfields.options[searchfields.options.selectedIndex].value,searchOperator.value)' style='width:60px;font-size:14px'>`;
  html += `<option value='5'>5</option>`;
  html += `<option value='10'>10</option>`;
  html += `<option value='20'>20</option>`;
  html += `<option value='50'>50</option>`;
  html += `<option value='100'>100</option>`;
  html += `</select>`; // record count
  html += `</div>`;

  html += "</div>";

  gridContainer.innerHTML += html;
}
function generateHeaderRowWeb(grid, datasetFields) {
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
}

//Grid code
function createGridWeb(grid, apiName, datasetFields, datasetFieldsTypes) {
  //header
  grid.setAttribute("dataset-api-table-name", apiName);
  grid.setAttribute("current_page", 1);
  grid.setAttribute("page_size", 5);
  grid.setAttribute("api-name", apiName);
  grid.setAttribute("view-web", "standered");
  // table header
  generateHeaderRowWeb(grid, datasetFields)
  // search inputs
  grid.setAttribute("Dataset-Fields-Names", datasetFields);
  grid.setAttribute("Dataset-Fields-Types", datasetFieldsTypes);
  const body = document.createElement("div");
  body.className = "grid-body";

  grid.appendChild(body);
  //set search inputs
  gridFetchDataWeb(grid);
}
function switchViewWeb(e, apiName, gridID, viewWeb) {

  e.preventDefault();
  // get the grid
  const grid = document.getElementById(gridID);
  grid.setAttribute("view-web", viewWeb);
  searchGridWeb("", "", "", gridID); // refresh the grid
}

function grid_page_sizeWeb(e, dataGridId, fieldName, operator) {
  e.preventDefault();
  let searchValue = document.getElementById("searchValue").value;
  // get selected page size
  var pageSize = e.target[e.target.selectedIndex].value;
  // get parent grid
  const grid = document.getElementById(dataGridId);
  const gridTable = grid.querySelector('[tag-Name="dataTable"]');
  gridTable.setAttribute("page_size", pageSize);
  gridTable.setAttribute("current_page", 1);
  searchGridWeb(fieldName, operator, searchValue, dataGridId);
}

function gridPrevWeb(e, apiName, fieldName, operator) {
  e.preventDefault();
  let searchValue = document.getElementById("searchValue").value;
  const mainID = e.target.getAttribute("grid-id");
  const grid = document
    .getElementById(mainID)
    .querySelector('[dataset-api-table-name="' + apiName + '"]');
  if (grid) {
    var currentPage = parseInt(grid.getAttribute("current_page"));
    if (currentPage > 1) {
      currentPage--;
    }
    grid.setAttribute("current_page", currentPage);
    removeAllChildRows(grid);
    gridFetchDataWeb(grid, fieldName, operator, searchValue, true);
  }
}

function gridNextWeb(e, apiName, fieldName, operator) {
  e.preventDefault();
  let searchValue = document.getElementById("searchValue").value;
  const mainID = e.target.getAttribute("grid-id");
  const grid = document
    .getElementById(mainID)
    .querySelector('[dataset-api-table-name="' + apiName + '"]');
  if (grid) {
    var currentPage = parseInt(grid.getAttribute("current_page"));
    var pageSize = parseInt(grid.getAttribute("page_size"));
    grid.setAttribute("lastStartValue", (currentPage - 1) * pageSize);
    currentPage++;
    grid.setAttribute("current_page", currentPage);
    removeAllChildRows(grid);
    gridFetchDataWeb(grid, fieldName, operator, searchValue, true);
  }
}
function refreshWeb(e, apiName) {
  e.preventDefault();
  const mainID = e.target.getAttribute("grid-id");
  const grid = document
    .getElementById(mainID)
    .querySelector('[dataset-api-table-name="' + apiName + '"]');
  document.getElementById("searchValue").value = "";
  if (grid) {
    grid.setAttribute("current_page", 1);
    removeAllChildRows(grid);
    gridFetchDataWeb(grid);
  }
}

function gridViewWeb(view, tableGrid, apiName, page, pageSize, datasetFields, filter) {
  switch (view) {
    case "standard":
      // tableGrid.innerHTML = "";
      // generateHeaderRowWeb(tableGrid, datasetFields.split(","));
      gridGetDataWeb(tableGrid, apiName, page, pageSize, datasetFields, filter);
      break;
    case "panel":
      gridGetDataInPanelFormatWeb(tableGrid, apiName, page, pageSize, datasetFields, filter);
      break;
    default:
      // generateHeaderRowWeb(tableGrid, datasetFields.split(","))
      gridGetDataWeb(tableGrid, apiName, page, pageSize, datasetFields, filter);
  }
}

function searchGridWeb(filterName, FilterOp, filterValue, gridID) {

  const grid = document.getElementById(gridID);
  // const tableGrid = grid.querySelector('[tagname="dataTable"]');
  const tableGrid = grid.children[1]; // Selects the second child of grid
  tableGrid.setAttribute("current_page", 1);
  var apiName = tableGrid.getAttribute("api-name");
  var datasetFields = tableGrid.getAttribute("Dataset-Fields-Names");
  var datasetFieldsTypes = tableGrid.getAttribute("Dataset-Fields-Types");
  removeAllChildRows(tableGrid);
  var pageSize = parseInt(tableGrid.getAttribute("page_size"));
  var filter = filterName + "|" + FilterOp + "|" + filterValue;
  grid.setAttribute("filter", filter);

  if (filterValue == "") {
    filter = "";
  }
  var view = grid.getAttribute("view-web");

  gridViewWeb(view, tableGrid, apiName, 1, pageSize, datasetFields, filter);
}

function export2CSVWeb(e, tabelName) {
  e.preventDefault();
  const grid = document.getElementById("Data-Grid_" + tabelName);
  var json = grid.getAttribute("jsondata");
  json = JSON.parse(json);
  // Check if JSON data exists
  if (!json || json.length === 0) {
    console.error("No data to export");
    return;
  }
  // Convert JSON to CSV
  const csv = convertJSONToCSV(json);
  // Trigger CSV download
  downloadCSV(csv, tabelName + ".csv");
}

function convertJSONToCSV(json) {
  const array = Array.isArray(json) ? json : [json];
  const headers = Object.keys(array[0]);
  // Create CSV header row
  const csvRows = [headers.join(",")];
  // Create CSV rows for each JSON object
  array.forEach((obj) => {
    const values = headers.map((header) => {
      const escaped = ("" + obj[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  // Clean up
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function removeAllChildRows(grid) {
  const body = grid.querySelector(".grid-body");
  while (body.firstChild) {
    body.removeChild(body.firstChild);
  }
}

function gridFetchDataWeb(
  grid,
  fieldName = null,
  operator = null,
  searchValue = null,
  moveNext = false
) {
  var apiName = grid.getAttribute("api-name");
  var currentPage = parseInt(grid.getAttribute("current_page"));
  var pageSize = parseInt(grid.getAttribute("page_size"));
  var datasetFields = grid.getAttribute("dataset-fields-names");
  var currentPage = parseInt(currentPage);
  fetchTableDataWeb(
    grid,
    apiName,
    currentPage,
    pageSize,
    datasetFields,
    fieldName,
    operator,
    searchValue,
    moveNext
  );
}

function fetchTableDataWeb(
  grid,
  apiName,
  page,
  pageSize,
  datasetFields,
  fieldName = null,
  operator = null,
  searchValue = null,
  moveNext = false
) {
  var filter = "";
  var i = 0;
  if (searchValue) {
    filter = fieldName;
    filter += "|";
    filter += operator;
    filter += "|";
    filter += searchValue;
  }
  if (moveNext) {
    const view = grid.parentElement.getAttribute("view-web") || "standard"
    gridViewWeb(view, grid, apiName, page, pageSize, datasetFields, filter);
  } else {
    gridGetDataWeb(grid, apiName, page, pageSize, datasetFields, filter);
  }
}

const filterKeys = (data, keys) => {
  return data.map((item) => {
    return keys.reduce((acc, key) => {
      if (item.hasOwnProperty(key)) {
        acc[key] = item[key];
      }
      return acc;
    }, {});
  });
};

async function gridGetDataWeb(
  grid,
  apiName,
  page,
  pageSize,
  datasetFields,
  filter
) {
  //get body form the table
  const body = grid.querySelector(".grid-body");
  var apiUrl = grid.getAttribute("apiUrl");
  var apiMethod = grid.getAttribute("apiMethod");
  let fields = datasetFields.split(",");
  // Fetch the data from the web service
  let fieldIndex = page - 1;
  fieldIndex = fieldIndex * pageSize;
  const lastStartValue = grid.getAttribute("lastStartValue");

  try {
    let data;
    const response = await callApi(apiUrl, apiMethod);
    if (!response || response.status !== 200) return;
    data = await response.json();
    if (filter && data?.data) {
      const searchFilter = filter.split("|");
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
    }
    let jsonData = data.data;
    const filteredData = filterKeys(jsonData, fields);
    grid.setAttribute("jsonData", JSON.stringify(filteredData));
    grid.setAttribute("datasetFields", datasetFields);
    grid.setAttribute("apiName", apiName);
    grid.setAttribute("page", page);
    grid.setAttribute("pageSize", pageSize);
    if (fieldIndex > data.data.length) {
      fieldIndex = lastStartValue;
      grid.setAttribute("current_page", page - 1);
    }

    // The data is now available
    for (var j = fieldIndex; j < fieldIndex + pageSize; j++) {
      let record = j;
      const rowData = data.data[j];
      let row = [];
      fields.forEach((val) => {
        row.push(rowData[val]);
      });
      var rowDiv = document.createElement("div");
      if (j % 2 == 0) rowDiv.style.backgroundColor = "#f2f2f2";
      else rowDiv.style.backgroundColor = "#ffffff";
      rowDiv.className = "grid-row";
      rowDiv.setAttribute("rowid", row[0]);
      if (record == 0) {
        rowDiv.classList.add("grid-row-selected"); // Add default selection to the first row
        linkRecordToGridWeb(
          rowData, record
        );
      }
      // add click event to row to call linkRecordToGrid(apiName, rowId)
      rowDiv.addEventListener("click", function (event) {
        const allRows = document.querySelectorAll(".grid-row");
        allRows.forEach((row) => row.classList.remove("grid-row-selected"));
        this.classList.add("grid-row-selected");

        linkRecordToGridWeb(rowData, record);
      });
      var i = 0;

      row.forEach((field) => {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        rowDiv.appendChild(cell);
        // skip rowid field
        if (i == 0) {
          cell.style.display = "none";
          cell.textContent = field;
        } else {
          cell.textContent = field;
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


async function gridGetDataInPanelFormatWeb(
  grid,
  apiName,
  page,
  pageSize,
  datasetFields,
  filter
) {
  try {
    // Validate datasetFields
    if (!datasetFields || typeof datasetFields !== "string") {
      console.error("Invalid datasetFields: Expected a non-empty string.");
      return;
    }

    // Split datasetFields into an array
    const fields = datasetFields.split(",").map((field) => field.trim());
    // Get the grid body
    const body = grid.querySelector(".grid-body");
    const header = grid.querySelector(".grid-header");
    if (header) {
      header.remove();
    }
    if (!body) {
      console.error("Grid body element not found.");
      return;
    }
    body.innerHTML = ""; // Clear existing content

    // Get API URL and method from grid attributes
    const apiUrl = grid.getAttribute("apiUrl");
    const apiMethod = grid.getAttribute("apiMethod");
    if (!apiUrl || !apiMethod) {
      console.error("API URL or Method not found.");
      return;
    }

    // Calculate starting index for pagination
    const fieldIndex = (page - 1) * pageSize;

    // Fetch data from the API
    const response = await callApi(apiUrl, apiMethod);
    if (!response || response.status !== 200) {
      console.error(`API request failed with status ${response?.status}`);
      return;
    }

    const data = await response.json();

    // Apply filter if provided
    if (filter && data?.data) {
      const searchFilter = filter.split("|");
      if (searchFilter.length < 3) {
        console.error("Invalid filter format. Expected format: 'field|operator|value'.");
        return;
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

      if (!operatorMap[operator]) {
        console.error(`Invalid operator: ${operator}`);
        return;
      }

      // Filter the data
      data.data = data.data.filter((item) => {
        const fieldValue = item[field];
        if (fieldValue == null) return false;

        let processedFieldValue;
        let processedValue;

        // Date comparison
        if (!isNaN(Date.parse(fieldValue)) && !isNaN(Date.parse(value))) {
          processedFieldValue = new Date(fieldValue);
          processedValue = new Date(value);
          return operatorMap[operator](processedFieldValue.getTime(), processedValue.getTime());
        }

        // Numeric comparison
        if (!isNaN(fieldValue) && !isNaN(value)) {
          processedFieldValue = parseFloat(fieldValue);
          processedValue = parseFloat(value);
          return operatorMap[operator](processedFieldValue, processedValue);
        }

        // String comparison for 'like'
        if (operator === "like") {
          return operatorMap[operator](fieldValue.toString(), value.toString());
        }

        return false; // Unsupported comparison
      });
    }

    const jsonData = data?.data || [];

    // Filter the data to include only the specified datasetFields
    const filteredData = jsonData.map((item) =>
      fields.reduce((acc, field) => {
        if (field in item) {
          acc[field] = item[field];
        }
        return acc;
      }, {})
    );

    grid.setAttribute("jsonData", JSON.stringify(filteredData));
    grid.setAttribute("datasetFields", datasetFields);
    grid.setAttribute("apiName", apiName);
    grid.setAttribute("page", page);
    grid.setAttribute("pageSize", pageSize);

    // Render panels for the filtered data
    filteredData.slice(fieldIndex, fieldIndex + pageSize).forEach((record, index) => {
      const panelDiv = document.createElement("div");
      panelDiv.className = "panel";
      panelDiv.style.border = "1px solid #ddd";
      panelDiv.style.borderRadius = "8px";
      panelDiv.style.padding = "10px";
      panelDiv.style.marginBottom = "10px";
      panelDiv.style.backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff";
      if (index == 0) {
        panelDiv.classList.add("selected-panel"); // Add default selection to the first row

        // call linkRecordToGrid(tableName, rowId)
        linkRecordToGridWeb(
          record, index
        );
      }
      panelDiv.addEventListener("click", function () {
        // Highlight selected panel
        const panels = grid.querySelectorAll(".panel");
        panels.forEach((panel) => {
          panel.classList.remove("selected-panel");
        });
        panelDiv.classList.add("selected-panel");

        // Call linkRecordToGrid with appropriate arguments
        linkRecordToGridWeb(
          record, index
        );
      });
      // Alternate colors

      // Display only specified fields
      Object.entries(record).forEach(([key, value]) => {
        if (key === "rowid") return; // Skip hidden fields

        const fieldDiv = document.createElement("div");
        fieldDiv.className = "field";
        fieldDiv.style.marginBottom = "5px";

        const fieldName = document.createElement("span");
        fieldName.style.fontWeight = "bold";
        fieldName.textContent = `${key}: `;

        const fieldValue = document.createElement("span");
        fieldValue.textContent = value || "-";

        fieldDiv.appendChild(fieldName);
        fieldDiv.appendChild(fieldValue);

        panelDiv.appendChild(fieldDiv);
      });

      body.appendChild(panelDiv);
    });

    // Append an empty row for layout consistency
    const row = document.createElement("div");
    row.style.height = "100%";
    body.appendChild(row);
  } catch (error) {
    console.error("Error in gridGetDataInPanelFormatWeb:", error);
  }
}
