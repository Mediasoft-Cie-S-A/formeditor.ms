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
  button.style.width = "100%";
  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    updateGridData(main, content);

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


  content.appendChild(createSQLBox("SQL", "sql", "sql"));
  content.appendChild(createMultiSelectItem("Data", "data", "data"));
  content.appendChild(createMultiSelectItem("Link", "link", "link"));
  content.appendChild(createMultiSelectItem("OrderBy", "orderBy", "orderBy"));
  // load the data


  // check if jsonData is not empty
  if (element.getAttribute("dataset") != null) {
    var target = content.querySelector("#Data");
    var jsonData = JSON.parse(element.getAttribute("dataset"));
    jsonData.forEach((fieldJson) => {
      addFieldToPropertiesBar(target, fieldJson);
    });
    var filter = createFilterBox(content);

    content.appendChild(filter);

    // Initialize with the standard view
    //    switchView(event, content, 'standard');
    //   regenerateFilters(content, jsonData.filter);
  }

  if (element.getAttribute("datalink") != null) {
    var target = content.querySelector("#Link");
    var jsonData = JSON.parse(element.getAttribute("datalink"));
    jsonData.forEach((fieldJson) => {
      addSelect(target, fieldJson);
    });
  }


  // orderBy
  if (element.getAttribute("dataorderbygrid") != null) {
    var target = content.querySelector("#OrderBy");
    var jsonData = JSON.parse(element.getAttribute("dataorderbygrid"));
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



} // editDatabaseGrid

async function updateGridData(main, content) {
  console.log("updateGridData");

  var jsonData = [];
  var linkData = [];
  var orderByData = [];
  // set filter empty
  main.setAttribute("filter", "[]");
  //   // get all the span elements from data
  var data = content.querySelector("#Data").querySelectorAll("span[name='dataContainer']");
  var link = content.querySelector("#Link").querySelectorAll("span[name='dataContainer']"); $
  var orderBy = content.querySelector("#OrderBy").querySelectorAll("span[name='dataContainer']");
  // generate the json of all the data

  data.forEach((span) => {
    // get the json data from the span
    var json = JSON.parse(span.getAttribute("data-field"));
    // add the field to the json
    jsonData.push(json);
  });
  main.setAttribute("dataSet", JSON.stringify(jsonData));



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
  // check if DBName is not empty 
  if (sqlJson.DBName != "") {
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


  link.forEach((span) => {
    var json = JSON.parse(span.getAttribute("data-field"));
    linkData.push(json);
  });
  main.setAttribute("datalink", JSON.stringify(linkData));


  orderBy.forEach((span) => {
    var json = JSON.parse(span.getAttribute("data-field"));
    orderByData.push({ fieldName: json.fieldName });
  });
  main.setAttribute("dataOrderByGrid", JSON.stringify(orderByData));

  // get the filter
  var filter = content.querySelector("#filter");
  if (filter != null) {
    var filterData = filter.value;
  }
  // create intermedite div container


  renderGrid(main);
}

function renderGrid(main) {
  main.innerHTML = ""; // clear the main div
  // get the data from the element
  var dataset = JSON.parse(main.getAttribute("dataSet"));


  main.style.padding = "10px";
  main.style.display = "flex";
  main.style.flexDirection = "column";

  var table = document.createElement("div");
  table.className = "table-container";
  table.setAttribute("tagName", "dataTable");
  table.id = "Data-Grid_" + dataset[0].tableName;
  table.setAttribute("DBName", dataset[0].DBName);

  // Apply responsive grid styles
  table.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px, 1fr))";
  table.style.gap = "12px";
  table.style.padding = "16px";
  table.style.border = "2px solid #ccc"; // Light border
  table.style.borderRadius = "10px"; // Rounded corners
  table.style.backgroundColor = "#fafafa"; // Light background

  // generate div for the dataset
  var datasetDiv = document.createElement("div");
  // datasetDiv.className = "dataset-container";
  datasetDiv.id = "DataSet_" + dataset[0].tableName;
  datasetDiv.setAttribute("grid-id", table.id);
  main.appendChild(datasetDiv);
  insertNavBar(
    datasetDiv,
    dataset[0].DBName,
    dataset[0].tableName,

  );

  // create the table
  createGrid(
    table,
    dataset[0].DBName,
    dataset[0].tableName,

    main
  );
  main.appendChild(table);
  searchGrid(dataset[0].DBName, "", "", "", main.id);

}

