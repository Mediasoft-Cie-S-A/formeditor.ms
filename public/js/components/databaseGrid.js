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

/**
 * Data storage
 * - filter: JSON array string storing active filters.
 * - dataSet: JSON array of field descriptors bound to the grid.
 * - sql: JSON array describing SQL sources used to populate the grid.
 * - datalink: JSON array for linked datasets/relations.
 * - dataOrderByGrid: JSON array describing sort order configuration.
 * - datasetFields: serialized field list cached on the grid element.
 * - apiName / page / pageSize: plain strings tracking API source and pagination.
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
  createShowDatabaseStructureButton(content, type);


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
    const response = await apiFetch(`/table-data-sql/${sqlJson.DBName}/1/1?sqlQuery=${sqlJson.select}`).then((response) => {
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
        jsonData.push({ DBName: sqlJson.DBName, fieldName: field, tableName: "query", fieldType: "string" });
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
  var dataset = JSON.parse(main.getAttribute("dataset"));


  main.style.padding = "10px";
  main.style.display = "flex";
  main.style.flexDirection = "column";

  var table = document.createElement("div");
  table.className = "table-container";
  table.setAttribute("tagName", "dataTable");
  // check dataset is not empty
  if (!dataset || dataset.length === 0) return;
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

  html += `<button name='ImportGRIDBtn' title='Import Data' grid-id='${gridContainer.parentElement.id}' onclick='openImportModal(event,"${DBName}","${tableName}")'>` +
    `<i class='fa fa-upload' grid-id='${gridContainer.parentElement.id}' style='color:#4d61fc;'></i>` +
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

function switchView(e, DBName, mainID, view) {
  e.preventDefault();
  // get the grid
  const grid = document.getElementById(mainID);
  grid.setAttribute("view", view);
  searchGrid(DBName, "", "", "", mainID); // refresh the grid
}

function generateHeaderRow(grid, dataset) {
  // header container
  var header = grid.querySelector(".grid-header");
  if (!header) {
    header = document.createElement("div");
    header.className = "grid-header";
  } else {
    header.innerHTML = "";
  }

  var row = document.createElement("div");
  row.className = "grid-row";

  dataset.forEach((field) => {
    if (field === "rowid") return;

    const cell = document.createElement("div");
    cell.className = "grid-cell-header";

    // Récupérer le main (porte les attributs dataset/dataorderbygrid)
    const main = grid.closest('[tagname="dataGrid"]') || grid.parentElement;

    // État de tri courant
    const orderByGrid = safeJSON(main.getAttribute("dataorderbygrid"), []);
    const current = orderByGrid.find((o) => o.fieldName === field.fieldName);
    const currentOrder = current ? current.order : null;

    // Label
    const label = (field.fieldLabel ? field.fieldLabel.trim() : field.fieldName.trim());

    // Contenu: label + boutons
    const group = document.createElement("div");
    group.style.display = "flex";
    group.style.alignItems = "center";
    group.style.gap = "6px";

    const spanLabel = document.createElement("span");
    spanLabel.textContent = label;

    const btnAsc = document.createElement("button");
    btnAsc.type = "button";
    btnAsc.title = "Trier ascendant";
    btnAsc.innerHTML = '<i class="fa fa-sort-up"></i>';
    btnAsc.className = "grid-th-btn";
    btnAsc.style.marginTop = "-5px";
    if (currentOrder === "asc") btnAsc.classList.add("active");
    btnAsc.addEventListener("click", (ev) => {
      ev.stopPropagation(); // ne pas déclencher le tri toggle du clic cellule
      const DBName = field.DBName || grid.getAttribute("DBName");
      setOrderBy(main, DBName, field.fieldName, "asc");
    });

    const btnDesc = document.createElement("button");
    btnDesc.type = "button";
    btnDesc.title = "Trier descendant";
    btnDesc.innerHTML = '<i class="fa fa-sort-down"></i>';
    btnDesc.className = "grid-th-btn";
    // btnDesc.style.marginLeft = "-11px";
    //btnDesc.style.marginTop = "-5px";

    if (currentOrder === "desc") btnDesc.classList.add("active");
    btnDesc.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const DBName = field.DBName || grid.getAttribute("DBName");
      setOrderBy(main, DBName, field.fieldName, "desc");
    });

    group.appendChild(spanLabel);
    group.appendChild(btnAsc);
    group.appendChild(btnDesc);

    // Attributs utiles pour DnD + clic toggle
    cell.setAttribute("field-name", field.fieldName);
    cell.setAttribute("DBName", field.DBName);
    cell.setAttribute("descending", currentOrder || "asc");

    // Drag & drop (réordonner les colonnes)
    cell.setAttribute("draggable", "true");
    cell.setAttribute("drag-type", "header");
    cell.setAttribute("drag-field", field.fieldName);
    cell.setAttribute("ondragover", "event.preventDefault()");
    cell.addEventListener("dragstart", function (e) {
      e.dataTransfer.setData("text/plain", e.currentTarget.getAttribute("drag-field"));
      e.dataTransfer.effectAllowed = "move";
    });
    cell.addEventListener("drop", function (e) {
      e.preventDefault();
      const fieldName = e.dataTransfer.getData("text/plain");
      const main = e.currentTarget.closest('[tagname="dataGrid"]') || grid.parentElement;
      const ds = safeJSON(main.getAttribute("dataset"), []);
      const targetFieldName = e.currentTarget.getAttribute("drag-field");

      const A = ds.find((it) => it.fieldName === fieldName);
      const B = ds.find((it) => it.fieldName === targetFieldName);
      if (!A || !B) return;

      const newDs = ds.map((it) => {
        if (it.fieldName === fieldName) return B;
        if (it.fieldName === targetFieldName) return A;
        return it;
      });
      main.setAttribute("dataset", JSON.stringify(newDs));
      const DBName = (A.DBName || B.DBName || grid.getAttribute("DBName"));
      searchGrid(DBName, "", "", "", main.id);
    });

    // Clic cellule = toggle asc/desc (comportement existant conservé)
    cell.addEventListener("click", function (e) {
      e.preventDefault();
      const main = e.currentTarget.closest('[tagname="dataGrid"]') || grid.parentElement;
      const DBName = e.currentTarget.getAttribute("DBName") || grid.getAttribute("DBName");
      const fieldName = e.currentTarget.getAttribute("field-name");
      const curr = (e.currentTarget.getAttribute("descending") || "asc");
      const next = (curr === "asc") ? "desc" : "asc";
      setOrderBy(main, DBName, fieldName, next);
    });

    cell.appendChild(group);
    row.appendChild(cell);
  });

  header.appendChild(row);

  // Assurer la présence du body
  let body = grid.querySelector(".grid-body");
  if (!body) {
    body = document.createElement("div");
    body.className = "grid-body";
    grid.appendChild(body);
  }

  grid.appendChild(header);
}
function grid_page_size(e, mainID) {
  e.preventDefault();
  // get selected page size
  const dataGrid = document.getElementById(mainID);
  const dataTable = dataGrid.querySelector('[tagName="dataTable"]');
  const DBName = dataTable.getAttribute("DBName");
  var pageSize = e.target[e.target.selectedIndex].value;
  dataTable.setAttribute("page_size", pageSize);
  dataTable.setAttribute("current_page", 1);
  searchGrid(DBName, "", "", "", mainID);
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
  if (!dataset || dataset.length === 0) return;
  const tableGrid = grid.querySelector('[tagname="dataTable"]');
  if (!tableGrid) return;
  // get the dataset labels

  if (tableGrid.getAttribute("current_page") == null) {
    tableGrid.setAttribute("current_page", 1);
  }
  var tableName = tableGrid.getAttribute("Table-Name");

  tableGrid.innerHTML = ""; // clear the grid


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
function export2CSV(e, DBName, tableName) {
  e.preventDefault();
  const grid = document.getElementById("Data-Grid_" + tableName);
  var main = e.currentTarget.closest('[tagname="dataGrid"]');
  if (!main) {
    console.error("Grid container not found for export");
    return;
  }

  const datasetFields = getGridFieldNames(main);
  if (!datasetFields.length) {
    showToast("No fields available for export", 4000);
    return;
  }

  const url = `/export-table/${DBName}/${tableName}?fields=${encodeURIComponent(datasetFields.join(","))}`;
  window.open(url, "_blank");
}

function getGridFieldNames(main) {
  try {
    const datasetAttr = main.getAttribute("dataset");
    if (!datasetAttr) {
      return [];
    }
    const dataset = JSON.parse(datasetAttr);
    const seen = new Set();
    return dataset
      .map((field) => field.fieldName || field.FieldName || field.name)
      .filter((name) => {
        if (!name) {
          return false;
        }
        const normalized = name.toLowerCase();
        if (normalized === "rowid") {
          return false;
        }
        if (seen.has(normalized)) {
          return false;
        }
        seen.add(normalized);
        return true;
      });
  } catch (error) {
    console.error("Unable to parse dataset field names", error);
    return [];
  }
}

function openImportModal(e, DBName, tableName) {
  e.preventDefault();
  const main = e.currentTarget.closest('[tagname="dataGrid"]');
  if (!main) {
    console.error("Grid container not found for import");
    return;
  }

  const fieldNames = getGridFieldNames(main);
  if (!fieldNames.length) {
    showToast("No fields available for import", 4000);
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "grid-import-overlay";
  overlay.innerHTML = `
    <div class="grid-import-modal" role="dialog" aria-modal="true" aria-labelledby="gridImportTitle">
      <div class="grid-import-header">
        <h3 id="gridImportTitle">Import data</h3>
        <button type="button" class="grid-import-close" aria-label="Close">&times;</button>
      </div>
      <div class="grid-import-body">
        <p>Select a CSV file to import into <strong>${tableName}</strong>.</p>
        <div class="grid-import-help">
          <button type="button" class="grid-import-help-toggle">Show format</button>
          <div class="grid-import-help-content" hidden>
            <p>The CSV file must include the following columns. The <code>rowid</code> column is ignored automatically.</p>
            <pre class="grid-import-help-header"></pre>
            <pre class="grid-import-help-sample"></pre>
          </div>
        </div>
        <div class="grid-import-input-wrapper">
          <input type="file" accept=".csv,text/csv" class="grid-import-input" aria-label="CSV file" />
        </div>
        <div class="grid-import-feedback" role="status"></div>
      </div>
      <div class="grid-import-actions">
        <button type="button" class="grid-import-upload" disabled>Import</button>
        <button type="button" class="grid-import-cancel">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const helpHeader = overlay.querySelector(".grid-import-help-header");
  const helpSample = overlay.querySelector(".grid-import-help-sample");
  if (helpHeader && helpSample) {
    const formatExample = buildImportFormatExample(fieldNames);
    helpHeader.textContent = formatExample.header;
    helpSample.textContent = formatExample.sample;
  }

  const fileInput = overlay.querySelector(".grid-import-input");
  const uploadButton = overlay.querySelector(".grid-import-upload");
  const feedback = overlay.querySelector(".grid-import-feedback");
  const closeButton = overlay.querySelector(".grid-import-close");
  const cancelButton = overlay.querySelector(".grid-import-cancel");
  const helpToggle = overlay.querySelector(".grid-import-help-toggle");
  const helpContent = overlay.querySelector(".grid-import-help-content");

  const closeModal = () => {
    overlay.remove();
  };

  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }
  if (cancelButton) {
    cancelButton.addEventListener("click", closeModal);
  }

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  if (helpToggle && helpContent) {
    helpToggle.addEventListener("click", () => {
      const isHidden = helpContent.hasAttribute("hidden");
      if (isHidden) {
        helpContent.removeAttribute("hidden");
        helpToggle.textContent = "Hide format";
      } else {
        helpContent.setAttribute("hidden", "");
        helpToggle.textContent = "Show format";
      }
    });
  }

  if (fileInput && uploadButton) {
    fileInput.addEventListener("change", () => {
      if (feedback) {
        feedback.textContent = "";
        feedback.classList.remove("grid-import-feedback-error");
      }
      uploadButton.disabled = !fileInput.files || fileInput.files.length === 0;
    });

    uploadButton.addEventListener("click", async () => {
      if (!fileInput.files || !fileInput.files.length) {
        return;
      }
      await submitGridImport(fileInput.files[0], fieldNames, DBName, tableName, main, uploadButton, feedback, closeModal);
    });
  }
}

function buildImportFormatExample(fieldNames) {
  const header = fieldNames.join(",");
  const sample = fieldNames.map((name) => `${name}_sample`).join(",");
  return { header, sample };
}

async function submitGridImport(file, fieldNames, DBName, tableName, main, uploadButton, feedback, closeModal) {
  if (!uploadButton) {
    return;
  }

  const originalLabel = uploadButton.textContent;
  uploadButton.disabled = true;
  uploadButton.textContent = "Importing...";

  if (feedback) {
    feedback.textContent = "";
    feedback.classList.remove("grid-import-feedback-error");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fields", JSON.stringify(fieldNames));

    const response = await apiFetch(`/import-table/${DBName}/${tableName}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let message = "Error importing data";
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          message = errorData.error;
        }
      } catch (jsonError) {
        console.error("Failed to parse import error response", jsonError);
      }
      if (feedback) {
        feedback.textContent = message;
        feedback.classList.add("grid-import-feedback-error");
      }
      uploadButton.disabled = false;
      uploadButton.textContent = originalLabel;
      return;
    }

    const result = await response.json();
    const inserted = result && typeof result.inserted === "number" ? result.inserted : 0;
    showToast(`Imported ${inserted} record${inserted === 1 ? "" : "s"}`, 5000);
    await searchGrid(DBName, "", "", "", main.id);
    closeModal();
  } catch (error) {
    console.error("Error importing grid data", error);
    if (feedback) {
      feedback.textContent = "Unexpected error while importing data";
      feedback.classList.add("grid-import-feedback-error");
    }
    uploadButton.disabled = false;
    uploadButton.textContent = originalLabel;
  }
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


/* filter format is <fieldName>|<operator>|<fieldValue> */
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
  console.log(grid);
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
  let body = null;
  switch (gridType) {
    case 0:
      body = grid.querySelector(".grid-body");
      break;
    case 1:
      body = grid;
      break;
  }
  const header = grid.querySelector(".grid-header");
  // if gridType is 1, clear the header, body
  if (body) {
    body.innerHTML = "";
  }
  if (gridType == 1 && header) {
    header.remove();
  }
  // Prepare the URL
  var url = `/table-data/${DBName}/${tableName}/${page}/${pageSize}?fields=${datasetFields}&filter=${encodeURIComponent(JSON.stringify(filterJSON))}&orderBy=${JSON.stringify(orderBy)}`;
  // get the sqljson from the main
  var sqlJson = JSON.parse(main.getAttribute("sql"));
  if (sqlJson.DBName != "") {
    // get the db name
    // generate where based on filter if are not empty
    if (filterJSON && filterJSON.filters && filterJSON.filters.length > 0) {
      const whereClauses = filterJSON.filters.map(filter => {
        return `"${filter.field}" ${filter.operator} '${filter.value}'`;
      });
      sqlJson.select += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    url = `/table-data-sql/${sqlJson.DBName}/${page}/${pageSize}?sqlQuery=${sqlJson.select}`;
  }
  // Fetch the data from the web service

  apiFetch(url).then(async response => {
    // Parse the response as JSON
    console.log("Data fetched successfully");

    const data = await response.json();
    console.log("Data fetched successfully:", data);
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
          console.log("drawPanelRow");
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
      // the header by class ctab_HeaderButton 
      const header = tab.querySelector("ul");
      if (header.childNodes.length > 0) {
        // second tab
        activateTab(event, header.childNodes[1].querySelector("a"), document.getElementById(header.childNodes[1].getAttribute("data-tab")));
        navbar_InsertRecord();
      } // end if
    });
    body.appendChild(newbutton);
  }).catch(error => {
    // Handle error response
    console.error("Error fetching data:", error);
    showToast("Error fetching data:" + error, 5000);
  });


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
    console.log(tab);
    // the header by class ctab_HeaderButton 
    const header = tab.querySelector("ul");
    if (header.childNodes.length > 0) {
      // second tab
      activateTab(event, header.childNodes[1].querySelector("a"), document.getElementById(header.childNodes[1].getAttribute("data-tab")));

    } // end if
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
    console.log(tab);
    // the header by class ctab_HeaderButton 
    const header = tab.querySelector("ul");
    if (header.childNodes.length > 0) {
      // second tab
      activateTab(event, header.childNodes[1].querySelector("a"), document.getElementById(header.childNodes[1].getAttribute("data-tab")));

    } // end if
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
      if (subField) {
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
      } // end if (subField
    } // end if (i == 0)
    i++;
  }// end forEach
  );
  body.appendChild(rowDiv);


}


// --- Helpers ---
function safeJSON(str, fallback) { try { return JSON.parse(str); } catch { return fallback; } }

/** Met à jour l'orderby puis relance la grille */
function setOrderBy(main, DBName, fieldName, order) {
  const arr = [{ fieldName, order }];           // mono-colonne ; adapte si tu veux multi
  main.setAttribute("dataorderbygrid", JSON.stringify(arr));
  searchGrid(DBName, "", "", "", main.id);
}
