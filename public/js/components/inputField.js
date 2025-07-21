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
  var main = document.createElement('div');
  main.classList.add('form-container');
  main.id = type + Date.now(); // Unique ID for each new element
  main.draggable = true;
  main.tagName = type;
  const inputField = document.createElement('input');
  inputField.type = "text";
  inputField.className = "form-control";
  main.appendChild(inputField);
  return main;
}

function editInputField(type, element, content) {

  console.log("editInputField", type, element, content);
  const tableName = element.getAttribute('dataset-table-name') || "";
  const tablePrefix = tableName.substring(0, 5); // Prend maximum 5 lettres
  const columnName = element.getAttribute('dataset-field-name') || "";
  const nameColumn = `${tablePrefix}_${columnName}`;

  const button = document.createElement("button");
  button.textContent = "update";
  button.style.width = "100%";

  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    updatefieldDataSet(main, content);
  };

  content.appendChild(button);

  const multiSelectDiv = createMultiSelectItem("Data", "data", "data");
  content.appendChild(multiSelectDiv);

  const maindiv = element.closest("[dataset]");
  //console.log("maindiv:", maindiv);
  const json = JSON.parse(maindiv.getAttribute("dataset"));

  const fieldJson = json.find(field => field.fieldName === columnName);

  addFieldToPropertiesBar(multiSelectDiv, fieldJson);
}



async function updatefieldDataSet(main, content) {
  console.log("updatefieldDataSet");
  const columnName = main.getAttribute('dataset-field-name') || "";
  var data = content.querySelector("#Data").querySelectorAll("span[name='dataContainer']");

  if (data.length == 0) return;
  const fields = {};

  data.forEach((span) => {
    const field = JSON.parse(span.getAttribute("data-field"));
    const fieldName = field.fieldName; // on prend le nom de la colonne comme clé
    fields[fieldName] = field; // on ajoute au format clé/valeur
  });

  console.log(fields); // tu as un objet JSON { fieldName1: {...}, fieldName2: {...} }


  const maindiv = main.closest("[dataset]");
  //console.log("maindiv:", maindiv);
  let jsonDataset = JSON.parse(maindiv.getAttribute("dataset"));

  jsonDataset = updateFieldInDataset(jsonDataset, columnName, fields);

  maindiv.setAttribute("dataset", JSON.stringify(jsonDataset));
  // get the data from the main
}

function updateFieldInDataset(jsonDataset, columnName, jsonData) {
  const fieldIndex = jsonDataset.findIndex(field => field.fieldName === columnName);

  if (fieldIndex !== -1) {
    // Correct merge: update only the matching field, not all the jsonData object
    const updatedField = jsonData[columnName];
    jsonDataset[fieldIndex] = {
      ...jsonDataset[fieldIndex],  // keep existing properties
      ...updatedField              // overwrite with the updated field values
    };
  } else {
    console.error(`Field "${columnName}" not found in dataset.`);
  }

  return jsonDataset; // Return the updated dataset
}