function insertNavBar(
  gridContainer,
  DBName,
  tableName,

) {
  console.log(gridContainer);

  // check if the class="right-panel" exists in the gridContainer
  // if it exists, remove it
  var rightPanel = gridContainer.querySelector(".right-panel");
  if (rightPanel) {
    return;
  }

  // create search structure
  var html = `<div class="right-panel" tagname="GridPanel">`;
  html += `<div id="current_page">Page: 1</div>`;

  html += `<div style='display: flex; align-items: center; gap: 10px;'>`;

  html += `<button name='revGRIDBtn' title='Previous Page' grid-id='${gridContainer.parentElement.id}' onclick='gridPrev(event,"${DBName}","${tableName}")'>` +
    `<i class='fa fa-chevron-left' grid-id='${gridContainer.parentElement.id}' style='color:#4d61fc;'></i>` +
    `</button>`;

  html += `<button name='NextGRIDBtn' title='Next Page' grid-id='${gridContainer.parentElement.id}' onclick='gridNext(event,"${DBName}","${tableName}")'>` +
    `<i class='fa fa-chevron-right' grid-id='${gridContainer.parentElement.id}' style='color:#4d61fc;'></i>` +
    `</button>`;

  html += `<button name='RefreshGRIDBtn' title='Refresh' grid-id='${gridContainer.parentElement.id}' onclick='searchGrid("${DBName}","","","","${gridContainer.parentElement.id}")'>` +
    `<i class='fa fa-refresh' grid-id='${gridContainer.parentElement.id}' style='color:#4d61fc;'></i>` +
    `</button>`;

  html += `<button name='PostitGRIDBtn' title='Postit' grid-id='${gridContainer.parentElement.id}' onclick='postit(event,"${DBName}","${tableName}")'>` +
    `<i class='bi bi-card-text' grid-id='${gridContainer.parentElement.id}' style='color:#4d61fc;'></i>` +
    `</button>`;

  html += `<button name='ExportGRIDBtn' title='Export Data' grid-id='${gridContainer.parentElement.id}' onclick='export2CSV(event,"${DBName}","${tableName}")'>` +
    `<i class='fa fa-download' grid-id='${gridContainer.parentElement.id}' style='color:#4d61fc;'></i>` +
    `</button>`;

  // adding button for grid or panel 
  html += `<button name='gridView' title='Grid View' grid-id='${gridContainer.parentElement.id}' onclick='switchView(event,"${DBName}","${gridContainer.parentElement.id}","standard")'>` +
    `<i class='fa fa-th' grid-id='${gridContainer.parentElement.id}' style='color:green;'></i>` +
    `</button>`;

  html += `<button name='panelView' title='Panel View' grid-id='${gridContainer.parentElement.id}' onclick='switchView(event,"${DBName}","${gridContainer.parentElement.id}","panel")'>` +
    `<i class='bi bi-card-list' grid-id='${gridContainer.parentElement.id}' style='color:green;'></i>` +
    `</button>`;

  html += `</div>`;

  // 📌 MODIFICATION : Only allow 15, 50, 100 options for page size, default to 15
  html += `<select id="gridPage" class="input-element" onchange='grid_page_size(event,"${gridContainer.parentElement.id}")' style='width:60px;font-size:14px; cursor: pointer;'>`;
  html += `<option value='15' selected>15</option>`;
  html += `<option value='50'>50</option>`;
  html += `<option value='100'>100</option>`;
  html += `</select>`; // record count options


  html += `<img class="miniLoader" style="display: none;" src="/img/loader.gif" alt="Loading...">`;
  html += `</div>`;

  // get tagname="dataTable" from the gridContainer
  gridContainer.innerHTML += html;
}

