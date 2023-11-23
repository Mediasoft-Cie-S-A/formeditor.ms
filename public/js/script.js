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

currentElement=null;

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    
    event.preventDefault();
    var elementId = event.dataTransfer.getData("text");
            var newElement = createFormElement(elementId);
            
            if (newElement) {
                event.target.appendChild(newElement);
            }
     
}


function createFormElement(elementId) {
    var element = null;
    console.log(elementId);
    switch(elementId) {
        case 'textfield':
            element = createInputElement('text');
            break;
        case 'password':
            element = createInputElement('password');
            break;
        case 'number':
            element = createInputElement('number');
            break;
        case 'textarea':
            element = createInputElement('textarea');
            break;
        case 'checkbox':
            element = createInputElement('checkbox');
            break;
        case 'select':
            element = createSelectElement('select');
            // Add options to select element here
            break;
        case 'radio':
            element = createInputElement('radio');
            break;
        case 'button':
            element = document.createElement('button');
            element.textContent = 'Button';
            element.addEventListener('dblclick', function(){ editElement(element); });
            element.addEventListener('click', function(){ selectElement(element); });
            break;
        case 'container':
            element = document.createElement('div');
            element.className="Container";
            var htm='<div   onclick="selectElement(this)" class="half-width Container"></div>'
            element.innerHTML=  htm + '<div   onclick="selectElement(this)" class="half-width Container"></div>'
          
            break;
        case 'datetime':
            element = createInputElement('datetime-local');
            break;
        case 'dbitem':
               console.log("dbitem");
                element = document.createElement('div');

                createFormElementsFromStructure('PUB.Item',element);
        break;
    }

    if (element) {
        element.className = 'form-element';
        element.draggable = true;
        element.ondragstart = drag;
    }

    return element;
}

function selectElement(element)
{ 
    var elements  = document.getElementsByClassName("Selection");
    for(i=0;i<elements.length;i++)
    {
        elements[i].classList.remove("Selection");
     
    }
    currentElement=element; 
    element.classList.add("Selection");
 }

function createInputElement(type) {
    var main= document.createElement('div');
    main.className = 'form-container';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;
    main.addEventListener('dblclick', function(){ editElement(main); });
    main.addEventListener('click', function(){ selectElement(main); });
    var label=document.createElement('label');  
    label.innerHTML=type;    
    main.appendChild(label);   
    var input = document.createElement('input');
    input.type = type;
    main.appendChild(input)
    return main;
}

function createSelectElement(type) {
    var main= document.createElement('div');
    main.className = 'form-container';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;
    main.addEventListener('dblclick', function(){ editElement(main); });
    main.addEventListener('click', function(){ selectElement(main); });
    var label=document.createElement('label');  
    label.innerHTML="Text";
    
    main.appendChild(label);
   
    var input = document.createElement('select');
    input.type = type;
    main.appendChild(input)
    return main;
}

// Initialize draggable elements
document.querySelectorAll('.draggable').forEach(function(item) {
    item.addEventListener('dragstart', drag);
});



