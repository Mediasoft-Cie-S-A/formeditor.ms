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
  if (element.getAttribute("dataorderby") != null) {
    var target = content.querySelector("#OrderBy");
    var jsonData = JSON.parse(element.getAttribute("dataorderby"));
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
  // get all the span elements from data
  var data = content.querySelector("#Data").querySelectorAll("span[name='dataContainer']");
  var link = content.querySelector("#Link").querySelectorAll("span[name='dataContainer']");$
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
  sqlJson["DBName"]=DBName.value;
}
// get the textarea with the tagname="select"
var sqlData = sql.querySelector("[tagname='select']");
console.log(sqlData);
if (sqlData != null) {
  sqlJson["select"]= sqlData.value;
}
var sqlData = sql.querySelector("[tagname='update']");
if (sqlData != null) {
  sqlJson["update"]= sqlData.value;
}
var sqlData = sql.querySelector("[tagname='insert']");
if (sqlData != null) {
  sqlJson["insert"]=sqlData.value;
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
          jsonData.push({ DBName:sqlJson.DBName, fieldName: field, tabelName: "",  fieldType: "string" });
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
  var data = main.getAttribute("dataSet");
  // parse the json
  var jsonData = JSON.parse(data);
  // get the main div
  var datasetFields = ["rowid"];
  var datasetLabels = ["rowid"];

  var datasetFieldsTypes = ["rowid"];
  jsonData.forEach((field) => {
    datasetFields.push(field.fieldName);
    // replace in lable the ","
    var label = field.fieldLabel.replace(/,/g, " ");
    datasetLabels.push(label);
    datasetFieldsTypes.push(field.fieldType);
  });

  main.style.padding = "10px";
  main.style.display = "flex";
  main.style.flexDirection = "column";

  var table = document.createElement("div");
  table.className = "table-container";
  table.setAttribute("tagName", "dataTable");
  table.id = "Data-Grid_" + jsonData[0].tableName;
  table.setAttribute("DBName", jsonData[0].DBName);

  // generate div for the dataset
  var datasetDiv = document.createElement("div");
  // datasetDiv.className = "dataset-container";
  datasetDiv.id = "DataSet_" + jsonData[0].tableName;
  datasetDiv.setAttribute("grid-id", table.id);
  main.appendChild(datasetDiv);
  insertNavBar(
    datasetDiv,
    jsonData[0].DBName,
    jsonData[0].tableName,
    datasetFields,
    datasetLabels,
    datasetFieldsTypes
  );

  createGrid(
    table,
    jsonData[0].DBName,
    jsonData[0].tableName,
    datasetFields,
    datasetLabels,
    datasetFieldsTypes,
    main
  );
  main.appendChild(table);
}

