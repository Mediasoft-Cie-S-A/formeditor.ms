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


function createInputItem(id, label, styleProperty,text,type) {
    console.log(text);
    var div = document.createElement("div");
    var lbl = document.createElement("label");
    lbl.setAttribute("for", id);
    lbl.textContent = label;

    var input = document.createElement("input");
    input.type = type;
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
    // Get the type of the element
     // if type is null get the element type
    var type = element.getAttribute('tagName');

        currentElement=element
        var dialog= document.getElementById("propertiesBar");        
 
        var content= dialog.querySelector("div");
        removeAllChildNodes(content);
        // Execute the function editor if exists type   
        console.log("type:"+elementsData[type]);
        if (elementsData[type]){
            if (elementsData[type].editFunction) {
                var functionName = elementsData[type].editFunction;
                console.log("functionName:"+functionName);
                window[functionName](type,element,content);
            
            }
        }
        const label = document.createElement('label');
        label.textContent = element.id;
        content.appendChild(label);
        content.appendChild(document.createElement('hr'));
        const style = element.style;
        content.appendChild(createInputDiv("label", "Text:", updateElementText,element.innerText));
        content.appendChild(createInputDiv("text", "Value:", updateElementValue,element.value));
        content.appendChild(createInputItem("vs", "visibility", "visibility",style.visibility,"text"));
        content.appendChild(createInputItem("chk", "checked", "checked",element.getAttribute('checked'),"text"));

        content.appendChild(createInputItem("wd", "width", "width",style.width,"text"));
        content.appendChild(createInputItem("hg", "height", "height",style.height,"text"));
        content.appendChild(createInputItem("cl", "color", "color",style.color,"color"));
        content.appendChild(createInputItem("bg", "background-color", "background-color",style.backgroundColor,"color"));
        content.appendChild(createInputItem("border", "border", "border",style.border,"text"));
        content.appendChild(createInputItem("cl", "class", "class",element.getAttribute('class') ,"text"));
        content.appendChild(createInputItem("font", "font", "font",element.getAttribute('font') ,"text"));
        content.appendChild(createInputItem("margin", "margin", "margin",style.margin),"text");
        content.appendChild(createInputItem("padding", "padding", "padding",style.padding),"text");
        content.appendChild(createInputItem("html", "html", "html",element.innerHTML),"text");
        content.appendChild(createInputItem("Data Table Name", "dataset-table-name", "dataset-table-name",element.getAttribute('dataset-table-name'),'text'));
        content.appendChild(createInputItem("Data Field Name", "dataset-field-name", "dataset-field-name",element.getAttribute('dataset-field-name'),'text'));
        content.appendChild(createInputItem("change", "onChange", "onchange",element.getAttribute('onchange')),"text");
        content.appendChild(createInputItem("click", "onClick", "onclick",element.getAttribute('onclick')),"text");

        content.appendChild(createInputItem("dblclick", "Double Click", "dblclick",element.getAttribute('dblclick')),"text");

}



function closeModalDbStrct() {

    document.getElementById("modalDialogText").style.display = 'none';
    document.querySelector(".overlay").style.display = 'none';
    currentElement = null;
}

function updateElementText(t)
{
    
    var label= currentElement;   
    label.innerText=t;
}

function updateElementValue(t)
{
    var text= currentElement;   
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
   // console.log(event.key);
    if (event.key === 'Delete') {
     
        deleteSelectedElement();
    }
},false);


// editor properties on hover, click, double click

// get the formContainer id
var formContainer = document.getElementById('formContainer');
// add event listener to the formContainer of on hover and show the context menu editorFloatMenu
// in the position where the mouse is over and aligned to right for the sub elements
formContainer.addEventListener('click', function(event) {
    event.preventDefault();
    // remove gjs-selection class from all elements
    removeSelection();
    console.log("event.target.id:"+event.target.id);    
    if (event.target.id === 'formContainer') {       
        
        hideEditMenu();
        }
    //get the offset of formContainer
    const { top, left } = getAbsoluteOffset(formContainer);
    var editorElementSelected = event.target;
    editorElementSelected.classList.add("gjs-selection");
    const inputElementSelected=document.getElementById("editorElementSelected");
    inputElementSelected.value=editorElementSelected.id;
    var editorFloatMenu = document.getElementById('editorFloatMenu');
    editorFloatMenu.style.display = 'block';
    // Get the total offset by combining formContainer's and element's offset
    console.log("formContainer.offsetTop:"+formContainer.offsetTop);
    var totalOffsetTop = top + editorElementSelected.offsetTop -25;
    var totalOffsetLeft = top+ editorElementSelected.offsetLeft + editorElementSelected.offsetWidth;

    editorFloatMenu.style.top = totalOffsetTop + 'px';
    editorFloatMenu.style.left = totalOffsetLeft + 'px';
    
});


function getAbsoluteOffset(element) {
    let top = 0, left = 0;
    while(element) {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    }
    return { top, left };
}

// showproperties of the element
function showProperties()
{
    const inputElementSelected=document.getElementById("editorElementSelected");
    console.log("inputElementSelected.value:"+inputElementSelected.value);
    var editorElementSelected=document.getElementById(inputElementSelected.value);

    editElement(editorElementSelected);
}

function deleteElement()
{
    const inputElementSelected=document.getElementById("editorElementSelected");
    var editorElementSelected=document.getElementById(inputElementSelected.value);
    editorElementSelected.parentNode.removeChild(editorElementSelected);
    hideEditMenu();
}

function hideEditMenu()
{
    var editorFloatMenu = document.getElementById('editorFloatMenu');
    editorFloatMenu.style.display = 'none';
}

function removeSelection()
{
    var elements  = document.getElementsByClassName("gjs-selection");
    for(i=0;i<elements.length;i++)
    {
        elements[i].classList.remove("gjs-selection");
     
    }
}   