//Grid code
function createGrid(
  grid,
  DBName,
  tableName,

  main
) {
  //header
  grid.setAttribute("dataset-table-name", tableName);
  grid.setAttribute("current_page", 1);
  grid.setAttribute("page_size", 10);
  grid.setAttribute("Table-Name", tableName);
  grid.setAttribute("DBName", DBName);
  grid.setAttribute("main-id", main.id);

  // search inputs



  const body = document.createElement("div");
  body.className = "grid-body";
  grid.appendChild(body);
  //set search inputs

}

function switchView(e, DBName, gridID, view) {
  e.preventDefault();
  // get the grid
  const grid = document.getElementById(gridID);
  grid.setAttribute("view", view);
  searchGrid(DBName, "", "", "", gridID); // refresh the grid
}

function generateHeaderRow(grid, dataset) {
  // table header
  var header = null;
  // check if grid has class grid-header
  if (grid.querySelector(".grid-header") == null) {
    header = document.createElement("div");
    header.className = "grid-header";
  } else {
    header = grid.querySelector(".grid-header");
    header.innerHTML = ""; // clear the header
  }

  // header
  var row = document.createElement("div");
  row.className = "grid-row";

  dataset.forEach((field) => {
    if (field !== "rowid") {
      const cell = document.createElement("div");
      cell.className = "grid-cell-header";
      const main = grid.closest('[tagname="dataGrid"]');
      // check if field is in the orderbygrid json in grid
      const orderByGrid = JSON.parse(main.getAttribute("dataorderbygrid"));
      const fieldOrderBy = orderByGrid.find((item) => item.fieldName === field.fieldName);
      // check if fieldOrderBy is null
      if (fieldOrderBy == null) {
        cell.setAttribute("descending", "asc");
      } else {
        // set the icon in the cell
        cell.innerHTML = fieldOrderBy.order === "asc" ? '<i class="fa fa-sort-up"></i>' : '<i class="fa fa-sort-down"></i>';
        cell.setAttribute("descending", fieldOrderBy.order);
      }
      cell.innerHTML += field !== "rowid" ? field.fieldLabel.trim() : "";
      cell.setAttribute("field-name", field.fieldName);
      cell.setAttribute("DBName", field.DBName);
      // adding the draggable attribute to the cell
      cell.setAttribute("draggable", "true");
      cell.setAttribute("drag-type", "header");
      cell.setAttribute("drag-field", field.fieldName);
      // adding the evnt drop to the cell
      cell.setAttribute("ondragover", "event.preventDefault()");
      cell.addEventListener("dragstart", function (e) {
        e.dataTransfer.setData("text/plain", e.target.getAttribute("drag-field"));
        e.dataTransfer.effectAllowed = "move";
      }
      );
      cell.addEventListener("drop", function (e) {
        console.log("dragend");
        e.preventDefault();
        // get the field name from the event
        const fieldName = e.dataTransfer.getData("text/plain");
        // get the grid id
        const main = e.currentTarget.closest('[tagname="dataGrid"]');
        // get the dataset from the main in json format
        const dataset = JSON.parse(main.getAttribute("dataset"));
        // the current field name in target
        const targetFieldName = e.target.getAttribute("drag-field");
        // invert the field name in the dataset json with the target field name
        console.log("fieldName", fieldName);
        console.log("targetFieldName", targetFieldName);

        // get the json field of fieldName
        const field = dataset.find((item) => item.fieldName === fieldName);
        const DBName = field.DBName;
        // get the json field of targetFieldName
        const targetField = dataset.find((item) => item.fieldName === targetFieldName);
        // invert the field name in the dataset json with the target field name
        // new dataset
        const newDataset = dataset.map((item) => {
          if (item.fieldName === fieldName) {
            return targetField
          } else if (item.fieldName === targetFieldName) {
            return field;
          } else {
            return item;
          }
        });
        console.log("newDataset", newDataset);
        // set the dataset to the main
        main.setAttribute("dataset", JSON.stringify(newDataset));
        // refresh the grid
        searchGrid(DBName, "", "", "", main.id);

      });
      row.appendChild(cell);
      // adding click action in order to sort the data
      cell.addEventListener("click", function (e) {
        console.log("click on cell");
        e.preventDefault();
        // get the cell from the event
        // get the grid id
        const main = e.currentTarget.closest('[tagname="dataGrid"]');
        // get the dataset from the main in json format
        const dataset = JSON.parse(main.getAttribute("dataset"));

        const DBName = e.currentTarget.getAttribute("DBName");
        // get the field name from the cell
        const fieldName = cell.getAttribute("field-name");
        // get the order direction from the cell by checking if the attribute descending is set
        var descending = cell.getAttribute("descending");
        // check if the descending is set to true or false
        if (descending == null) {
          descending = "desc";
        }
        // check if the field type is in the dataorderbygrid json in grid
        let dataOrderByGrid = JSON.parse(main.getAttribute("dataorderbygrid"));
        // empty the dataorderbygrid json
        dataOrderByGrid = [];
        // if fieldOrderBy is null, add it to the dataorderbygrid json
        if (descending == "asc") {

          // add the field to the dataorderbygrid json
          dataOrderByGrid.push({ fieldName: fieldName, order: "desc" });
          // adding the ascending icon to the cell
          // create i element for the ascending icon

        } else {
          // add the field to the dataorderbygrid json
          dataOrderByGrid.push({ fieldName: fieldName, order: "asc" });

        }

        // set the dataorderbygrid json to the grid
        main.setAttribute("dataorderbygrid", JSON.stringify(dataOrderByGrid));
        // refresh the grid
        searchGrid(DBName, "", "", "", main.id);
      });

    } else {
      const cell = document.createElement("div");
      cell.style.display = "none";
      cell.className = "";
      cell.textContent = "";
      row.appendChild(cell);
    }
  });
  header.appendChild(row);
  const body = document.createElement("div");
  body.className = "grid-body";

  grid.appendChild(header);
  grid.appendChild(body);
}

