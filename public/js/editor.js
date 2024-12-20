/*!
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

var moveElementEvent = false;

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function getIdObject() {
  const formContainer = document.getElementById("formContainer");
  var childElements = formContainer.children;
  var idObject = {};
  for (var i = 0; i < childElements.length; i++) {
    var fullId = childElements[i].id;
    var name = fullId.match(/[a-zA-Z]+/)[0];
    idObject[name] = fullId;
  }
  return idObject;
}

function getDataGridObject() {
  console.log("---getDataGridObject---")
  const grid = document.querySelector("[tagname='dataGrid']");
  console.log(grid)
  var idObject = {};
  if (grid != null){
    var fullId = grid.id;
    var name = fullId.match(/[a-zA-Z]+/)[0];
    idObject[name] = fullId;
  }
  return idObject;
}

function createInputItem(id, label, styleProperty, text, type, attribute) {
  var div = document.createElement("div");
  var lbl = document.createElement("label");
  lbl.setAttribute("for", id);
  lbl.textContent = label;

  var input = document.createElement("input");
  input.type = type;
  input.className = "input-element";
  input.id = id;
  input.onchange = function (event) {
    if (event.target.type == "file") {
    } else {
      if (attribute === true) {
        updateAttribute(styleProperty, this.value);
      } else {
        updateElementStyle(styleProperty, this.value);
      }
    }
  };
  if (input.type != "file") {
    //set the relative path for the image
    input.value = text;
  } else {
    input.setAttribute("accept", "image/*");
  }
  div.appendChild(lbl);
  div.appendChild(input);

  return div;
}

function createInputDiv(id, labelText, onChangeFunction, text) {
  var div = document.createElement("div");
  div.id = id;
  var label = document.createElement("label");
  label.setAttribute("for", id + "Input");
  label.textContent = labelText;
  var input = document.createElement("input");
  input.type = "text";
  input.id = id + "Input";
  input.className = "input-element";
  input.onchange = function () {
    onChangeFunction(this.value);
  };
  input.value = text;
  div.appendChild(label);
  div.appendChild(input);
  return div;
}

function editElement(element) {
  // Get the type of the element
  // if type is null get the element type
  var type = element.getAttribute("tagName");
  currentElement = element;
  var dialog = document.getElementById("propertiesBar");
  dialog.style.display = "block";
  var content = dialog.querySelector("div");
  content.innerHTML = "";
  // adding icon close to the dialog
  var closeIcon = document.createElement("i");

  closeIcon.className = "fa fa-close";
  closeIcon.onclick = function () {
    document.getElementById("propertiesBar").style.display = "none";
  };
  // set the icon top right
  closeIcon.classList.add("remove-item");
  closeIcon.style.float = "right";

  content.appendChild(closeIcon);

  const label = document.createElement("label");
  label.textContent = element.id;
  label.style.float = "left";
  label.style.backgroundColor = "grey";
  label.style.color = "white";
  content.appendChild(label);

  // Execute the function editor delcared in the components js if exists type
  if (elementsData[type]) {
    if (elementsData[type].editFunction) {
      var functionName = elementsData[type].editFunction;
      window[functionName](type, element, content);
    }
  }

  const style = element.style;

  content.appendChild(
    createInputDiv("label", "Text:", updateElementText, element.innerText)
  );
  content.appendChild(
    createInputDiv("text", "Value:", updateElementValue, element.value)
  );
  content.appendChild(
    createInputItem("vs", "visibility", "visibility", style.visibility, "text")
  );
  content.appendChild(
    createInputItem(
      "chk",
      "checked",
      "checked",
      element.getAttribute("checked"),
      "text"
    )
  );

  content.appendChild(
    createInputItem("wd", "width", "width", style.width, "text")
  );
  content.appendChild(
    createInputItem("hg", "height", "height", style.height, "text")
  );
  content.appendChild(
    createInputItem("cl", "color", "color", style.color, "color")
  );
  content.appendChild(
    createInputItem(
      "bg",
      "background-color",
      "background-color",
      style.backgroundColor,
      "color"
    )
  );
  content.appendChild(
    createInputItem("border", "border", "border", style.border, "text")
  );
  content.appendChild(
    createInputItem("cl", "class", "class", element.getAttribute("class")),
    "text"
  );
  content.appendChild(
    createInputItem("font", "font", "font", style.font, true, "text")
  );
  content.appendChild(
    createInputItem("margin", "margin", "margin", style.margin, "text")
  );
  content.appendChild(
    createInputItem("padding", "padding", "padding", style.padding, "text")
  );
  content.appendChild(
    createInputItem("html", "html", "html", element.innerHTML, "text", true)
  );
  content.appendChild(
    createInputItem(
      "Data Table Name",
      "dataset-table-name",
      "dataset-table-name",
      element.getAttribute("dataset-table-name"),
      "text",
      true
    )
  );
  content.appendChild(
    createInputItem(
      "Data Field Name",
      "dataset-field-name",
      "dataset-field-name",
      element.getAttribute("dataset-field-name"),
      "text",
      true
    )
  );
  content.appendChild(
    createInputItem(
      "change",
      "onChange",
      "onchange",
      element.getAttribute("onchange"),
      "text",
      true
    )
  );
  content.appendChild(
    createInputItem(
      "click",
      "onClick",
      "onclick",
      element.getAttribute("onclick"),
      "text",
      true
    )
  );

  content.appendChild(
    createInputItem(
      "dblclick",
      "Double Click",
      "dblclick",
      element.getAttribute("dblclick"),
      "text",
      true
    )
  );
}

function closeModalDbStrct() {
  document.getElementById("tableDetailsModal").style.display = "none";
  document.querySelector(".overlay").style.display = "none";
  currentElement = null;
}

function updateElementText(t) {
  var label = currentElement;
  label.innerText = t;
}

function updateElementValue(t) {
  var text = currentElement;
  text.value = t;
}

function updateElementTxtC(t) {
  currentElement.textContent = t;
}

function updateElementStyle(type, t) {
  currentElement.style.setProperty(type, t);
}

function updateAttribute(type, t) {
  currentElement.setAttribute(type, t);
}

function updateElementOnChange(t) {
  var text = currentElement.querySelector("input");
  text.value = t;
}

// Function to delete the selected element
function deleteSelectedElement() {
  // Find the selected element
  const selectedElement = document.querySelector(".Selection");

  // If an element is found and it's part of the DOM, remove it
  if (selectedElement && selectedElement.parentNode) {
    selectedElement.parentNode.removeChild(selectedElement);
  }
}

// Event listener for keypress on the window
window.addEventListener(
  "keyup",
  function (event) {
    // Check if the pressed key is the one you want, e.g., the Delete key
    if (event.key === "Delete") {
      deleteSelectedElement();
    }
  },
  false
);

// editor properties on hover, click, double click

// get the formContainer id
var formContainer = document.getElementById("formContainer");
// add event listener to the formContainer of on hover and show the context menu editorFloatMenu
// in the position where the mouse is over and aligned to right for the sub elements
formContainer.addEventListener("click", function (event) {
  event.preventDefault();
  // remove gjs-selection class from all elements
  removeSelection();

  if (event.target.id === "formContainer") {
    hideEditMenu();
  }
  //get the offset of formContainer
  const { top, left } = getAbsoluteOffset(formContainer);
  var editorElementSelected = event.target;
  editorElementSelected.classList.add("gjs-selection");
  const inputElementSelected = document.getElementById("editorElementSelected");
  inputElementSelected.value = editorElementSelected.id;
  var editorFloatMenu = document.getElementById("editorFloatMenu");
  editorFloatMenu.style.display = "block";
  // Get the total offset by combining formContainer's and element's offset
  var totalOffsetTop = top + editorElementSelected.offsetTop - 25;
  var totalOffsetLeft =
    left +
    editorElementSelected.offsetLeft +
    editorElementSelected.offsetWidth / 2;

  editorFloatMenu.style.top = totalOffsetTop + "px";
  editorFloatMenu.style.left = totalOffsetLeft + "px";
});

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

// showproperties of the element
function showProperties() {
  const inputElementSelected = document.getElementById("editorElementSelected");
  var editorElementSelected = document.getElementById(
    inputElementSelected.value
  );

  editElement(editorElementSelected);
}

function setParent() {
  
  // get the element selected by class  gjs-selection
  const editorElementSelected = document.getElementsByClassName("gjs-selection")[0];
  console.log(editorElementSelected.parentNode);
  // simulate click on parent node of editorElementSelected 
  editorElementSelected.parentNode.click();
 
  //  hideEditMenu();
}



function stopMoveEvent(event) {
  event.preventDefault();
  console.log("stopMoveEvent");
  console.log(moveElementEvent);
  if (moveElementEvent === true) {
    moveElementEvent = false;
    // get the element selected by class  gjs-selection
    const editorElementSelected = document.getElementsByClassName("gjs-selection")[0];
    // get the position of the element
    console.log(editorElementSelected);
    // get the position of the mouse
    const x = event.clientX;
    const y = event.clientY;
    // get the html element by position
    const element = document.elementFromPoint(x, y);
    console.log(element);
    // reverse the position of the elements
    // get the parent element of the element
    const parentElement = element.parentNode;
    const parentElementSelected = editorElementSelected.parentNode;
    if (element.id === "formContainer" && parentElementSelected) {
      // find the child element of the element closest to the mouse
      const closestChild = findClosestChildToMouse(element, x, y);
      if (closestChild) {
        element.insertBefore(editorElementSelected, closestChild);
      }
    } else if (parentElement.id === "formContainer"  && parentElementSelected){
      // find the child element of the element closest to the mouse
      const closestChild = findClosestChildToMouse(parentElement, x, y);
      if (closestChild) {
        parentElement.insertBefore(editorElementSelected, closestChild);
      }
    }else if (parentElement && parentElementSelected) {
      parentElement.appendChild(editorElementSelected);
    }
   

    return;
  }
  // execute the drag event
  
}

function findClosestChildToMouse(element, mouseX, mouseY) {
  if (!element || !element.children || element.children.length === 0) {
    console.warn("No child elements found in the target element.");
    return null;
  }

  let closestChild = null;
  let closestDistance = Infinity;

  Array.from(element.children).forEach((child) => {
    const rect = child.getBoundingClientRect();

    // Calculate the center of the child element
    const childCenterX = rect.left + rect.width / 2;
    const childCenterY = rect.top + rect.height / 2;

    // Calculate the distance from the mouse to the center of the child
    const distance = Math.sqrt(
      Math.pow(childCenterX - mouseX, 2) + Math.pow(childCenterY - mouseY, 2)
    );

    // Update the closest child if this one is nearer
    if (distance < closestDistance) {
      closestChild = child;
      closestDistance = distance;
    }
  });

  return closestChild;
}


function moveElement() {
  moveElementEvent = true;
  console.log("moveElement");
}


function deleteElement() {
  const inputElementSelected = document.getElementById("editorElementSelected");
  var editorElementSelected = document.getElementById(
    inputElementSelected.value
  );
  editorElementSelected.parentNode.removeChild(editorElementSelected);
  hideEditMenu();
}

function hideEditMenu() {
  var editorFloatMenu = document.getElementById("editorFloatMenu");
  editorFloatMenu.style.display = "none";
}

function removeSelection() {
  var elements = document.getElementsByClassName("gjs-selection");
  for (i = 0; i < elements.length; i++) {
    elements[i].classList.remove("gjs-selection");
  }
}

const codeEditor = CodeMirror.fromTextArea(
  document.getElementById("jsCodeEditor"),
  {
    lineNumbers: false,
    mode: "javascript",
    lint: true, // Enable JavaScript linting
    extraKeys: { Tab: "autocomplete" }, // Enable autocompletion
    autoCloseBrackets: true, // Enable auto-closing of brackets
    // enable copy
    readOnly: false,
    // enable paste
    matchBrackets: true,
    // enable cut
    autoCloseTags: true,
  }
);

codeEditor.on("change", function (instance, changeObj) {
  // Syntax checking logic here (if needed)
  // For example, you can use a linter library like ESLint or JSHint
  /* textarea=document.getElementById('jsCodeEditor');
    textarea.value=codeEditor.getValue();*/
});

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dropInput(event, id) {
  event.preventDefault();

  // Get the dragged element's ID and its attributes
  var elementId = event.dataTransfer.getData("text");
  var source = document.getElementById(elementId);

  var tableName = source.getAttribute("data-table-name");
  var fieldName = source.getAttribute("data-field-name");
  var fieldType = source.getAttribute("data-field-type");
  var fieldDataType = source.getAttribute("data-field-type");
  var fieldLabel = source.getAttribute("data-field-label");
  var fieldMandatory = source.getAttribute("data-field-mandatory");
  var fieldWidth = source.getAttribute("data-field-width");
  var fieldDefaultValue = source.getAttribute("data-field-default");

  var filedDBName = source.getAttribute("database-name");
  // generate the json of all the fields attributes

  var fieldJson = {
    DBName: filedDBName,
    tableName: tableName,
    fieldName: fieldName,
    fieldType: fieldType, // Will be updated on select change
    copyType: id,
    fieldDataType: fieldDataType,
    fieldLabel: fieldLabel.replace("'", "`"),
    fieldMandatory: fieldMandatory,
    fieldWidth: fieldWidth,
    fieldDefaultValue: fieldDefaultValue,
  };

  // Get the target element
  var target = event.target;

  // If target is a text input, set its value to fieldName and data-field attribute
  if (target.type == "text") {
    target.setAttribute("data-field", JSON.stringify(fieldJson));
    target.value = fieldName;
    // similate the change event
    target.dispatchEvent(new Event("change"));
  } else {
    // Otherwise, pass the fieldJson to addFieldToPropertiesBar to create a new field
    addFieldToPropertiesBar(target, fieldJson);
  }
}

