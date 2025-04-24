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
let lastDeletedElement = null;
var moveElementEvent = false;
const labelheight = 20;
const htmlEditor =  document.getElementById('formContainer');
let undoStack = [];
let redoStack = [];
let isRestoring = false;

// Save initial state
undoStack.push(htmlEditor.innerHTML);


// Undo
function EditorUndo() {
  if (undoStack.length <= 1) return;  
  redoStack.push(htmlEditor.innerHTML);
  const previousState = undoStack[undoStack.length - 1];  
  isRestoring = true;
  htmlEditor.innerHTML = previousState;
  undoStack.pop(); // Remove the last state after restoring
  isRestoring = false;
  console.log(redoStack);
}

// Redo
function EditorRedo() {
  if (redoStack.length <= 1) return;  
  undoStack.push(htmlEditor.innerHTML);
  const previousState = redoStack[redoStack.length - 1];  
  isRestoring = true;
  htmlEditor.innerHTML = previousState;
  redoStack.pop(); // Remove the last state after restoring
  isRestoring = false;
}

// floating window for the editor

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
  lbl.textContent = label.replace(/-/g, " ").toLocaleLowerCase();
  lbl.style.fontSize = "9px";
  lbl.style.height = labelheight+"px";
  var input = document.createElement("input");
  input.type = type;
  input.className = "input-element";
  input.id = id;
  input.setAttribute("data-style-property", styleProperty); 
  input.value = text;
  div.appendChild(lbl);
  div.appendChild(input);
  // set the attribute if exists in currentElement
  if (currentElement) {
    // get the real value of the attribute 
    var attributeValue = currentElement.getAttribute(attribute);
    if (attributeValue) {
      input.value = attributeValue;
    } else {
      input.value = currentElement.style[styleProperty] || "";
    }
  }
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
  const categories = {
    "Text & Font": [
        "color", "font-size", "font-family", "font-weight", "text-align", "line-height", "text-decoration", "text-transform", "letter-spacing", "white-space"
    ],
    "Box Model": [
       "width", "height", "margin", "margin-top", "margin-right", "margin-bottom", "margin-left", "padding", "padding-top", "padding-right", "padding-bottom", "padding-left", "border", "border-width", "border-style", "border-color",  "max-width", "min-width", "max-height", "min-height"
    ],
    "Background": [
        "background-color", "background-image", "background-size", "background-position", "background-repeat"
    ],
    "Visibility": ["display", "visibility", "opacity"],
    "Positioning": ["position", "top", "right", "bottom", "left", "z-index"],
    "Flexbox": ["display", "flex-direction", "justify-content", "align-items", "align-self", "flex", "flex-grow", "flex-shrink", "order"],
    "Borders & Shadows": ["border-radius", "box-shadow"],
    "Overflow": ["overflow", "overflow-x", "overflow-y"],
    "Grid": ["display", "grid-template-rows", "grid-template-columns", "grid-template-areas", "grid-gap", "row-gap", "column-gap", "grid-auto-rows", "grid-auto-columns", "grid-auto-flow"],
    "Transitions & Animations": ["transition", "transition-property", "transition-duration", "transition-timing-function", "transition-delay", "animation", "animation-name", "animation-duration", "animation-timing-function", "animation-delay", "animation-iteration-count", "animation-direction"],
    "Filters & Effects": ["clip-path", "filter"],
    "Cursor & Interaction": ["cursor", "pointer-events"]
};


  const predefinedValues = {
      "display": ["block", "inline", "flex", "grid", "none"],
      "position": ["static", "relative", "absolute", "fixed", "sticky"],
      "text-align": ["left", "center", "right", "justify"],
      "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
      "justify-content": ["flex-start", "center", "flex-end", "space-between", "space-around"],
      "align-items": ["flex-start", "center", "flex-end", "stretch", "baseline"]
  };

  const dialog = document.getElementById("propertiesBar");
  dialog.style.display = "block";
  const content = dialog.querySelector("div");
  content.innerHTML = "";
  const closeIcon = document.createElement("i");
 
  closeIcon.style.color = "red";
  closeIcon.style.fontSize = "18px";
  closeIcon.className = "fa fa-close remove-item";
 // closeIcon.style.float = "right";
  closeIcon.onclick = () => (dialog.style.display = "none");
 

  const label = document.createElement("label");
  label.textContent = element.id;
  dialog.setAttribute("data-element-id", element.id);
  dialog.setAttribute("data-element-type", element.getAttribute("tagName"));
 // label.style.float = "left";
  
  label.style.color = "gray";
  label.style.fontSize = "18px";
  content.appendChild(label);
  content.appendChild(closeIcon);
