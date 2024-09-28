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
function createDatabaseSearch(type) {
  var main = document.createElement("div");
  main.className = "dataSetContainer";
  main.id = type + Date.now(); // Unique ID for each new element
  main.draggable = true;
  main.tagName = type;
  const list = document.getElementById("ContentTableList");
  const detailsDiv = document.getElementById("tableDetails");

  return main;
}

function editDatabaseSearch(type, element, content) {
  const button = document.createElement("button");
  button.textContent = "update";
  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    updateDataSearch(main, content);
  };
  content.appendChild(button);
  content.appendChild(createMultiSelectItem("Data", "data", "data"));

  // load the data
  // check if jsonData is not empty
  if (element.getAttribute("datasearch") != null) {
    var target = content.querySelector("#Data");
    var jsonData = JSON.parse(element.getAttribute("datasearch"));
    jsonData.forEach((fieldJson) => {
      addFieldToPropertiesBar(target, fieldJson);
    });
  }
  // load the data
  // check if jsonData is not empty
}

function updateDataSearch(main, content) {
  // get all the span elements from data
  var data = content.querySelectorAll('#Data span[name="dataContainer"]');
  // generate the json of all the data
  var jsonData = [];
  data.forEach((span) => {
    console.log(span.getAttribute("data-field"));
    // get the json data from the span
    var json = JSON.parse(span.getAttribute("data-field"));
    // add the field to the json
    jsonData.push(json);
  });
  main.setAttribute("datasearch", JSON.stringify(jsonData));
  RenderDataSearch(main);
}

function search(event) {}
function RenderDataSearch(main) {
  main.innerHTML = "";
  var searchMainDiv = document.createElement("div");
  searchMainDiv.className = "search-container";
  searchMainDiv.id = "searchDiv";
  searchMainDiv.style.display = "infline-block";
  main.appendChild(searchMainDiv);
  var jsonData = JSON.parse(main.getAttribute("datasearch"));

  var i = 0;
  jsonData.forEach((field) => {
    // generate the search html
    var html =
      "<div class='searchMain' id='search_" +
      field.tableName +
      Date.now() +
      "' >";
    html +=
      "<div class='search' id='search_" + field.tableName + "_searchDiv'>";
    html +=
      "<input type='text' id='search_" +
      field.tableName +
      "_input' list='searchList' placeholder='" +
      field.fieldLabel +
      "'  autocomplete='off' ";
    html += "oninput='searchAutoComplete(event,this)' ";
    html += " data-value-DBName='" + field.DBName + "'";
    html += " data-value-table-name='" + field.tableName + "'";
    html += " data-value-field-name='" + field.fieldName + "'";
    html += " data-value-field-type='" + field.fieldType + "'";
    html +=
      ' onclick=\'this.parentElement.querySelector(".autocomplete-results").style.display="none"\'>';
    html += " <button type='button' onclick='gridSearch(event)'>";
    html += "<i class='fas fa-search'></i> </button>";
    html +=
      "<div id='search_" +
      field.tableName +
      Date.now() +
      "_autocomplete' class='autocomplete-results'>";
    html += "</div></div></div>";
    searchMainDiv.innerHTML += html;
    i++;
  });

  return element;
}

function gridSearch(event) {
  event.preventDefault();
  const maindiv = event.target.parentElement.parentElement;
  // get autocomplete div¨
  const autocomplete = maindiv.querySelector(".autocomplete-results");
  //hide autocomplete div
  autocomplete.style.display = "none";
  // get the input element
  const element = maindiv.querySelector("input");
  const DBName = element.getAttribute("data-value-DBName");
  const filedName = element.getAttribute("data-value-field-name");
  const searchValue = element.value;
  // define the operator based on the field type
  const fieldType = element.getAttribute("data-value-field-type");
  var operator = "=";
  switch (fieldType) {
    case "character":
      operator = "like";
      break;
    case "integer":
      operator = "=";
      break;
    case "date":
      operator = "=";
      break;
    case "logical":
      operator = "=";
      break;
    default:
      operator = "like";
  }
  // get all the grid div with attribute tagname=dataGrid
  let idObject = getIdObject();
  if (idObject?.dataGrid) {
    let filter = filedName + "|" + operator + "|" + searchValue;
    const gridDiv = document.getElementById(idObject.dataGrid);
    gridDiv.setAttribute("filter", filter);
    gridDiv.setAttribute("filedName", filedName);
    gridDiv.setAttribute("operator", operator);
    gridDiv.setAttribute("searchValue", searchValue);
    searchGrid(DBName, filedName, operator, searchValue, idObject.dataGrid);
  }

  if (idObject?.dataSet) {
    const main = document.getElementById(idObject.dataSet);
    let datasetFields = main.getAttribute("DataSet-Fields-List");
    var jsonData = JSON.parse(main.getAttribute("dataSet"));
    let tableName = jsonData[0].tableName;
    let filter = filedName + "|" + operator + "|" + searchValue;
    main.setAttribute("filter", filter);

    navigateRecords("move-to-first", DBName,tableName, datasetFields, "", filter);
  }
}
// searchAutoComplete that call the search function "/select-distinct/:tableName/:fieldName" and display the result in the autocomplete div
function searchAutoComplete(event, element) {
  event.preventDefault();
  const tableName = element.getAttribute("data-value-table-name");
  const fieldName = element.getAttribute("data-value-field-name");
  const fieldType = element.getAttribute("data-value-field-type");
  const autocomplete = element.parentElement.querySelector(
    ".autocomplete-results"
  );
  const searchValue = element.value.trim();
  var url =
    "/select-distinct-idvalue/" +
    tableName +
    "/" +
    fieldName +
    "?id=" +
    fieldName;
  // generate filter from searchValue if fieldType is text with openedge syntax
  if (searchValue.length > 3) {
    switch (fieldType) {
      case "character":
        url = url + "&filter=" + fieldName + " like '%" + searchValue + "%'";
        break;
      case "integer":
        url = url + "&filter=" + fieldName + "=" + searchValue;
        break;
      case "date":
        url = url + "&filter=" + fieldName + "=" + searchValue;
        break;
      case "logical":
        url = url + "&filter=" + fieldName + "=" + searchValue;
        break;
      default:
        url = url + "&filter=" + fieldName + " like '%" + searchValue + "%'";
    }
  }
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      autocomplete.innerHTML = "";
      autocomplete.setAttribute(
        "style",
        "display:block;top:" +
          (parseInt(getAbsoluteOffset(element).top) +
            parseInt(element.offsetHeight)) +
          "px;width:" +
          element.offsetWidth +
          "px;"
      );

      data.forEach((row) => {
        var rowDiv = document.createElement("div");
        rowDiv.className = "autocomplete-row";
        rowDiv.setAttribute("data-value-table-name", tableName);
        rowDiv.setAttribute("data-value-field-name", fieldName);
        rowDiv.setAttribute("data-value-field-type", fieldType);
        rowDiv.addEventListener("click", function (event) {
          event.preventDefault();

          element.value = row[fieldName];
          autocomplete.style.display = "none";
        });

        rowDiv.innerHTML = row[fieldName];
        autocomplete.appendChild(rowDiv);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

function getAbsoluteOffset(element) {
  let top = 0,
    left = 0;
  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while (element);
  return { top, left };
}
