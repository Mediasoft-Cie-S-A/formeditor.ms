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

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function createInputItem(id, label, styleProperty,text) {
    console.log(text);
    var div = document.createElement("div");
    var lbl = document.createElement("label");
    lbl.setAttribute("for", id);
    lbl.textContent = label;

    var input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.onchange = function() { updateElementStyle(styleProperty, this.value); };
    input.value=text

    div.appendChild(lbl);
    div.appendChild(input);

    return div;
}

function createInputDiv(id, labelText, onChangeFunction,text) {
    var div = document.createElement("div");
    div.id = id;

    var label = document.createElement("label");
    label.setAttribute("for", id + "Input");
    label.textContent = labelText;

    var input = document.createElement("input");
    input.type = "text";
    input.id = id + "Input";
    input.onchange = function() { onChangeFunction(this.value); };
    input.value=text;
    div.appendChild(label);
    div.appendChild(input);

    return div;
}

function editElement(element) {
        currentElement=element
        var dialog= document.getElementById("modalDialogText");
        dialog.style.display = 'block';
        console.log(element);
        document.querySelector(".overlay").style.display = 'block';
        var content= document.querySelector(".dialogContent");
        removeAllChildNodes(content);
      
        if (element instanceof HTMLDivElement)
        {
            // Create and append the elements
            var labelDiv = createInputDiv("label", "Text:", updateElementText,element.querySelector('label').innerText);
            var textDiv = createInputDiv("text", "Value:", updateElementValue,element.querySelector('input').value);
            var checkedDiv = createInputDiv("sld", "checked", function(value) { updateElementStyle('checked', value); },element.querySelector('input').checked);
            var onChangeDiv = createInputDiv("change", "OnChange Event:", updateElementOnChange,"");

            content.appendChild(labelDiv);
            content.appendChild(textDiv);
            content.appendChild(checkedDiv);
            content.appendChild(onChangeDiv);
                
        }
        if (element instanceof HTMLButtonElement)
        {
                // Create and append the elements
        var textContentDiv = createInputDiv("textContent", "Value:", updateElementTxtC,element.querySelector('textarea').textContent);
        var clickDiv = createInputDiv("click", "OnChange Event:", updateElementOnChange,"");

        content.appendChild(textContentDiv);
        content.appendChild(clickDiv);
        
        }
        const style = element.style;
        content.appendChild(createInputItem("wd", "width", "width",style.width));
        content.appendChild(createInputItem("hg", "height", "height",style.height));
        content.appendChild(createInputItem("cl", "color", "color",style.color));
        content.appendChild(createInputItem("bg", "background-color", "background-color",style.backgroundColor));
        content.appendChild(createInputItem("border", "border", "border",style.border));
        content.appendChild(createInputItem("cl", "class", "class",element.getAttribute('class')));
        content.appendChild(createInputItem("font", "font", "font",element.getAttribute('font')));
        content.appendChild(createInputItem("margin", "margin", "margin",style.margin));
        content.appendChild(createInputItem("padding", "padding", "padding",style.padding));
        content.appendChild(createInputItem("Data Table Name", "dataset-table-name", "dataset-table-name",element.getAttribute('dataset-table-name')));
        content.appendChild(createInputItem("Data Field Name", "dataset-field-name", "dataset-field-name",element.getAttribute('dataset-field-name')));
}



function initializeEditor() {
    // Any additional initialization for the editor can go here
}

function closeModalDbStrct() {

    document.getElementById("modalDialogText").style.display = 'none';
    document.querySelector(".overlay").style.display = 'none';
    currentElement = null;
}

function updateElementText(t)
{
    
    var label= currentElement.querySelector('label');   
    label.innerText=t;
}

function updateElementValue(t)
{
    var text= currentElement.querySelector('input');   
    text.value=t; 
    
}

function updateElementTxtC(t)
{
    currentElement.textContent=t; 
    
}

function updateElementStyle(type,t)
{
   
    currentElement.style.setProperty(type,t);  
    
    
}
function updateElementOnChange(t)
{
    var text= currentElement.querySelector('input');   
    text.value=t; 
    
}

// Function to delete the selected element
function deleteSelectedElement() {
    // Find the selected element
    const selectedElement = document.querySelector('.Selection');
 
    // If an element is found and it's part of the DOM, remove it
    if (selectedElement && selectedElement.parentNode) {
        selectedElement.parentNode.removeChild(selectedElement);
    }
}

console.log("keypress init");
// Event listener for keypress on the window
window.addEventListener('keyup', function(event) {
    // Check if the pressed key is the one you want, e.g., the Delete key
    console.log(event.key);
    if (event.key === 'Delete') {
     
        deleteSelectedElement();
    }
},false);

document.addEventListener("DOMContentLoaded", initializeEditor);