function createSelectItem(id, label, styleProperty) {
  var div = document.createElement("div");
  div.id = id;
  var lbl = document.createElement("label");
  lbl.setAttribute("for", id);
  lbl.textContent = label;

  var select = document.createElement("select");
  select.id = id + "select";

  const input = document.createElement("input");
  input.setAttribute("ondragover", "allowDrop(event)");
  input.setAttribute("ondrop", "dropInput(event)");
  input.setAttribute("readonly", "true");
  input.setAttribute("ObjectType", "labels");

  var subDiv = document.createElement("div");
  subDiv.id = "subDiv";
  subDiv.style.display = "flex";

  div.appendChild(lbl);
  div.appendChild(input);
  div.appendChild(select);
  div.appendChild(subDiv);

  input.addEventListener("input", function (event) {
    // get type of the field
    var dataType = this.getAttribute("dataType");
    // empty the select
    setOptionsByType(select, dataType);

    // get the object by id
  });
  return div;
}

function setOptionsByType(select, fieldDataType) {
  // Define some options (this could be customized based on fieldDataType)
  /* var options = [
    "text",
    "number",
    "date",
    "password",
    "image",
    "time",
    "color",
    "combobox",
  ]; */

  var options = ["text", "sequence", "array", "combo_array", "combo_sql","search_win"];

  // Clear any existing options in the select element
  select.innerHTML = "";

  // Populate the select dropdown with the options
  options.forEach((option) => {
    var opt = document.createElement("option");
    opt.value = option;
    opt.innerHTML = option;
    select.appendChild(opt);
  });

  // Optionally, set the default selected value (based on fieldDataType)
  if (options.includes(fieldDataType)) {
    select.value = fieldDataType;
  }
}

