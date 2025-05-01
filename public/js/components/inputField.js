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

      const fieldJson = generateFieldsJSON(element)[0];
      console.log("fieldJson généré :", fieldJson);

      addFieldToPropertiesBar(element, fieldJson);
  };

  content.appendChild(button);

  const multiSelectDiv = createMultiSelectItem("Data", nameColumn , "data");

  // ✨ Ajouter les nouvelles infos ici :
  const fieldJson = generateFieldsJSON(element)[0];

  const infoContainer = document.createElement("div");
  infoContainer.style.marginTop = "10px";
  infoContainer.style.padding = "8px";
  infoContainer.style.borderTop = "1px solid #ddd";
  infoContainer.style.fontSize = "12px";
  infoContainer.style.color = "#555"; // un gris doux
  infoContainer.style.backgroundColor = "#f9f9f9";
  infoContainer.style.borderRadius = "5px";
  
  infoContainer.innerHTML = `
      <div style="margin-bottom: 5px;">
          <strong style="width:90px; display:inline-block;">Field Type:</strong> ${fieldJson.fieldType || '-'}
      </div>
      <div style="margin-bottom: 5px;">
          <strong style="width:90px; display:inline-block;">Table Name:</strong> ${fieldJson.tableName || '-'}
      </div>
      <div>
          <strong style="width:90px; display:inline-block;">Regexp:</strong> <span style="font-family:monospace;">${fieldJson.validation || '-'}</span>
      </div>
  `;
  
  multiSelectDiv.appendChild(infoContainer);
  

  multiSelectDiv.appendChild(infoContainer);

  content.appendChild(multiSelectDiv);

  const maindiv = element.closest("[dataset]");
  console.log("maindiv:", maindiv);
}


function generateFieldsJSON(target) {
  const fields = [];

  if (target.tagName === "INPUT") {
      // Si le target est un seul input
      fields.push(extractFieldData(target));
  } else {
      // Si c'est un div contenant plusieurs inputs
      const inputs = target.querySelectorAll('input');
      inputs.forEach(input => {
          fields.push(extractFieldData(input));
      });
  }

  console.log(fields);
  return fields;
}

function extractFieldData(input) {
  return {
      id: input.getAttribute('id') || null,
      dbname: input.getAttribute('dbname') || null,
      tableName: input.getAttribute('dataset-table-name') || null,
      fieldName: input.getAttribute('dataset-field-name') || null,
      fieldType: input.getAttribute('dataset-field-type') || null,
      fieldSize: input.getAttribute('dataset-field-size') || null,
      fieldMandatory: input.getAttribute('dataset-field-mandatory') || null,
      fieldValues: input.getAttribute('dataset-field-values') || null,
      fieldSQL: input.getAttribute('dataset-field-sql') || null,
      validation: input.getAttribute('validation') || null,
      tagname: input.getAttribute('tagname') || null
  };
}