function grid_page_size(e, dataGridId) {
  e.preventDefault();
  // get selected page size
  const dataGrid = document.getElementById(dataGridId);
  const dataTable = dataGrid.querySelector('[tagName="dataTable"]');
  const DBName = dataTable.getAttribute("DBName");
  var pageSize = e.target[e.target.selectedIndex].value;
  dataTable.setAttribute("page_size", pageSize);
  dataTable.setAttribute("current_page", 1);
  searchGrid(DBName, "", "", "", dataGridId);
}

function gridPrev(e, DBName, tableName) {
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
    grid.parentElement.querySelector("#current_page").textContent = "Page: " + currentPage;
    searchGrid(DBName, "", "", "", mainID);
  }
}

function gridNext(e, DBName, tableName) {
  e.preventDefault();
  // get parent grid n
  // get grid from closest e.target class table-container
  const mainID = e.target.getAttribute("grid-id");
  const main = document.getElementById(mainID);

  const grid = main.querySelector('[dataset-table-name="' + tableName + '"]');

  // get the page size


  if (grid) {
    //  console.log(grid);
    var currentPage = parseInt(grid.getAttribute("current_page"));
    currentPage++;
    grid.setAttribute("current_page", currentPage);
    grid.parentElement.querySelector("#current_page").textContent = "Page: " + currentPage;
    searchGrid(DBName, "", "", "", mainID);

  }
}