function setOptionsByTypeWeb(select, fieldDataType) {
  // Define some options (this could be customized based on fieldDataType)
  /* var options = [
    "text",
    "number",
    "date",
    "password",
    "image",
    "time",
    "color",
    "combobox",
  ]; */

  var options = ["text", "sequence", "array", "combo_array", "combo_web"];

  // Clear any existing options in the select element
  select.innerHTML = "";

  // Populate the select dropdown with the options
  options.forEach((option) => {
    var opt = document.createElement("option");
    opt.value = option;
    opt.innerHTML = option;
    select.appendChild(opt);
  });

  // Optionally, set the default selected value (based on fieldDataType)
  if (options.includes(fieldDataType)) {
    select.value = fieldDataType;
  }
}

function createMultiSelectItem(id, label, styleProperty) {
  var div = document.createElement("div");
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.padding = "5px";
  div.style.minHeight = "100px";
  div.style.border = "1px solid #ccc";
  // rounded corners
  div.style.borderRadius = "5px";
  div.id = id;
  div.style.className = "multi-select";
  div.setAttribute("ObjectType", id);
  // set draggable attribute
  div.setAttribute("draggable", "true");

  div.id = id;
  var lbl = document.createElement("span");

  lbl.innerText = label;

  div.setAttribute("ondragover", "allowDrop(event)");
  // div.setAttribute("ondrop", "dropInput(event,'${id}')");
  div.addEventListener("drop", function (event) {
    dropInput(event, id);
  });

  // get the object by id

  div.appendChild(lbl);
  //div.appendChild(multi);
  //div.appendChild(select);

  return div;
}

