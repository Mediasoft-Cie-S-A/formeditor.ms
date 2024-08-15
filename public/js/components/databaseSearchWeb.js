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
function createDatabaseSearchWeb(type) {
  var main = document.createElement("div");
  main.className = "dataSetContainerWeb";
  main.id = type + Date.now(); // Unique ID for each new element
  main.draggable = true;
  main.tagName = type;
  return main;
}

function editDatabaseSearchWeb(type, element, content) {
  const button = document.createElement("button");
  button.textContent = "update";
  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    updateDataSearchWeb(main, content);
  };
  content.appendChild(button);
  content.appendChild(createMultiSelectItemWeb("Data", "data", "data"));

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

function updateDataSearchWeb(main, content) {
  // get all the span elements from data
  var data = content.querySelectorAll('#Data span[name="dataContainer"]');
  // generate the json of all the data
  var jsonData = [];
  data.forEach((span) => {
    // get the json data from the span
    var json = JSON.parse(span.getAttribute("data-field"));
    // add the field to the json
    jsonData.push(json);
  });
  main.setAttribute("datasearch", JSON.stringify(jsonData));
  RenderDataSearchWeb(main);
}

function search(event) {}
function RenderDataSearchWeb(main) {
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
    let baseurl = field.controllerServerUrl.slice(0, -1);
    var html =
      "<div class='searchMain' id='search_" + field.apiId + Date.now() + "' >";
    html += "<div class='search' id='search_" + field.apiId + "_searchDiv'>";
    html +=
      "<input type='text' id='search_" +
      field.apiId +
      "_input' list='searchList' placeholder='" +
      field.fieldName +
      "'  autocomplete='off' ";
    html += "oninput='searchAutoCompleteWeb(event,this)' ";
    html += " data-value-api-name='" + field.apiPath + "'";
    html += " data-value-api-url='" + baseurl + field.apiPath + "'";
    html += " data-value-field-name='" + field.fieldName + "'";
    html += " data-value-field-type='" + field.fieldType + "'";
    html +=
      ' onclick=\'this.parentElement.querySelector(".autocomplete-results").style.display="none"\'>';
    html += " <button type='button' onclick='gridSearchWeb(event)'>";
    html += "<i class='fas fa-search'></i> </button>";
    html +=
      "<div id='search_" +
      field.apiId +
      Date.now() +
      "_autocomplete' class='autocomplete-results'>";
    html += "</div></div></div>";
    searchMainDiv.innerHTML += html;
    i++;
  });

  return;
}

function gridSearchWeb(event) {
  event.preventDefault();
  const maindiv = event.target.parentElement.parentElement;
  // get autocomplete div¨
  const autocomplete = maindiv.querySelector(".autocomplete-results");
  //hide autocomplete div
  autocomplete.style.display = "none";
  // get the input element
  const element = maindiv.querySelector("input");
  const filedName = element.getAttribute("data-value-field-name");
  const searchValue = element.value;
  // define the operator based on the field type
  const fieldType = element.getAttribute("data-value-field-type");
  var operator = "";
  switch (fieldType) {
    case "character":
      operator = "like";
      break;
    case "integer":
      operator = "eq";
      break;
    case "date":
      operator = "eq";
      break;
    case "logical":
      operator = "eq";
      break;
    default:
      operator = "like";
  }
  const propertiesBar = document.getElementById("propertiesBar");
  const gridID = propertiesBar.querySelector("label").textContent;
  const filter = filedName + "|" + operator + "|" + searchValue;

  let idObject = getIdObject();

  if (idObject.dataSearchWeb) {
    const search = document.getElementById(idObject.dataSearchWeb);
    search.setAttribute("filter", filter);
  }

  if (idObject.dataGridWeb) {
    try {
      searchGridWeb(filedName, operator, searchValue, idObject.dataGridWeb);
    } catch {
      console.log("Error");
    }
  }

  if (idObject.dataSetWeb) {
    const main = document.getElementById(idObject.dataSetWeb);
    main.setAttribute("apiFilter", filter);
    const dataSetGrid = JSON.parse(main.getAttribute("dataset"));
    let baseurl = dataSetGrid[1]?.controllerServerUrl.slice(0, -1);
    const apiPath = dataSetGrid[1]?.apiPath;
    const apiUrl = baseurl + apiPath;
    const apiId = dataSetGrid[1]?.apiId;
    const apiMethod = dataSetGrid[1]?.apiMethod;

    moveFirstWeb(apiUrl, apiMethod, apiId);
  }
}
async function searchAutoCompleteWeb(event, element) {
  event.preventDefault();
  const apiUrl = element.getAttribute("data-value-api-url");
  const fieldName = element.getAttribute("data-value-field-name");
  const fieldType = element.getAttribute("data-value-field-type");
  const apiMethod = "GET";

  const autocomplete = element.parentElement.querySelector(
    ".autocomplete-results"
  );
  const searchValue = element.value.trim();
  try {
    let data;
    const response = await callApi(apiUrl, apiMethod);
    if (!response || response.status !== 200) return;
    let res = await response.json();
    data = res?.data;
    if (data) {
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
      const uniqueValues = new Set();
      data.forEach((row) => {
        if (!uniqueValues.has(row[fieldName])) {
          var rowDiv = document.createElement("div");
          rowDiv.className = "autocomplete-row";
          rowDiv.setAttribute("data-value-api-name", apiUrl);
          rowDiv.setAttribute("data-value-field-name", fieldName);
          rowDiv.setAttribute("data-value-field-type", fieldType);
          rowDiv.addEventListener("click", function (event) {
            event.preventDefault();
            element.value = row[fieldName];
            autocomplete.style.display = "none";
          });

          rowDiv.innerHTML = row[fieldName];
          autocomplete.appendChild(rowDiv);
          uniqueValues.add(row[fieldName]);
        }
      });
    }
  } catch {
    console.log("Error in api call");
  }
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