// Get the type of the element
  // if type is null get the element type
  var type = element.getAttribute("tagName");
  currentElement = element;
    // Execute the function editor delcared in the components js if exists type
    if (elementsData[type]) {
      if (elementsData[type].editFunction) {
        var functionName = elementsData[type].editFunction;
        window[functionName](type, element, content);
      }
    }

  for (const [category, properties] of Object.entries(categories)) {
      const box = document.createElement("div");
      box.className = "editor-box";
      box.style.border = "1px solid #ccc";
      box.style.marginBottom = "10px";
      box.style.padding = "5px";
      box.style.fontSize = "9px";
      box.style.borderRadius = "5px";
      box.innerHTML = `<div style='font-weight: bold; width:100%'>${category}</div>`;

      const inputsContainer = document.createElement("div");
      inputsContainer.style.display = "grid";
      inputsContainer.style.gridGap = "5px";
      inputsContainer.style.gridTemplateColumns = "1fr 1fr";

      const inputElements = properties.map((prop) => {
          const value = element.style[prop] || "";

          let input;
          if (prop === "color" || prop === "background-color" || prop === "border-color") {
              input = document.createElement("div");
              const label = document.createElement("label");
              label.textContent = prop.replace(/-/g, " ").toLocaleLowerCase();
              label.style.fontSize = "9px";
              label.style.height = labelheight+"px";
              const colorInput = document.createElement("input");
              colorInput.type = "color";
              colorInput.value = value || "#ffffff";
              colorInput.setAttribute("data-style-property", prop);
              input.appendChild(label);
              input.appendChild(colorInput);
	      // get the value from currentElement if exists
              if (currentElement) {
                 // get the real value of the attribute 
                  var attributeValue = currentElement.getAttribute(prop);
                    if (attributeValue) {
                        colorInput.value = attributeValue;
                    } else {
                        colorInput.value = currentElement.style[prop] || "";
                    }
              }          } else if (predefinedValues[prop]) {
              input = document.createElement("div");
              const label = document.createElement("label");
              label.textContent = prop.replace(/-/g, " ").toLocaleLowerCase();
              label.style.fontSize = "9px";
              label.style.height = labelheight+"px";
              const select = document.createElement("select");
              select.setAttribute("data-style-property", prop);

              const emptyOption = document.createElement("option");
              emptyOption.value = "";
              emptyOption.textContent = "(none)";
              if (!value) emptyOption.selected = true;
              select.appendChild(emptyOption);
 		// add "" option to the select
              const emptyOption2 = document.createElement("option");
              emptyOption2.value = "";
              emptyOption2.textContent = "(empty)";
              if (value === "") emptyOption2.selected = true;
              select.appendChild(emptyOption2);
              // add the predefined values to the select
              predefinedValues[prop].forEach((option) => {
                  const optionElement = document.createElement("option");
                  optionElement.value = option;
                  optionElement.textContent = option;
                  if (option === value) optionElement.selected = true;
                  select.appendChild(optionElement);
              });

              input.appendChild(label);
              input.appendChild(select);
		// get the value from currentElement if exists
              if (currentElement) {
                  // get the real value of the attribute 
                  var attributeValue = currentElement.getAttribute(prop);
                  if (attributeValue) {
                      select.value = attributeValue;
                  } else {
                      select.value = currentElement.style[prop] || "";
                  }
              }          } else {
              input = createInputItem(prop, prop.replace(/-/g, " ").toUpperCase(), prop, value, "text");
          }

          inputsContainer.appendChild(input);
          return input;
      });

      box.appendChild(inputsContainer);

      const updateButton = document.createElement("button");
      updateButton.textContent = "Update";

	updateButton.style.marginTop = "5px";
      updateButton.style.fontSize = "9px";
      updateButton.style.width = "100%";
      updateButton.style.backgroundColor = "#4CAF50";
      updateButton.style.color = "white";
      updateButton.style.border = "1px solid #ccc";
      updateButton.onmouseover = () => {
          updateButton.style.backgroundColor = "green";
          updateButton.style.cursor = "pointer";
          updateButton.style.color = "white";
                };     
      updateButton.onclick = () => {
	// put the htmlEditor in undo stack
          undoStack.push(htmlEditor.innerHTML);
          // console.log(undoStack);          
          inputElements.forEach((input) => {
              const prop = input.querySelector("select, input").getAttribute("data-style-property");
              const value = input.querySelector("select, input").value;
	      // Check if the property is a style property or an attribute
              updateElementStyle(prop, value);
          });// insert the button at the beginning of the box
    
      }; // onclick
      
           
      box.insertBefore(updateButton, box.firstChild);
      content.appendChild(box);
    }
    
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
  // type == null return
  if (type == null) return;
  if (t == null) return;
  if (t == "") return;
  console.log("updateElementStyle", type, t);
  
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
  //show editorPropertyInfos
  const editorPropertyInfos = document.getElementById("editorPropertyInfos");
  editorPropertyInfos.style.display = "block";
  
  const inputElementSelected = document.getElementById("editorElementSelected");
  var editorElementSelected = document.getElementById(
    inputElementSelected.value
  );

  editElement(editorElementSelected);
  // put all the input elements in the editorElementSelected in writing mode
  // get all the input elements in the editorElementSelected
  var inputElements = editorElementSelected.querySelectorAll("input");
  // loop through the input elements and set them in writing mode
  for (var i = 0; i < inputElements.length; i++) {
    inputElements[i].removeAttribute("readonly");
    inputElements[i].removeAttribute("disabled"); // remove the disabled attribute
    // disable 

    inputElements[i].style.backgroundColor = "#ffffff";
  }}