function createSelectApiWeb(id, type = "") {
  var div = document.createElement("div");
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.padding = "5px";
  div.style.minHeight = "100px";
  div.style.border = "1px solid #ccc";
  // rounded corners
  div.style.borderRadius = "5px";
  div.id = id;
  div.style.className = "multi-select";
  div.setAttribute("ObjectType", "data");
  // set draggable attribute
  div.setAttribute("draggable", "true");

  div.id = id;
  var lbl = document.createElement("span");

  lbl.innerText = type;

  div.setAttribute("ondragover", "allowDrop(event)");
  div.setAttribute("ondrop", "dropSelectApiWeb(event, '" + type + "')");

  div.appendChild(lbl);

  return div;
}

function dropSelectApiWeb(event, type) {
  event.preventDefault();
  var elementId = event.dataTransfer.getData("text");

  // get the element target
  var target = event.target;
  // get the element type

  var source = document.getElementById(elementId);

  var apiDataInputs = JSON.parse(source.getAttribute("api-data-inputs"));
  var apiDataOutputs = JSON.parse(source.getAttribute("api-data-outputs"));
  var controllerControllerName = source.getAttribute(
    "data-controller-controllerName"
  );
  var controllerServerUrl = source.getAttribute("data-controller-serverUrl");
  var apiName = source.getAttribute("data-api-name");
  var apiMethod = source.getAttribute("data-api-method");
  var apiPath = source.getAttribute("data-api-path");
  var apiId = source.getAttribute("data-api-id");

  var apiJSON = {
    controllerControllerName: controllerControllerName,
    controllerServerUrl: controllerServerUrl,
    apiId: apiId,
    apiName: apiName,
    apiMethod: apiMethod,
    apiPath: apiPath,
    apiDataInputs: apiDataInputs,
    apiDataOutputs: apiDataOutputs,
  };

  var dataObjete = target;
  // create the div
  var div = document.createElement("div");
  div.classList.add("tables-list-item");
  const divId = type + "_" + apiJSON.apiId;
  div.id = divId;
  div.innerHTML = `<button class='remove-item' onclick='removeItem(event)'>x</button><span name='dataContainer${type}' data-field='${JSON.stringify(
    apiJSON
  )}' >${apiJSON.apiName}</span>`;
  dataObjete.appendChild(div);
}

function addApiToPropertiesBarWeb(target, apiJSON, type) {
  var dataObjete = target;
  // create the div
  var div = document.createElement("div");
  div.classList.add("tables-list-item");
  const divId = type + "_" + apiJSON.apiId;
  div.id = divId;
  div.innerHTML = `<button class='remove-item' onclick='removeItem(event)'>x</button><span name='dataContainer${type}' data-field='${JSON.stringify(
    apiJSON
  )}' >${apiJSON.apiName}</span>`;
  dataObjete.appendChild(div);
}