function searchGrid(DBName, filterName, FilterOp, filterValue, gridID) {
  const grid = document.getElementById(gridID);
  // get the dataset from the main in json format
  const dataset = JSON.parse(grid.getAttribute("dataset"));

  const tableGrid = grid.querySelector('[tagname="dataTable"]');
  // get the dataset labels

  if (tableGrid.getAttribute("current_page") == null) {
    tableGrid.setAttribute("current_page", 1);
  }
  var tableName = tableGrid.getAttribute("Table-Name");



  var page = parseInt(tableGrid.getAttribute("current_page")) || 1;
  var pageSize = parseInt(tableGrid.getAttribute("page_size"));
  // 
  // check if filter is empty
  var filter = filterName + "|" + FilterOp + "|" + filterValue;

  // get the view type
  var view = grid.getAttribute("view");
  switch (view) {
    case "standard":

      generateHeaderRow(tableGrid, dataset);
      gridGetData(tableGrid, DBName, tableName, page, pageSize, filter, 0);
      break;
    case "panel":
      // get the header
      main = document.getElementById(gridID);
      const header = main.querySelector(".grid-header");
      if (header) {
        header.remove();
      }
      gridGetData(tableGrid, DBName, tableName, page, pageSize, filter, 1);
      break;
    default:

      generateHeaderRow(tableGrid, dataset);
      gridGetData(tableGrid, DBName, tableName, page, pageSize, filter, 0);
      break;
  }
}

// export grid to csv
function export2CSV(e, DBName, tabelName) {
  e.preventDefault();
  const grid = document.getElementById("Data-Grid_" + tabelName);
  var main = e.currentTarget.closest('[tagname="dataGrid"]');
  // get the dataset from the main in json format
  const dataset = JSON.parse(main.getAttribute("dataset"));
  // get the dataset fields names
  const datasetFields = dataset.map((field) => {
    return field.fieldName;
  });

  // call the export service
  const url = `/export-table/${DBName}/${tableName}?fields=${datasetFields}`;
  window.open(url, "_blank");
}



function gridFetchData(grid, body) {
  var DBName = grid.getAttribute("DBName");
  var tableName = grid.getAttribute("Table-Name");
  var currentPage = parseInt(grid.getAttribute("current_page"));
  var pageSize = parseInt(grid.getAttribute("page_size"));

  var currentPage = parseInt(currentPage);
  fetchTableData(grid, DBName, tableName, currentPage, pageSize);
}