function insertNavBar(
  gridContainer,
  DBName,
  tableName,
  datasetFields,
  datasetLabels,
  datasetFieldsTypes
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
  // html += `<div class="navigation-bar-title">Record: </div>`;
  // adding page number
  html += `<div id="current_page" >Page: 1 </div>`;


  html += `<div style='display: flex; align-items: center; gap: 10px;'>`;
  html +=
    `<button name='revGRIDBtn' title='Previous Page' grid-id='${gridContainer.parentElement.id}' onclick='gridPrev(event,"${DBName}","${tableName}")'>` +
    `<i class='fa fa-chevron-left' grid-id='${gridContainer.parentElement.id}' style='color:#4d61fc;'></i>` +
    `</button>`;
  html +=
    `<button name='NextGRIDBtn' title='Next Page' grid-id='${gridContainer.parentElement.id}' onclick='gridNext(event,"${DBName}","${tableName}")'>` +
    `<i class='fa fa-chevron-right' grid-id='${gridContainer.parentElement.id}' style='color:#4d61fc;'></i>` +
    `</button>`;

  html +=
    `<button name='RefreshGRIDBtn' title='Refresh' grid-id='${gridContainer.parentElement.id}' onclick='searchGrid("${DBName}","","","","${gridContainer.parentElement.id}")'>` +
    `<i class='fa fa-refresh' grid-id='${gridContainer.parentElement.id}' style='color:#4d61fc;'></i>` +
    `</button>`;
  html +=
    `<button name='PostitGRIDBtn' title='Postit' grid-id='${gridContainer.parentElement.id}' onclick='postit(event,"${DBName}","${tableName}")'>` +
    `<i class='bi bi-card-text' grid-id='${gridContainer.parentElement.id}' style='color:#4d61fc;'></i>` +
    `</button>`;
  html +=
    `<button name='ExportGRIDBtn' title='Export Data' grid-id='${gridContainer.parentElement.id}' onclick='export2CSV(event,"${DBName}","${tableName}")'>` +
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
  html += `<select id="gridPage" class="input-element" onchange='grid_page_size(event,"${gridContainer.parentElement.id}")' style='width:60px;font-size:14px'>`;
  html += `<option value='5'>5</option>`;
  html += `<option value='10'>10</option>`;
  html += `<option value='20'>20</option>`;
  html += `<option value='50'>50</option>`;
  html += `<option value='100'>100</option>`;
  html += `</select>`; // record count
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
  datasetFields,
  datasetLabels,
  datasetFieldsTypes,
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

  grid.setAttribute("Dataset-Fields-Names", datasetFields);
  grid.setAttribute("Dataset-Fields-Labels", datasetLabels);
  grid.setAttribute("Dataset-Fields-Types", datasetFieldsTypes);

  const body = document.createElement("div");
  body.className = "grid-body";
  grid.appendChild(body);
  //set search inputs
  // check if in the page exists tagname="cookieStorage"
  var cookieStorage = document.querySelector('[tagname="cookieStorage"]');
  console.log(cookieStorage);
  if (!cookieStorage) {

    console.log("cookieStorage not found");
    gridFetchData(grid);
  }
}

function switchView(e, DBName, gridID, view) {
  e.preventDefault();
  // get the grid
  const grid = document.getElementById(gridID);
  grid.setAttribute("view", view);
  searchGrid(DBName, "", "", "", gridID); // refresh the grid
}