function createMultiSelectItemWeb(id, label, styleProperty, isId = false) {
  var div = document.createElement("div");
  div.style.display = "flex";
  div.style.flexDirection = "column";
  div.style.padding = "5px";
  div.style.minHeight = "100px";
  div.style.border = "1px solid #ccc";
  // rounded corners
  div.style.borderRadius = "5px";
  div.id = id;
  div.style.className = "multi-select";
  div.setAttribute("ObjectType", "data");
  // set draggable attribute
  div.setAttribute("draggable", "true");

  div.id = id;
  var lbl = document.createElement("span");

  lbl.innerText = label;

  div.setAttribute("ondragover", "allowDrop(event)");
  div.setAttribute("ondrop", "dropInputWeb(event," + isId + ")");

  div.appendChild(lbl);

  return div;
}

function dropInputWeb(event, isId) {
  event.preventDefault();
  var elementId = event.dataTransfer.getData("text");

  // get the element target
  var target = event.target;
  // get the element type

  var source = document.getElementById(elementId);
  var fieldKind = source.getAttribute("data-field-kind");
  if (fieldKind !== "outputs") return;
  var isArray = source.getAttribute("data-field-array");
  if (!isArray || isArray === "false") return;

  var controllerControllerName = source.getAttribute(
    "data-controller-controllerName"
  );
  var controllerServerUrl = source.getAttribute("data-controller-serverUrl");
  var apiId = source.getAttribute("data-api-id");
  var apiName = source.getAttribute("data-api-name");
  var apiMethod = source.getAttribute("data-api-method");
  var apiPath = source.getAttribute("data-api-path");
  var fieldName = source.getAttribute("data-field-name");
  var fieldType = source.getAttribute("data-field-type");
  var fieldFormat = source.getAttribute("data-field-format");
  var fieldCode = source.getAttribute("data-field-code");
  var fieldObject = source.getAttribute("data-field-object");
  var fieldObjectName = source.getAttribute("data-field-objectName");
  var fieldArray = source.getAttribute("data-field-array");
  var fieldArrayName = source.getAttribute("data-field-arrayName");
  var fieldId = source.getAttribute("data-field-id");

  // generate the json of all the fields attributes
  var fieldJson = {
    controllerControllerName: controllerControllerName,
    controllerServerUrl: controllerServerUrl,
    apiId: apiId,
    apiName: apiName,
    apiMethod: apiMethod,
    apiPath: apiPath,
    fieldName: fieldName,
    fieldType: fieldType,
    fieldFormat: fieldFormat,
    fieldCode: fieldCode,
    fieldObject: fieldObject,
    fieldObjectName: fieldObjectName,
    fieldArray: fieldArray,
    fieldArrayName: fieldArrayName,
    fieldId: fieldId,
  };

  if (target.type == "text") {
    target.setAttribute("data-field", JSON.stringify(fieldJson));
    target.value = fieldName;
  } else addFieldToPropertiesBarWeb(target, fieldJson, isId);
}

// function to adding new fileds to the properties bar
function addFieldToPropertiesBarWeb(target, fieldJson, isId) {
  var dataObjet = target;
  // create the div
  var div = document.createElement("div");
  div.classList.add("tables-list-item");
  const elementId = fieldJson.fieldName + "_" + fieldJson.fieldId;
  div.id = elementId;
  // get field name
  if (isId)
    div.innerHTML = `<button class='remove-item' onclick='removeItem(event)'>x</button><span name='dataContainerId' data-field='${JSON.stringify(
      fieldJson
    )}' >${fieldJson.fieldName}</span>`;
  else
    div.innerHTML = `<button class='remove-item' onclick='removeItem(event)'>x</button><span name='dataContainer' data-field='${JSON.stringify(
      fieldJson
    )}' >${fieldJson.fieldName}</span>`;
  dataObjet.appendChild(div);

  div.innerHTML += `<div>Mandatory:<input type="checkbox" class="apple-switch" id="mandatory" name="mandatory" value="mandatory" ${
    fieldJson.fieldMandatory === "true" ? "checked" : ""
  } onclick="updateMandatory(event, '${elementId}')"> </div>`;
  // adding verification triggers not null fields checkbox
  div.innerHTML += `<div>regexp<input type="text"  tagname="regexp" id="regexp" name="regexp" 
  } onclick="regexp(event, '${elementId}')"></div>`;

  // generate the select
  if (!isId) {
    var select = document.createElement("select");
    div.appendChild(select);
  }
  // get the datatype

  setOptionsByTypeWeb(select, fieldJson.fieldDataType);
  // select the functionName in the function
  div.setAttribute("selectedValue", select.value);
  select.addEventListener("change", function () {
    // remove the textarea if it exists
    var textarea = div.querySelector("textarea");
    if (textarea) {
      textarea.remove();
    }
    // Update fieldType in fieldJson
    fieldJson.fieldType = select.value;
    fieldJson.fieldDataType = select.value;
    div.setAttribute("selectedValue", select.value);
    div.setAttribute("data-field", JSON.stringify(fieldJson));
    div.setAttribute("fieldDataType", JSON.stringify(fieldJson));

    const span = div.querySelector("span[name='dataContainer']");
    span.setAttribute("data-field", JSON.stringify(fieldJson));
    switch (select.value) {
      case "combo_array":
      case "array":
      case "combo_web":
      case "sequence":
        var textarea = document.createElement("textarea");
        textarea.id = "Data";

        textarea.setAttribute("rows", "4");
        textarea.style.width = "100%";
        textarea.style.marginTop = "10px";
        textarea.style.marginBottom = "10px";
        textarea.style.border = "1px solid #ccc";
        textarea.style.borderRadius = "5px";
        textarea.style.padding = "5px";
        textarea.style.resize = "none";
        textarea.style.flex = "1";
        div.appendChild(textarea);
        // Event listener to update fieldValues when the textarea value changes
        if (
          select.value === "combo_array" ||
          select.value === "array" ||
          select.value === "sequence"
        ) {
          textarea.setAttribute("placeholder", "Enter comma separated values");
          // set the textarea vaule from fieldValues if exists
          if (fieldJson.fieldValues) {
            textarea.value = fieldJson.fieldValues.join(",");
          }
          textarea.addEventListener("change", function () {
            fieldJson.fieldValues = this.value.split(",");
            // get span element
            const span = div.querySelector("span[name='dataContainer']");
            span.setAttribute("data-field", JSON.stringify(fieldJson));
          });
        }
        if (select.value === "combo_web") {
          textarea.setAttribute("placeholder", "Enter the url");
          // set the textarea vaule from fieldSQL if exists
          if (fieldJson.fieldSQL) {
            textarea.value = fieldJson.fieldSQL;
          }

          textarea.addEventListener("change", function () {
            fieldJson.fieldSQL = this.value;
            // get span element
            const span = div.querySelector("span[name='dataContainer']");
            span.setAttribute("data-field", JSON.stringify(fieldJson));
          });
        }
        break;
    }
  });

  // force the change event to set the fieldJson
  select.dispatchEvent(new Event("change"));
  // Adjust the height of the parent element to accommodate the new field
  var height = dataObjet.clientHeight + div.clientHeight;
  // set the height of the parent div
  dataObjet.style.height = height + 30 + "px";
  // get the parent div height
  // var height = dataObjet.clientHeight + div.clientHeight;
  // // set the height of the parent div
  // dataObjet.style.height = height + 30 + "px";
}

