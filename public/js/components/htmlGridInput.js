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

// Define the IDs for the grid images with their dimensions
const gridDataStruct = {
    "12": "1,11",
    "21": "11,1",
    "33": "3,3,6",
    "63": "6,3,3",
    "36": "3,6,3",
    "111": "1,1,10",
    "222": "2,2,8",
    "333": "3,3,6",
    "444": "4,4,4",
    "555": "5,5,2",
    "666": "6,6",
    "777": "7,5",
    "888": "8,4",
    "999": "9,3",
    "1010": "10,2",
    "1111": "11,1",
    "1212": "12"    
   
};

function createGridElement(type, id) {
    console.log("creategrid:" + type);
    var main = document.createElement('div');
    main.className = 'form-container row display-flex';
    main.id = type + Date.now(); // Unique ID for each new element
    main.tagName = type;

    processGridId(id, main);
}

/** Loop through selected grid layout's id and generate elements accordingly **/
async function processGridId(id, parent) {
    // get dimensions from id
    const dimensions = gridDataStruct[id].split(',').map(Number);
    console.log('dimensions', dimensions);
    for (let i = 0; i < dimensions.length; i++) {
        var child = document.createElement('div');
        child.className = `col-md-${dimensions[i]} col-sm-12 grid-element`;
        child.id = parent.id + "GridElement-" + i;
        child.tagName = "gridelement";
        parent.appendChild(child);
    }

    document.getElementById("formContainer").appendChild(parent);
}

function createSingleDiv(id) {
    // Extract dimensions from id (e.g., "2,10")
    const [colMd, colSm] = id.split(',').map(Number);

    // Validate dimensions
    if (isNaN(colMd) || isNaN(colSm)) {
        console.error("Invalid dimensions for single div:", id);
        return;
    }

    // Create single div
    const singleDiv = document.createElement('div');
    singleDiv.className = `col-md-${colMd} col-sm-${colSm} single-grid-element`;
    singleDiv.id = `SingleDiv-${colMd}-${colSm}-${Date.now()}`;
    singleDiv.textContent = `Single Div (${colMd}, ${colSm})`;

    // Append to form container
    const formContainer = document.getElementById("formContainer");
    if (formContainer) {
        formContainer.appendChild(singleDiv);
    } else {
        console.error("Form container not found.");
    }
}

function editGridElement(type, element, content) {
    // Create and append the elements
}

function insertHtmlGrid(event) {
    console.log('event', event.target.id);

    const modal = document.getElementById('htmlGridModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';

    createGridElement('grid', event.target.id);
}

function drawGridImage(dimensions) {
    const parts = dimensions.split(',').map(Number);

    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 20; // Only one row
    const ctx = canvas.getContext('2d');

    // Draw grid parts
    const totalParts = parts.reduce((a, b) => a + b, 0);
    let currentX = 0;

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    parts.forEach(part => {
        const partWidth = (canvas.width * part) / totalParts;
        ctx.strokeRect(currentX, 0, partWidth, canvas.height);
        currentX += partWidth;
    });

    return canvas.toDataURL();
}
function showHtmlGridModal(main) {
    var modal = document.getElementById('htmlGridModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'htmlGridModal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.zIndex = '1000000';
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#fff';
        modal.style.border = '1px solid #000';
        modal.style.padding = '20px';
        modal.style.borderRadius = '10px';
        modal.style.flexDirection = 'column';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        modal.style.width = '550px';
        modal.style.height = '250px';
        modal.style.borderTop = '5px solid #007bff';
        modal.style.borderBottom = '5px solid #007bff'; 
       document.body.appendChild(modal);
    }
    
    
    // Generate modal content dynamically in a loop
    let  modalContent ='<div id="htmlGridOptions" class="row"><div  style="width:500px;padding:10px;magin:10px;flex-direction: row;" >';

    Object.entries(gridDataStruct).forEach(([id, dimensions]) => {
        const imgSrc = drawGridImage(dimensions);
        modalContent += `      
          <div class="col-md-4 col-sm-12">    
            <a href="#" onclick="insertHtmlGrid(event)">
              <img src="${imgSrc}" id="${id}" alt="${dimensions}"  title="Grid : ${dimensions}"/>
            </a>
            </div>
        `;
    });

    modalContent += '</div></div>';
    // add space between the grid and the close button
    modalContent += '<div class="row" style="height:50px;"></div>';
    modalContent += '<div class="row"><button class="button float-right"  onclick="closeHtmlGridModal()">Close</button></div>';
  
    modal.innerHTML = modalContent;
    modal.setAttribute('data-main-id', main.id);
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'flex';
    overl.style.display = 'block';
}

function closeHtmlGridModal() {
    const modal = document.getElementById('htmlGridModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
}