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
 * - datasearch: JSON array describing searchable dataset fields.
 * - data-value-* attributes: plain strings attached to suggestion items to carry metadata (DB/table/field/type).
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


function RenderDataSearch(main) {
  main.innerHTML = "";

  const searchMainDiv = document.createElement("div");
  searchMainDiv.className = "search-container";
  searchMainDiv.id = "searchDiv";
  searchMainDiv.style.display = "inline-block"; // correction: "infline" -> "inline"
  main.appendChild(searchMainDiv);

  const jsonData = JSON.parse(main.getAttribute("datasearch") || "[]");

  jsonData.forEach((field) => {
    const searchMain = document.createElement("div");
    searchMain.className = "searchMain";
    searchMain.id = `search_${field.tableName}_${Date.now()}`;

    const searchDiv = document.createElement("div");
    searchDiv.className = "search";
    searchDiv.id = `search_${field.tableName}_searchDiv`;

    // input
    const input = document.createElement("input");
    input.type = "text";
    input.id = `search_${field.tableName}_${field.fieldName}_input`;
    input.setAttribute("list", "searchList");
    input.placeholder = field.fieldLabel;
    input.autocomplete = "off";
    // set auotocomplete off
    input.autocorrect = "off";
    input.autocapitalize = "off";
    input.spellcheck = false;
    input.setAttribute("data-value-DBName", field.DBName);
    input.setAttribute("data-value-table-name", field.tableName);
    input.setAttribute("data-value-field-name", field.fieldName);
    input.setAttribute("data-value-field-type", field.fieldType);
    input.oninput = (event) => searchAutoComplete(event, input);
    input.onclick = () => {
      searchDiv.querySelector(".autocomplete-results").style.display = "none";
    };

    // search button
    const btnSearch = document.createElement("button");
    btnSearch.type = "button";
    btnSearch.onclick = (event) => gridSearch(event);
    const iconSearch = document.createElement("i");
    iconSearch.className = "fas fa-search";
    btnSearch.appendChild(iconSearch);



    // autocomplete div
    const autoDiv = document.createElement("div");
    autoDiv.id = `search_${field.tableName}_${Date.now()}_autocomplete`;
    autoDiv.className = "autocomplete-results";
    autoDiv.style.display = "none";


    // clear button
    const btnClear = document.createElement("button");
    btnClear.type = "button";
    btnClear.onclick = (event) => {
      console.log("clear");
      event.preventDefault();
      input.value = "";
      autoDiv.style.display = "none";
      gridSearch(event);
    };
    const iconClear = document.createElement("i");
    iconClear.className = "fas fa-times";
    btnClear.appendChild(iconClear);
    // assemble
    searchDiv.appendChild(input);
    searchDiv.appendChild(btnSearch);
    searchDiv.appendChild(btnClear);
    searchDiv.appendChild(autoDiv);

    searchMain.appendChild(searchDiv);
    searchMainDiv.appendChild(searchMain);
  });

  return searchMainDiv;
}


function gridSearch(event) {
  console.log("gridSearch");
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
  let idObjects = document.querySelectorAll("div[tagname='dataGrid']");


  idObjects.forEach((idObject) => {
    // if the grid is visible
    if (idObject.style.display != "none") {
      // call the searchGrid function
      searchGrid(DBName, filedName, operator, searchValue, idObject.id);
    }

  });


}
// searchAutoComplete that call the search function "/select-distinct/:tableName/:fieldName" and display the result in the autocomplete div
function searchAutoComplete(event, element) {
  event.preventDefault();
  const DBName = element.getAttribute("data-value-DBName");
  const tableName = element.getAttribute("data-value-table-name");
  const fieldName = element.getAttribute("data-value-field-name");
  const fieldType = element.getAttribute("data-value-field-type");
  const autocomplete = element.parentElement.querySelector(
    ".autocomplete-results"
  );
  const searchValue = element.value.trim();
  var url =
    "/select-distinct-idvalue/" +
    DBName +
    "/" +
    tableName +
    "/" +
    fieldName +
    "?id=" +
    fieldName;
  const isWhitespaceString = str => !str.replace(/\s/g, '').length
  console.log(isWhitespaceString(searchValue))
  // generate filter from searchValue if fieldType is text with openedge syntax
  if (searchValue.length > 0 && !isWhitespaceString(searchValue)) {
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
    // get all the cookieStorage by tagname=cookieStorage
    var cookieStorage = document.querySelectorAll("div[tagname=cookieStorage]");
    // foreach cookieStorage extract the field name and value = select.value
    cookieStorage.forEach((storage) => {
      select = storage.querySelectorAll("select");
      select.forEach((select) => {
        var fieldName = select.getAttribute("var_name");
        var fieldValue = select.value;
        // add the field to the url
        url = url + " and " + fieldName + "='" + fieldValue + "'";
      });
    });
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        autocomplete.innerHTML = "";
        autocomplete.style.display = "block";



        data.forEach((row) => {
          var rowDiv = document.createElement("div");
          rowDiv.className = "autocomplete-row";
          rowDiv.setAttribute("data-value-DBName", DBName);
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
}