function copyHTMLElement() {
  const inputElementSelected = document.getElementById("editorElementSelected");
  var editorElementSelected = document.getElementById(
    inputElementSelected.value
  );
  // set the html element to the clipboard
  navigator.clipboard.writeText(editorElementSelected.outerHTML);
}

function showHTMLCodeEditor() {
  console.log("showHTMLCodeEditor");
  const inputElementSelected = document.getElementById("editorElementSelected");
  var editorElementSelected = document.getElementById(
    inputElementSelected.value
  );
  // set the html element to the clipboard
  const CodeDialog = document.getElementById("HTMLCodeDialog");
  CodeDialog.setAttribute("data-element-id", editorElementSelected.id);
  console.log(codeEditor);
  CodeDialog.style.display = "block";
  // get the textare element
  const codeEditorArea = document.getElementById("HTMLCodeEditorArea");
  

  codeEditorHTML.setValue(editorElementSelected.outerHTML);
   

}

function saveHTMLCode() {
  undoStack.push(htmlEditor.innerHTML);
  const CodeDialog = document.getElementById("HTMLCodeDialog");
  const codeEditorArea = document.getElementById("HTMLCodeEditorArea");
  const elementId = CodeDialog.getAttribute("data-element-id");
  const editorElementSelected = document.getElementById(elementId);
  editorElementSelected.outerHTML = codeEditorHTML.getValue();
  CodeDialog.style.display = "none";
}

function pasteHTMLElement() {
  // get the clipboard content
  navigator.clipboard.readText().then((text) => {
    // get the formContainer id
    var formContainer = document.getElementById("formContainer");
    // create a new element
    var newElement = document.createElement("div");
    // set the html content to the new element
    newElement.innerHTML = text;
    // reduce the id of the new element to avoid conflict, 
    newElement.firstChild.id = newElement.firstChild.id + "_c";
    // append the new element to the formContainer
    formContainer.appendChild(newElement.firstChild);
  });
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
  undoStack.push(htmlEditor.innerHTML);
  moveElementEvent = true;
  console.log("moveElement");
}


function deleteElement() {
 undoStack.push(htmlEditor.innerHTML);
  const inputElementSelected = document.getElementById("editorElementSelected");
  const editorElementSelected = document.getElementById(inputElementSelected.value);
  if (!editorElementSelected) return;

  const parent = editorElementSelected.parentNode;
  const index = Array.from(parent.children).indexOf(editorElementSelected);

  // Sauvegarder l'élément supprimé pour undo
  lastDeletedElement = {
    node: editorElementSelected,
    parent: parent,
    index: index
  };

  parent.removeChild(editorElementSelected);

  // 🔁 Envoie la suppression au serveur
  fetch('/api/delete-component', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: editorElementSelected.id
    })
  });

  hideEditMenu();
  // ✅ Activer le bouton Undo
  document.getElementById("undoDeleteBtn").disabled = false;
}