function fetchTableData(
  grid,
  DBName,
  tableName,
  page,
  pageSize
) {
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

  gridGetData(grid, DBName, tableName, page, pageSize, filter);


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
  filter,
  gridType
) {
  // activate the loaders
  activateLoaders();
  // console.log(grid);
  // get the filter from the dataset json
  var mainID = grid.getAttribute("main-id");
  var main = document.getElementById(mainID);
  var filterJSON = JSON.parse(main.getAttribute("filter"));
  var dataset = JSON.parse(main.getAttribute("dataset"));
  var datalink = JSON.parse(main.getAttribute("datalink"));
  var orderBy = JSON.parse(main.getAttribute("dataorderbygrid"));

  // datasetfields
  var datasetFields = dataset.map((field) => {
    return field.fieldName;
  });
  // inset rowid to the dataset fields names
  datasetFields.unshift("rowid");

  // check if filter is empty
  if (filterJSON == undefined || filterJSON == null || filterJSON == "") {
    filterJSON = {};
  }
  // if filter is not empty, add the filter to the filterJSON
  if (filter != "") {
    var filterArray = filter.split("|");
    var filterName = filterArray[0];
    var filterOp = filterArray[1];
    var filterValue = filterArray[2];

    // Determine the type of the filterValue
    var filterType = typeof filterValue === 'string' ? 'character' : 'number';
    if (filterJSON.filters == undefined) {
      filterJSON.filters = [];
    }

    // check if the filter is already in the filterJSON
    var found = false;
    for (var i = 0; i < filterJSON.filters.length; i++) {
      if (filterJSON.filters[i].field == filterName
        && filterJSON.filters[i].tableName == tableName
        && filterJSON.filters[i].DBName == DBName) {
        found = true;
        // if filter vaue is empty, remove the filter from the filterJSON
        if (filterValue == "") {
          filterJSON.filters.splice(i, 1);
        } else {

          filterJSON.filters[i].value = filterValue;
          filterJSON.filters[i].operator = filterOp;
          filterJSON.filters[i].type = filterType;
        }
      }
    }
    // if filter is not found, add it to the filterJSON
    if (!found && filterValue != "") {
      filterJSON.filters.push({
        DBName: DBName,
        tableName: tableName,
        field: filterName,
        operator: filterOp,
        value: filterValue,
        type: filterType,
      });
    }
    // set the filterJSON to the main
    main.setAttribute("filter", JSON.stringify(filterJSON));
  }


  // console.log(filterJSON);
  //get body form the table
  const body = grid.querySelector(".grid-body");
  const header = grid.querySelector(".grid-header");
  // if gridType is 1, clear the header, body

  body.innerHTML = "";
  // Prepare the URL
  var url = `/table-data/${DBName}/${tableName}/${page}/${pageSize}?fields=${datasetFields}&filter=${encodeURIComponent(JSON.stringify(filterJSON))}&orderBy=${JSON.stringify(orderBy)}`;
  // get the sqljson from the main
  var sqlJson = JSON.parse(main.getAttribute("sql"));
  if (sqlJson.DBName != "") {
    // get the db name
    url = `/table-data-sql/${sqlJson.DBName}/${page}/${pageSize}?sqlQuery=${sqlJson.select}`;
  }
  // Fetch the data from the web service

  const request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.setRequestHeader("Content-Type", "application/json");
  request.setRequestHeader("Accept", "application/json");
  request.setRequestHeader("Access-Control-Allow-Origin", "*");
  request.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  request.send();
  request.onload = function () {
    // Check if the request was successful (status code 200)
    if (request.status >= 200 && request.status < 300) {
      // Parse the response as JSON

      const data = JSON.parse(request.responseText);
      // The data is now available
      for (var j = 0; j < data.length; j++) {
        switch (gridType) {
          default:
          case 0:
            drawGridRow(
              mainID,
              DBName,
              tableName,
              data,
              datasetFields,
              dataset,
              datalink,
              j,
              body,
              page,
              pageSize
            );
            break;
          case 1:
            drawPanelRow(
              mainID,
              DBName,
              tableName,
              data,
              datasetFields,
              dataset,
              datalink,
              j,
              body,
              page,
              pageSize
            );
            break;
        }  // end switch (gridType)
      } // end for (j = 0; j < data.length; j++)
      let row = document.createElement("div");
      row.style.height = "100%";
      body.appendChild(row);
      let newbutton = document.createElement("button");
      newbutton.title = "Add New Record";
      newbutton.innerHTML = '<i class="fa fa-plus" style="color:green;margin-left:-6px">';
      newbutton.style.width = "40px";
      newbutton.style.height = "40px";
      newbutton.addEventListener("click", function (event) {
        event.preventDefault();
        // get the tab
        const tab = document.querySelector('[tagname="Tab"]');
        console.log(tab);
        // the header by class ctab_tabs-header
        const header = tab.querySelector(".ctab_tabs-header");
        if (header.childNodes.length > 0) {
          // second tab
          activateTab(event, header.childNodes[1], document.getElementById(header.childNodes[1].getAttribute("data-tab")));
          navbar_InsertRecord();
        } // end if
      });
      body.appendChild(newbutton);
    } else {
      // Handle error response
      console.error("Error fetching data:", request.statusText);
      showToast("Error fetching data", 5000);
    }
  };
  request.onerror = function () {
    // Handle network error
    console.error("Network error:", request.statusText);
    showToast("Network error", 5000);
  };
  request.onabort = function () {
    // Handle request abort
    console.error("Request aborted:", request.statusText);
    showToast("Request aborted", 5000);
  };
  request.ontimeout = function () {
    // Handle request timeout
    console.error("Request timed out:", request.statusText);
    showToast("Request timed out", 5000);
  };
  // end fetch

}

