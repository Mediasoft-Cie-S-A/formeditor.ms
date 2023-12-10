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


var currentElement=null;
var elementsData=[];
// create the sidebar menu
// Load the JSON data


loadJson('/elementsConfig')
    .then(data => {
        elementsData = data;
        createSidebar(elementsData);
    })
    .catch(err => {
        console.error(err);
    });

// js script
    function loadScriptIfNotLoaded(scriptUrl,scriptslist) {
        // Check if the script is already loaded
     
       
        // The script is not loaded, check if it exists and load it
        try {
           return fetch(scriptUrl)
            .then(response => {
                if (response.ok) {
                    // The script exists, load it
                    var script = document.createElement('script');
                    script.src = scriptUrl;
                    
                    document.body.appendChild(script);
                    scriptslist.push(scriptUrl);
                } else {
                    console.log('Script not found: ' + scriptUrl);
                }
            });
        }catch(err) {
            console.log('Script not found: ' + scriptUrl);
        }
    }
// Create the sidebar
function createSidebar(elementsData) {
    const sidebar = document.getElementById('componentsSidebar');
    const categories = {};
    var scriptslist = [];

    // Group elements by category
    for (const elementId in elementsData) {
        const elementData = elementsData[elementId];
        if (!categories[elementData.category]) {
            categories[elementData.category] = [];
        }
        categories[elementData.category].push(elementData);
    }

    // Create sidebar items
    for (const category in categories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        const button = document.createElement('button');
        button.textContent = category;
        button.className = 'category-button';
        button.addEventListener('click', function() {
            const categoryDiv = this.parentElement;
            const height = categoryDiv.style.height;
            console.log(height);
            if (height === "55px") {
                categoryDiv.style.height = 'auto';
            } else {
                categoryDiv.style.height = '55px';
            }
        });
        categoryDiv.appendChild(button);
        
        const elements = categories[category];
       
                for (const elementData of elements) {
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'component-item draggable';
                    itemDiv.draggable = true;
                    itemDiv.textContent = elementData.description;
                    itemDiv.id = elementData.type;
                    itemDiv.addEventListener('dragstart', drag);
                    categoryDiv.appendChild(itemDiv);

                    // Check if the script exists
                    // Check if the script exists
                    // Use the function
                    var scriptUrl = "/js/components/" + elementData.scriptName;
                  //  scriptslist.forEach(script => console.log(script));
                    var existingScript = scriptslist.find(script => script === scriptUrl);
                  
                               
                    if (!existingScript) {
                        console.log("scriptUrl:"+scriptUrl);
                        loadScriptIfNotLoaded(scriptUrl)
                        .catch(error => {
                            console.log('Error loading script:', error);
                        });
                    scriptslist.push(scriptUrl); }
                
                   
                }
             sidebar.appendChild(categoryDiv);          
                

        
    }
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
 
    event.dataTransfer.setData("text", event.target.id);
}

function drop(event) {
    
    event.preventDefault();

    var elementId = event.dataTransfer.getData("text");
    console.log("elementId:"+elementId);
            var newElement = createFormElement(elementId);
            
            if (newElement) {
                event.target.appendChild(newElement);
            }
     
}

// Assuming you're in a browser environment
async function loadJson(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}




function createFormElement(elementId) {
    var element = null;

        console.log(elementId);
        
        console.log(elementsData[elementId]);
         // Execute the function
         var functionName = elementsData[elementId].createFunction;
        console.log("functionName:"+functionName);
         if (typeof window[functionName] === 'function') {
            console.log("functionName:"+functionName);
            element= window[functionName](elementId);
         }
      
         if (element) {
            element.setAttribute("tagName",elementId);
            element.className = 'form-element';
            element.draggable = true;
            element.ondragstart = drag;
        }
    return element;
}





// editor properties on hover, click, double click

// get the formContainer id
var formContainer = document.getElementById('formContainer');
// add event listener to the formContainer of on hover and show the context menu editorFloatMenu
// in the position where the mouse is over and aligned to right for the sub elements
formContainer.addEventListener('click', function(event) {
    event.preventDefault();
    // remove gjs-selection class from all elements
    var elements  = document.getElementsByClassName("gjs-selection");
    for(i=0;i<elements.length;i++)
    {
        elements[i].classList.remove("gjs-selection");
     
    }
    console.log("event.target.id:"+event.target.id);    
    if (event.target.id === 'formContainer') {       
        
        var editorFloatMenu = document.getElementById('editorFloatMenu');
        editorFloatMenu.style.display = 'none';
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
    var editorElementSelected=document.getElementById(inputElementSelected.value);
    editElement(editorElementSelected);
}