window.undoDelete = function() {
  if (lastDeletedElement && lastDeletedElement.node && lastDeletedElement.parent) {
    const { node, parent, index } = lastDeletedElement;
    const siblings = Array.from(parent.children);

    // Réinsère à la même position qu'avant
    if (index >= siblings.length) {
      parent.appendChild(node);
    } else {
      parent.insertBefore(node, siblings[index]);
    }

    // Réinitialiser après usage
    lastDeletedElement = null;
  }
  document.getElementById("undoDeleteBtn").disabled = true;

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
    lineNumbers: true,
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

const codeEditorHTML = CodeMirror.fromTextArea(
  document.getElementById("HTMLCodeEditorArea"),
  {
    lineNumbers: true,
    mode: "htmlmixed",
    lint: true, // Enable JavaScript linting
    extraKeys: { Tab: "autocomplete" }, // Enable autocompletion
    autoCloseBrackets: true, // Enable auto-closing of brackets
    // enable copy
    readOnly: false,
    // enable paste
    matchBrackets: true,
    // enable cut
    autoCloseTags: true,
    // autocomple
   
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
  undoStack.push(htmlEditor.innerHTML);
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
 // console.log(source);
  var fieldJson = {
    DBName: filedDBName,
    tableName: tableName,
    fieldName: fieldName,
    fieldType: fieldType, // Attention!!! Will be updated on select change
    copyType: elementId,
    fieldDataType: fieldDataType,
    fieldLabel: fieldLabel.replace("'", "`"),
    fieldMandatory: fieldMandatory,
    fieldWidth: fieldWidth,
    fieldDefaultValue: fieldDefaultValue,
    functionName: "value",
    isIndex: false,
  };
  // console.log(fieldJson);
  // Get the target element
  var target = event.target;

  // If target is a text input, set its value to fieldName and data-field attribute
  if (target.type == "text") {
    target.setAttribute("data-field", JSON.stringify(fieldJson));
    target.value = fieldName;
    // similate the change event
    target.dispatchEvent(new Event("change"));
  } else {
    // get property bar
    var propertiesBar = document.getElementById("propertiesBar");
    // get the select element type 
    var tagName = propertiesBar.getAttribute("data-element-type");
    var showType= false; 
    if (tagName === "BarChart") {
      showType = true;
    }
    // Otherwise, pass the fieldJson to addFieldToPropertiesBar to create a new field
    addFieldToPropertiesBar(target, fieldJson,showType);
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
    console.log(event.target);
    console.log(this);
    // get the property bar
    var propertiesBar = document.getElementById("propertiesBar");
    // get the select element type
    var tagName = propertiesBar.getAttribute("data-element-type");
    if (tagName === "BarChart") {
      var dataType = this.getAttribute("fieldDataType");
      setOptionsByTypeChart(select, dataType);
    } else {
      // get type of the field
      var dataType = this.getAttribute("fieldType");
      // empty the select
      setOptionsByType(select, dataType);
      }
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
 

  // adding button for reducing the size of the div or reactivate it
  var button = document.createElement("i");
  button.className = "fa fa-minus-square";
  button.onclick = function () {
    if (div.style.height > "20px") {
      div.style.height = "20px";
      // get the subDivs by tag
      var subDivs = div.querySelectorAll("div");
      // loop through the subDivs
      subDivs.forEach((subDiv) => {
        subDiv.style.display = "none";
      });
      // icon change
      button.className = "fa fa-plus-square";
    } else {
      div.style.height = "auto";
      // get the subDivs by tag
      var subDivs = div.querySelectorAll("div");
      // loop through the subDivs
      subDivs.forEach((subDiv) => {
        subDiv.style.display = "block";
      });
      // icon change
      button.className = "fa fa-minus-square";
    }
  };
  div.appendChild(button);

  var lbl = document.createElement("span");

  lbl.innerText = label;
  
  div.appendChild(lbl);
  div.setAttribute("ondragover", "allowDrop(event)");
  // div.setAttribute("ondrop", "dropInput(event,'${id}')");
  div.addEventListener("drop", function (event) {
    dropInput(event, id);
  });

  // get the object by id

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

function createSQLBox(id, label, styleProperty, isId = false) {
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
 

  // adding button for reducing the size of the div or reactivate it
  var button = document.createElement("i");
  button.className = "fa fa-minus-square";
  button.onclick = function () {
    if (div.style.height > "20px") {
      div.style.height = "20px";
      // get the subDivs by tag
      var subDivs = div.querySelectorAll("div");
      // loop through the subDivs
      subDivs.forEach((subDiv) => {
        subDiv.style.display = "none";
      });
      // icon change
      button.className = "fa fa-plus-square";
    } else {
      div.style.height = "auto";
      // get the subDivs by tag
      var subDivs = div.querySelectorAll("div");
      // loop through the subDivs
      subDivs.forEach((subDiv) => {
        subDiv.style.display = "block";
      });
      // icon change
      button.className = "fa fa-minus-square";
    }
  };
  div.appendChild(button);

  var lbl = document.createElement("span");

  lbl.innerText = label;
  div.appendChild(lbl);

  var subDiv = document.createElement("div"); 
  // add dbname input
  var label = document.createElement("label");
  label.setAttribute("for", id + "Input");
  label.textContent = "DB Name";
  var input = document.createElement("input");
  input.type = "text";
  input.id = id + "dbname";
  input.setAttribute("tagname", "dbname");
  input.className = "input-element";

  input.value = "PUB";
  subDiv.appendChild(label);
  subDiv.appendChild(input);
  div.appendChild(subDiv);

  
  var subDiv = document.createElement("div");
  // add query 'select * from ' structure
  var label = document.createElement("label");
  label.setAttribute("for", id + "Input");
  label.textContent = "Query";
  var input = document.createElement("textarea");
  input.type = "text";
  input.id = id + "select";
  input.setAttribute("tagname", "select");
  input.className = "input-element";

  input.value = "select * from PUB.";
  subDiv.appendChild(label);
  subDiv.appendChild(input);
  div.appendChild(subDiv);
  // add query for the update
  var subDiv = document.createElement("div");
  var label = document.createElement("label");
  label.setAttribute("for", id + "Input");
  label.textContent = "Update Query";
  var input = document.createElement("textarea");
  input.type = "text";
  input.id = id + "update";
  input.setAttribute("tagname", "update");
  input.className = "input-element";
 
  input.value = "update PUB.";
  subDiv.appendChild(label);
  subDiv.appendChild(input);
  div.appendChild(subDiv);

  // add query for the insert
  var subDiv = document.createElement("div");
  var label = document.createElement("label");
  label.setAttribute("for", id + "Input");
  label.textContent = "Insert Query";
  var input = document.createElement("textarea");
  input.type = "text";
  input.id = id + "insert";
  input.setAttribute("tagname", "insert");
  input.className = "input-element";
  
  input.value = "insert into PUB.";
  subDiv.appendChild(label);
  subDiv.appendChild(input);
  div.appendChild(subDiv);
  



  return div;
}


function updateElementSQLOnChange(t) {
  var text = currentElement;
  text.value = t;
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
  fieldJson.displayName = fieldJson.tableName.slice(0, 5).toLowerCase() + '_' + fieldJson.fieldName;

  div.id = elementId;
  // get field name
  if (isId)
    div.innerHTML = `<button class='remove-item' onclick='removeItem(event)'>x</button><span name='dataContainerId' data-field='${JSON.stringify(
      fieldJson
    )}' >${fieldJson.displayName}</span>`;
  else
    div.innerHTML = `<button class='remove-item' onclick='removeItem(event)'>x</button><span name='dataContainer' data-field='${JSON.stringify(
      fieldJson
    )}' >${fieldJson.displayName}</span>`;
  
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
   
    div.setAttribute("selectedValue", select.value);
    div.setAttribute("data-field", JSON.stringify(fieldJson));
  

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

function addFieldToPropertiesBar(target, fieldJson, dataTypeVisble = false )
 {
  var dataObjet = target;

  // Create the div container for the new field
  var div = document.createElement("div");
  div.classList.add("tables-list-item");
  const elementId = fieldJson.fieldName + "-" + fieldJson.tableName;
  div.id = elementId;
  div.style.display = "block";
  div.style.flexDirection = "column";
  div.style.height = "60px";
  // Set up the inner HTML for the div, including a span and a remove button
  div.innerHTML = `<i class="fa fa-trash" onclick="removeItem(event)" style="color:red" title="Remove"></i>`;
  div.innerHTML += `<i class="fa fa-arrow-up" onclick="moveUp(event)" style="color:blue" title="Move Up"></i>`;
  div.innerHTML += `<i class="fa fa-arrow-down" onclick="moveDown(event)" style="color:blue"  title="Move Up"></i><hr style="margin: 0px;">`;
    // add expand the div size and reduce it button
  div.innerHTML += `<i class="fa fa-plus-square" onclick="expandReduceDiv(event,'${elementId}')" style="color:blue" title="Expand"></i>`;
  div.innerHTML += `<hr style="margin: 0px;"></hr>`;
  const prefix = fieldJson.tableName.slice(0, 3).toLowerCase() + '_';
  fieldJson.displayName = prefix + fieldJson.fieldName;
  
  
  div.innerHTML += `<span name='dataContainer' data-field='${JSON.stringify(fieldJson)}' style="  font-weight: bold;">${fieldJson.displayName}</span>`;
  
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
    
    div.setAttribute("selectedValue", select.value);
    div.setAttribute("data-field", JSON.stringify(fieldJson));
   
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
   // generate checkbox for the fieldJson.isIndex
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = "isIndex";
  checkbox.name = "isIndex";
  checkbox.value = "isIndex";
  checkbox.class="apple-switch";
  checkbox.checked = fieldJson.isIndex;
  checkbox.onclick = function (event) {
    fieldJson.isIndex = event.target.checked;
    // get span element
    const span = div.querySelector("span[name='dataContainer']");
    span.setAttribute("data-field", JSON.stringify(fieldJson));
  };
  div.appendChild(checkbox);

  // adding select datatype if 
  if (dataTypeVisble) {
    // create the div
    var selectType = document.createElement("select");   
    selectType.id = elementId+"select";
    selectType.setAttribute("name", "chartSelect");
    selectType.setAttribute("data-field", JSON.stringify(fieldJson));
    console.log(fieldJson);
    setOptionsByTypeChart(selectType, fieldJson.fieldDataType);
    div.appendChild(selectType);
  }
  // hide all the subDivs, input and select elements
  var subDivs = div.querySelectorAll("div,input,select");
  // loop through the subDivs
  subDivs.forEach((subDiv) => {
    subDiv.style.display = "none";
  });
  // set the height of the parent div
}

// function to expand or reduce the div size
function expandReduceDiv(event, elementId) {

  var div = document.getElementById(elementId);
  if (div.style.height > "60px") {
    div.style.height = "60px";
    // get the subDivs by tag
    var subDivs = div.querySelectorAll("div,input,select");
    // loop through the subDivs
    subDivs.forEach((subDiv) => {
      subDiv.style.display = "none";
    });
    // icon change
    event.target.className = "fa fa-plus-square";
  } else {
    div.style.height = "auto";
    // get the subDivs by tag
    var subDivs = div.querySelectorAll("div,input,select");
    // loop through the subDivs
    subDivs.forEach((subDiv) => {
      subDiv.style.display = "block";
    });
    // icon change
    event.target.className = "fa fa-minus-square";
  }
  // Calculate the new height of the parent div
  var dataObjet = div.parentNode;
  // for each subDiv get the height
  var height = 0;
  var subDivs = dataObjet.querySelectorAll("div");
  // loop through the subDivs
  subDivs.forEach((subDiv) => {
    height += subDiv.clientHeight+20;
  });
  // set the height of the parent div
  dataObjet.style.height = height + "px";
}

// function get options by type
function setOptionsByTypeChart(select,type)
{
    // empty the select
    select.innerHTML = '';
    // create the options
    var options=[];
    switch (type) {
        case 'string':
            options=['value','count','distinct'];
            break;
        case 'number':
        case 'integer':
        case 'decimal':        
            options=['value','sum','count','avg','min','max','distinct','std','var','median','mode','percentile'];
            break;
        case 'date':
            options=['value','count','distinct'];
            break;
        default:
            options=['value','count','distinct'];
            break;
    }
    console.log(options);
    // add the options
    options.forEach(option => {
      
        var opt = document.createElement('option');
        opt.value = option;
        opt.innerHTML = option;
        select.appendChild(opt);
    });
    console.log(select);
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

function moveUp(event) {
  var item = event.target.parentNode;
  var dataObjet = item.parentNode;
  var previous = item.previousElementSibling;
  if (previous) {
    dataObjet.insertBefore(item, previous);
  }
}

function moveDown(event) {
  var item = event.target.parentNode;
  var dataObjet = item.parentNode;
  var next = item.nextElementSibling;
  if (next) {
    dataObjet.insertBefore(next, item);
  }
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

function showDiv(divId,btn) {
 // get the div parent of button
  const parent = btn.parentNode;
  // get all the buttons
  const buttons = parent.querySelectorAll('button');
  // remove the active class from all the buttons
  buttons.forEach(button => {
    button.style.boxShadow = 'none';
  });

  document.querySelectorAll('.tab-div').forEach(div => {
      div.style.display = 'none';
      div.style.boxshadow = 'none';
  });
  const div = document.getElementById(divId);
  div.style.display = 'block';
  // inset shadow
  
  btn.style.boxShadow = 'inset 0 0 10px #000000';
}