function drawGridRow(
  mainID,
  DBName,
  tableName,
  data,
  datasetFields,
  dataset,
  datalink,
  j,
  body,
  page,
  pageSize
) {

  let record = j;
  const rowid = Object.values(data[j])[0];
  const rowData = data[j];

  // Create the main div for the row
  var rowDiv = document.createElement("div");

  // Alternate row background colors (zebra effect)
  if (j % 2 == 0) {
    rowDiv.style.backgroundColor = "#f2f2f2"; // Light grey for even rows
  } else {
    rowDiv.style.backgroundColor = "#ffffff"; // White for odd rows
  }

  rowDiv.className = "grid-row"; // Set the class for styling
  rowDiv.setAttribute("rowid", rowid); // Store the unique row ID
  rowDiv.setAttribute("main-id", mainID); // Store the grid main ID

  // console.log("rowData display:",rowData);

  // Auto-link the first row when loading
  if (j == 0) {
    linkRecordToGrid(
      DBName,
      tableName,
      rowid,
      record + (page - 1) * pageSize,
      dataset,
      datalink,
      rowData
    );
  }

  // Add click event listener to select the row
  rowDiv.addEventListener("click", function (event) {
    console.log("Click on table element")
    event.preventDefault();

    // Find the closest parent with class 'grid-row'
    const closestRow = event.target.closest(".grid-row");
    if (!closestRow) return; // If no 'grid-row' found, safely exit

    console.log("closestRow : " + closestRow)

    // Retrieve the main ID of the grid
    var mainID = closestRow.getAttribute("main-id");
    var main = document.getElementById(mainID);
    var dataset = JSON.parse(main.getAttribute("dataset"));
    var datalink = JSON.parse(main.getAttribute("datalink"));

    // Remove the 'grid-row-selected' class from all rows
    var gridRows = document.querySelectorAll('.grid-row');
    gridRows.forEach(row => {
      //row.classList.remove("grid-row-selected");
      row.classList.remove("selected-panel");

    });

    // Add the 'grid-row-selected' class to the clicked row
    //closestRow.classList.add("grid-row-selected");
    closestRow.classList.add("selected-panel");

    let selectedPanel = document.querySelector(".selected-panel");
    if (selectedPanel) {
      console.log("Selected panel : " + selectedPanel);
      let allPanels = document.querySelectorAll("[tagname='dataTable'] div.grid-row");
      let panels = Array.from(allPanels);
      let currentIndex = panels.indexOf(selectedPanel);
    }

    // Deactivate loading indicators
    deactivateLoaders();

    // Link the clicked record to the grid

    linkRecordToGrid(
      DBName,
      tableName,
      rowid,
      record + (page - 1) * pageSize,
      dataset,
      datalink,
      rowData
    );


    // Try switching to the second tab if it exists
    const tab = document.querySelector('[tagname="Tab"]');
    if (tab) {
      console.log("tab : " + tab);
      const header = tab.querySelector(".ctab_tabs-header");
      if (header.childNodes.length > 0) {
        activateTab(event, header.childNodes[1], document.getElementById(header.childNodes[1].getAttribute("data-tab")));
      }
    }
  });

  // Now create cells inside the row
  var i = 0;
  Object.values(data[j]).forEach((field, index) => {
    const cell = document.createElement("div");
    cell.className = "grid-cell";

    rowDiv.appendChild(cell);

    // Hide the cell if it's the rowid field (first field)
    if (i == 0) {
      cell.style.display = "none";
      cell.textContent = field;
    } else {
      // If field contains multiple values separated by ';', handle it
      let subField = field?.toString().trim().split(";");

      if (!subField || subField.length === 0) {
        subField = [field];
      }

      if (subField.length > 1) {
        // Create a nice vertical layout for multi-values
        cell.innerHTML = "";

        const contentDiv = document.createElement("div");
        contentDiv.style.maxHeight = "200px";
        contentDiv.style.overflowY = "auto";
        contentDiv.style.whiteSpace = "pre-wrap"; // Keep line breaks

        subField.forEach((item, subIndex) => {
          const line = document.createElement("div");
          line.textContent = `${item}`;
          contentDiv.appendChild(line);
        });

        cell.appendChild(contentDiv);
      } else {
        // Standard single value
        cell.textContent = field;
      }
    }
    i++;
  });

  // Finally, add the row to the grid body
  body.appendChild(rowDiv);
}