function generateHeaderRow(grid, datasetLabels) {
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

  datasetLabels.forEach((field) => {
    if (field !== "rowid") {
      const cell = document.createElement("div");
      cell.className = "grid-cell-header";
      cell.textContent = field !== "rowid" ? field.trim() : "";
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
  var datasetFields = tableGrid.getAttribute("Dataset-Fields-Names"); 
  const datasetLabels=dataset.map((field) => field.fieldLabel);
  var page = parseInt(tableGrid.getAttribute("current_page")) || 1;
  var pageSize = parseInt(tableGrid.getAttribute("page_size"));
  // 
  // check if filter is empty
  var filter = filterName + "|" + FilterOp + "|" + filterValue;
 
  // get the view type
  var view = grid.getAttribute("view");
  switch (view) {
    case "standard":
     
      generateHeaderRow(tableGrid, datasetLabels);
      gridGetData(tableGrid, DBName, tableName, page, pageSize, datasetFields, filter,0);
      break;
    case "panel":
     
      gridGetData(tableGrid, DBName, tableName, page, pageSize, datasetFields, filter,1);
      break;
    default:
     
      generateHeaderRow(tableGrid, datasetLabels);
      gridGetData(tableGrid, DBName, tableName, page, pageSize, datasetFields, filter,0);
      break;
  }
}

// export grid to csv
function export2CSV(e, DBName, tabelName) {
  e.preventDefault();
  const grid = document.getElementById("Data-Grid_" + tabelName);
  var tableName = grid.getAttribute("Table-Name");
  var datasetFields = grid.getAttribute("Dataset-Fields-Names");
  // call the export service
  const url = `/export-table/${DBName}/${tableName}?fields=${datasetFields}`;
  window.open(url, "_blank");
}



function gridFetchData(grid, body) {
  var DBName = grid.getAttribute("DBName");
  var tableName = grid.getAttribute("Table-Name");
  var currentPage = parseInt(grid.getAttribute("current_page"));
  var pageSize = parseInt(grid.getAttribute("page_size"));
  var datasetFields = grid.getAttribute("dataset-fields-names");
  var currentPage = parseInt(currentPage);
  fetchTableData(grid, DBName, tableName, currentPage, pageSize, datasetFields);
}

function fetchTableData(
  grid,
  DBName,
  tableName,
  page,
  pageSize,
  datasetFields
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

  gridGetData(grid, DBName, tableName, page, pageSize, datasetFields, filter);


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
                  filter,
                  gridType
                ) 
{
  console.log("I am gridGetDatat");
  // activate the loaders
  activateLoaders();
  // console.log(grid);
  // get the filter from the dataset json
  var mainID = grid.getAttribute("main-id");
  var main = document.getElementById(mainID);
  var filterJSON = JSON.parse(main.getAttribute("filter"));
  var dataset = JSON.parse(main.getAttribute("dataset"));
  var datalink = JSON.parse(main.getAttribute("datalink"));
  var orderBy =JSON.parse(main.getAttribute("dataorderbygrid"));
  console.log("ORDERBY",orderBy);
  // check if filter is empty
  if (filterJSON == undefined || filterJSON == null || filterJSON == "") {
    filterJSON = {};
  }
  console.log("hellloooooo:",filter);
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
  if (gridType == 1) {
    header.innerHTML = "";
   
  }
  body.innerHTML = "";
  // Prepare the URL
  var url = `/table-data/${DBName}/${tableName}/${page}/${pageSize}?fields=${datasetFields}&filter=${encodeURIComponent(JSON.stringify(filterJSON))}&orderBy=${JSON.stringify(orderBy)}`;
  console.log("urillllll:",url);
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
    newbutton.innerHTML ='<i class="fa fa-plus" style="color:green;margin-left:-6px">';
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
        activateTab(event,header.childNodes[1],document.getElementById(header.childNodes[1].getAttribute("data-tab")));
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
)

{
   console.log("drawGridRow");
        let record = j;
        const rowid = Object.values(data[j])[0];
        const rowData = data[j];
        var rowDiv = document.createElement("div");
        if (j % 2 == 0) rowDiv.style.backgroundColor = "#f2f2f2";
        else rowDiv.style.backgroundColor = "#ffffff";
        rowDiv.className = "grid-row";
        rowDiv.setAttribute("rowid",  rowid);
        // add click event to row to call linkRecordToGrid(tableName, rowId)
         console.log(rowData);
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
                                activateTab(event,header.childNodes[1],document.getElementById(header.childNodes[1].getAttribute("data-tab")));
                              } // end if
                            } // end if (tab)
                      } // end addEventListener
                      );
        var i = 0;
        Object.values(data[j]).forEach((field, index) => {
          const cell = document.createElement("div");
          cell.className = "grid-cell";

          rowDiv.appendChild(cell);
          // skip rowid field
          if (i == 0) {
            cell.style.display = "none";
            cell.textContent = field;
              } else {
                let subField = field?.toString().trim().split(";");
                // check if the subField is not null or undefined
                if (subField == null || subField == undefined) {
                  subField = [field];
                }
                else if (subField.length > 1) {
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
                  cell.textContent = field;
                } // end if (subField.length > 1)
                } // end if (i == 0)
                i++;
              }// end forEach
            );
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
)

{
  console.log("drawPanelRow");  
        let record = j;
        const rowid = Object.values(data[j])[0];
        const rowData = data[j];
        var rowDiv = document.createElement("div");       
        rowDiv.style.backgroundColor = "#ffffff";
        rowDiv.className = "panel";
        rowDiv.setAttribute("rowid",  rowid);
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
                                activateTab(event,header.childNodes[1],document.getElementById(header.childNodes[1].getAttribute("data-tab")));
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
            cell.textContent =  field;
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
                     
                      cell.textContent =dataset[index-1].fieldLabel + " : " + field;
                    } // end if (subField.length > 1)
                } // end if (i == 0)
                i++;
              }// end forEach
            );
        body.appendChild(rowDiv);
      
     
}
