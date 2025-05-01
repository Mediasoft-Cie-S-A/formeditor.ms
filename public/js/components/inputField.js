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
function createInputField(type) {

}

function editInputField(type, element, content) {


  const tableName = element.getAttribute('dataset-table-name') || "";
  const tablePrefix = tableName.substring(0, 5); // Prend maximum 5 lettres
  const columnName  = element.getAttribute('dataset-field-name') || "data";
  const nameColumn = `${tablePrefix}_${columnName}`; 

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

  const multiSelectDiv = createMultiSelectItem("Data", "data", "data");
  content.appendChild(multiSelectDiv);
 
  const maindiv = element.closest("[dataset]");
  //console.log("maindiv:", maindiv);
  const json= JSON.parse(maindiv.getAttribute("dataset"));
 
  const fieldJson=json.find(field => field.fieldName === columnName);
  
  addFieldToPropertiesBar(multiSelectDiv, fieldJson);
}