function drawPanelRow(
  mainID,
  DBName,
  tableName,
  data,
  datasetFields,
  dataset,
  datalink,
  j,
  body,
  page,
  pageSize
) {
  console.log("drawPanelRow");
  let record = j;
  const rowid = Object.values(data[j])[0];
  const rowData = data[j];
  var rowDiv = document.createElement("div");
  rowDiv.style.backgroundColor = "#ffffff";
  rowDiv.className = "panel";
  rowDiv.setAttribute("rowid", rowid);
  // add click event to row to call linkRecordToGrid(tableName, rowId)

  if (j == 0) {
    // call linkRecordToGrid(tableName, rowId)
    linkRecordToGrid(
      DBName,
      tableName,
      rowid,
      record + (page - 1) * pageSize,
      dataset,
      datalink,
      rowData
    );
  } // end if (j == 0)

  rowDiv.setAttribute("main-id", mainID);
  rowDiv.addEventListener("click", function (event) {
    event.preventDefault();
    // get main id
    var mainID = event.target.closest(".grid-row").getAttribute("main-id");
    var main = document.getElementById(mainID);
    var dataset = JSON.parse(main.getAttribute("dataset"));
    var datalink = JSON.parse(main.getAttribute("datalink"));
    // remove .grid-row-selected from all rows
    var gridRows = document.querySelectorAll('.grid-row');
    gridRows.forEach(row => {
      row.classList.remove("grid-row-selected");
    });
    if (event.target.parentElement.classList.contains("grid-row")) {
      event.target.parentElement.classList.add("grid-row-selected");
    }
    if (event.target.classList.contains("grid-row")) {
      event.target.classList.add("grid-row-selected");
    }

    // desactivate the loaders
    deactivateLoaders();
    linkRecordToGrid(
      DBName,
      tableName,
      rowid,
      record + (page - 1) * pageSize,
      dataset,
      datalink,
      rowData
    );

    // get the tab
    const tab = document.querySelector('[tagname="Tab"]');
    if (tab) {

      // the header by class ctab_tabs-header
      const header = tab.querySelector(".ctab_tabs-header");

      if (header.childNodes.length > 0) {
        // second tab
        activateTab(event, header.childNodes[1], document.getElementById(header.childNodes[1].getAttribute("data-tab")));
      } // end if
    } // end if (tab)
  } // end addEventListener
  );
  var i = 0;

  Object.values(data[j]).forEach((field, index) => {
    const cell = document.createElement("p");


    rowDiv.appendChild(cell);
    // skip rowid field
    if (i == 0) {
      cell.style.display = "none";
      cell.textContent = field;
    } else {
      let subField = field?.toString().trim().split(";");
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
          line.textContent = `${keys[index] == "gama"}: ${item}`;
          contentDiv.appendChild(line);
        });

        cell.appendChild(contentDiv);
      } else {

        cell.textContent = dataset[index - 1].fieldLabel + " : " + field;
      } // end if (subField.length > 1)
    } // end if (i == 0)
    i++;
  }// end forEach
  );
  body.appendChild(rowDiv);


}