function addFieldToPropertiesBar(target, fieldJson) {
  var dataObjet = target;

  // Create the div container for the new field
  var div = document.createElement("div");
  div.classList.add("tables-list-item");
  const elementId = fieldJson.fieldName + "-" + fieldJson.tableName;
  div.id = elementId;

  // Set up the inner HTML for the div, including a span and a remove button
  div.innerHTML = `
    <span name='dataContainer' data-field='${JSON.stringify(fieldJson)}'>${
    fieldJson.fieldName
  }</span>
    <button class='remove-item' onclick='removeItem(event)' style='background:#800;float:right;color:white;border-radius:5px;width:30px;height:30px'>x</button>
  `;

  dataObjet.appendChild(div);

  // adding verification triggers mandatories fields checkbox
  div.innerHTML += `<div>Mandatory:<input type="checkbox" class="apple-switch" id="mandatory" name="mandatory" value="mandatory" ${
    fieldJson.fieldMandatory === "true" ? "checked" : ""
  } onclick="updateMandatory(event, '${elementId}')"> </div>`;
  // adding verification triggers not null fields checkbox
  div.innerHTML += `<div>regexp<input type="text"  tagname="regexp" id="regexp" name="regexp" 
} onclick="regexp(event, '${elementId}')"></div>`;

  // Create a select dropdown
  var select = document.createElement("select");
  div.appendChild(select);

  // Populate select options based on field's data type
  setOptionsByType(select, fieldJson.fieldDataType);

  // Set the selected value as an attribute in the div
  div.setAttribute("selectedValue", select.value);

  // Event listener to update fieldType when the select dropdown value changes
  select.addEventListener("change", function () {
    // remove the textarea if it exists
    var textarea = div.querySelector("textarea");
    if (textarea) {
      textarea.remove();
    }
    // Update fieldType in fieldJson
    fieldJson.fieldType = select.value;
    fieldJson.fieldDataType = select.value;
    div.setAttribute("selectedValue", select.value);
    div.setAttribute("data-field", JSON.stringify(fieldJson));
    div.setAttribute("fieldDataType", JSON.stringify(fieldJson));

    const span = div.querySelector("span[name='dataContainer']");
    span.setAttribute("data-field", JSON.stringify(fieldJson));
    switch (select.value) {
      case "combo_array":
      case "combo_sql":
      case "array":
      case "sequence":
      case "search_win":
        var textarea = document.createElement("textarea");
        textarea.id = "Data";

        textarea.setAttribute("rows", "4");
        textarea.style.width = "100%";
        textarea.style.marginTop = "10px";
        textarea.style.marginBottom = "10px";
        textarea.style.border = "1px solid #ccc";
        textarea.style.borderRadius = "5px";
        textarea.style.padding = "5px";
        textarea.style.resize = "none";
        textarea.style.flex = "1";
        div.appendChild(textarea);
        // Event listener to update fieldValues when the textarea value changes
        if (
          select.value === "combo_array" ||
          select.value === "array" ||
          select.value === "sequence"
        ) {
          textarea.setAttribute("placeholder", "Enter comma separated values");
          // set the textarea vaule from fieldValues if exists
          if (fieldJson.fieldValues) {
            textarea.value = fieldJson.fieldValues.join(",");
          }
          textarea.addEventListener("change", function () {
            fieldJson.fieldValues = this.value.split(",");
            // get span element
            const span = div.querySelector("span[name='dataContainer']");
            span.setAttribute("data-field", JSON.stringify(fieldJson));
          }); // end of textarea change event
        }
        if (select.value === "combo_sql" || select.value === "search_win") {
          if (select.value === "combo_sql") {
            textarea.setAttribute("placeholder", "Enter Sql Query, id, value");
          }
          if (select.value === "search_win") {
            textarea.setAttribute("placeholder", "DBName|Enter Sql Query, id, value1, value2, value3 ..");
          }
          // set the textarea vaule from fieldSQL if exists
          if (fieldJson.fieldSQL) {
            textarea.value = fieldJson.fieldSQL;
          }

          textarea.addEventListener("change", function () {
            fieldJson.fieldSQL = this.value;
            // get span element
            const span = div.querySelector("span[name='dataContainer']");
            span.setAttribute("data-field", JSON.stringify(fieldJson));
          }); // end of textarea change event
        }
        break;
    }
  });

  // force the change event to set the fieldJson
  select.dispatchEvent(new Event("change"));
  // Adjust the height of the parent element to accommodate the new field
  var height = dataObjet.clientHeight + div.clientHeight;
  dataObjet.style.height = height + 30 + "px";
}

// function to remove the item
function removeItem(event) {
  var item = event.target.parentNode;
  var dataObjet = item.parentNode;
  // get the parent div height
  var height = dataObjet.clientHeight - item.clientHeight;
  // set the height of the parent div
  dataObjet.style.height = height + 30 + "px";
  item.remove();
}


// filter 

// Function to initialize the filter box
function createFilterBox(main) {
    var div = document.createElement("div");
    div.id = 'filterBox';
    
    var lbl = document.createElement("label");
    lbl.setAttribute("for", div.id);
    lbl.textContent = "Filter:";
    div.appendChild(lbl);

    // Add button to add a new filter
    var addButton = document.createElement("button");
    addButton.innerHTML = '<i class="fa fa-plus"></i>';
    addButton.onclick = function() {
        const filterBoxContainer = main.querySelector('#filterBoxContainer');
        filterBoxContainer.appendChild(createFilterField(main));
    };
    div.appendChild(addButton);

    // Clear button for the filter with icon
    var clearButton = document.createElement("button");
    clearButton.innerHTML = '<i class="fa fa-trash"></i>';
    clearButton.onclick = function() {
        const chart = document.getElementById(main.getAttribute("elementId"));
        chart.removeAttribute("filter");
        const filterBoxContainer = main.querySelector('#filterBoxContainer');
        filterBoxContainer.innerHTML = '';
        const viewSelect = main.querySelector('#viewSelect');
        switchView(event, main, viewSelect.value);
    };
    div.appendChild(clearButton);

    // Create container for the filter box
    const filterBoxContainer = document.createElement('div');
    filterBoxContainer.id = 'filterBoxContainer';

    // Create the view select dropdown
    const viewSelect = document.createElement('select');
    viewSelect.id = 'viewSelect';
    ['standard', 'advanced'].forEach(view => {
        const option = new Option(view, view);
        viewSelect.options.add(option);
    });

    // Append the view select to the container
    div.appendChild(viewSelect);

    // Event listener for changing views
    viewSelect.addEventListener('change', function(event) {
        switchView(event, main, this.value);
    });
    div.appendChild(filterBoxContainer);

    // Create button to apply filter
    const generateJsonBtn = document.createElement('button');
    generateJsonBtn.textContent = 'Apply';
    generateJsonBtn.setAttribute("onclick", "generateJson(event)");
    div.appendChild(generateJsonBtn);

    return div;
}

// Function to create individual filter fields
function createFilterField(main) {
    const container = document.createElement('div');
    container.className = 'filterField';

    const textField = document.createElement('input');
    textField.placeholder = 'Field';
    textField.name = 'field';
    textField.setAttribute('ObjectType', 'filters');
    textField.setAttribute('ondragover', 'allowDrop(event)');
    textField.setAttribute('ondrop', 'dropInput(event)');

    container.appendChild(textField);

    // Create and append input fields based on view
    const viewSelect = main.querySelector('#viewSelect').value;
    if (viewSelect === 'standard') {
        const multiSelect = document.createElement('select');
        multiSelect.multiple = true;
        multiSelect.className = '';

        textField.addEventListener('change', function(event) {
            const datafield = JSON.parse( this.getAttribute('data-field'));
            const DBName = datafield.DBName;
            const tableName = datafield.tableName;
            const fieldName = datafield.fieldName;
            const url= `/select-distinct/${DBName}/${tableName}/${fieldName}`;
        //    const url = '/getDatasetDataDistinct/' + dataset + '/' + this.value;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    multiSelect.innerHTML = '';
                    data.forEach(value => {
                        var opt = document.createElement('option');
                        opt.className = 'filter-item';
                        opt.value = value[fieldName];
                        opt.innerHTML = value[fieldName];
                        multiSelect.appendChild(opt);
                    });

                    
                });
        });

        container.appendChild(multiSelect); 
    } else if (viewSelect === 'advanced') {
        const operatorSelect = document.createElement('select');
        ['=', '!=', '<', '>', '>=', '<='].forEach(op => {
            const option = new Option(op, op);
            operatorSelect.options.add(option);
        });

        const valueInput = document.createElement('input');
        valueInput.placeholder = 'Value';

        container.appendChild(operatorSelect);
        container.appendChild(valueInput);
    }

    return container;
}

// Function to switch views
function switchView(event, main, view) {
    event.preventDefault();
    const container = main.querySelector('#filterBoxContainer');
    container.innerHTML = '';

    const addFilterField = createFilterField(main);
    container.appendChild(addFilterField);
}
  
 // Function to collect data and generate JSON
function generateJson(event) {
    event.preventDefault();
    console.log("generateJson");
    // get the main element
   
    
   
    const viewSelect = event.target.parentNode.parentNode.querySelector('#viewSelect');
   
    if (!viewSelect) return;
    
    const view = viewSelect.options[viewSelect.selectedIndex].value;
    let filterInfo = { view: view, filters: [] };
    
    const filterFields = event.target.parentNode.parentNode.querySelectorAll('#filterBoxContainer .filterField');

 

    filterFields.forEach(filterField => {
       
        const fieldInput = filterField.querySelector('input[name="field"]');
        const dataType = fieldInput.getAttribute('dataType');
        
        if (view === 'standard') {
            const multiSelect = filterField.querySelector('select');
          
            const selectedOptions = Array.from(multiSelect.selectedOptions).map(option => option.value);
            let filterValues = [];
            datafield = JSON.parse( fieldInput.getAttribute('data-field'));
            console.log(selectedOptions);
            switch (datafield.fieldDataType) {
                case 'string':
                    filterValues = selectedOptions;
                    break;
                case 'number':
                    filterValues = selectedOptions.map(option => parseFloat(option));
                    break;
                case 'date':
                    filterValues = selectedOptions.map(option => new Date(option));
                    break;
                default:
                    filterValues = selectedOptions;
                    break;
            }

           

            filterInfo.filters.push({
                field: datafield.fieldName,
                DBName: datafield.DBName,
                type: datafield.fieldDataType,
                operator: '',
                value: '',
                values: filterValues
            });

        } else if (view === 'advanced') {
            const operatorSelect = filterField.querySelector('select');
            const valueInput = filterField.querySelector('input[placeholder="Value"]');
            let value = null;

            switch (dataType) {
                case 'string':
                    value = valueInput.value;
                    break;
                case 'number':
                    value = parseFloat(valueInput.value);
                    break;
                case 'date':
                    value = new Date(valueInput.value);
                    break;
            }

            filterInfo.filters.push({
                field: fieldInput.value,
                DBName: fieldInput.getAttribute('DBName'),
                type: dataType,
                operator: operatorSelect.value,
                value: value,
                values: []
            });
        }
    });

     // Display the JSON for demonstration purposes
   //  console.log(JSON.stringify(filterInfo));
    const propertiesBar = document.getElementById("propertiesBar");
    // get id of the element
    const element = document.getElementById( propertiesBar.querySelector("label").innerText);
    // console.log(element);
    element.setAttribute("filter", JSON.stringify(filterInfo));

    // Here you could also send the JSON to a server, save it, or use it in some other way
    // For example:
    // fetch('/api/filters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filterInfo) });
}

 // Function to regenerate filters from JSON
function regenerateFilters(content, filterConfig) {
    if (!filterConfig) return;
    switchView(event, content, filterConfig.view); // Ensure the correct view is set
    
    if (!filterConfig.filters) return;

    if (filterConfig.filters.length > 0) {
        filterConfig.filters.forEach(filter => {
            const filterBoxContainer = content.querySelector('#filterBoxContainer');
            const filterField = createFilterField(content);
            filterBoxContainer.appendChild(filterField);
            
            const textField = filterField.querySelector('input[name="field"]');
            textField.value = filter.field;
            textField.setAttribute('dataType', filter.type);
            textField.setAttribute('dataset', filter.dataset);

            if (filterConfig.view === 'standard') {
                const multiSelect = filterField.querySelector('select');
                textField.dispatchEvent(new Event('input')); // Trigger input event to populate options
                setTimeout(() => {
                    filter.values.forEach(val => {
                        for (let option of multiSelect.options) {
                            if (option.value === val) option.selected = true;
                        }
                    });
                }, 1000); // Adjust timeout as needed to ensure options are populated
            } else if (filterConfig.view === 'advanced') {
                filterField.querySelector('select').value = filter.operator;
                filterField.querySelector('input[placeholder="Value"]').value = filter.value;
            }
        });
    }
    

}

function showDiv(divId) {
  document.querySelectorAll('.tab-div').forEach(div => {
      div.style.display = 'none';
  });
  document.getElementById(divId).style.display = 'block';
}