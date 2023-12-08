const { compareSync } = require("bcryptjs");

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
function createDatabaseGrid(type) {
    var main= document.createElement('div');
    main.className = 'form-container';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;
    main.addEventListener('dblclick', function(){ editElement(main,type); });
    main.addEventListener('click', function(){ selectElement(main); });
    fetchTablesList();

    document.getElementById('tablesList').addEventListener('click', function(event) {
        event.preventDefault();
        if (event.target.classList.contains('table-item')) {
            const tableName = event.target.getAttribute('data-table-name');
            const tableLabel = event.target.getAttribute('data-table-label');
            fetchTableDetails(tableName,tableLabel);
        }
    },{capture: true, once: true});

    showModalDbStrc(main);
    return main;
}

function editDatabaseGrid(type,element,content)
{
   

}


function insertGrid()
{
    const modal = document.getElementById('tableDetailsModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
    const tableName = document.getElementById('TableDetails_TableName').innerText;
    const gridContainer = document.getElementById(modal.getAttribute("data-main-id"));
    gridContainer.innerHTML=`<div id="Data-Grid" style="height: 400px; overflow-y: auto;" ></div><div><button onclick='gridPrev(event)'><</button><button onclick='gridNext(event)'>></button></div>`;
    fieldsList=document.querySelectorAll('#tableDetails table input:checked')
    var datasetFields=[];
    datasetFields.push('rowid');
    fieldsList.forEach(field => { 
        fieldName=field.getAttribute("dataset-field-name");
        datasetFields.push(fieldName);       
    });

    createGrid(gridContainer,tableName,datasetFields);
    
}

//Grid code
function createGrid(gridContainer,tableName,datasetFields)
{
   const grid = gridContainer.querySelector('#Data-Grid');
    //header
    grid.setAttribute("dataset-table-name",tableName);
    grid.setAttribute("current_page",1);
    grid.setAttribute("page_size",10);
    grid.setAttribute("Table-Name",tableName);
   

    var header = document.createElement('div');
    header.className = 'grid-row';   
    datasetFields.forEach(field => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell-header';        
        cell.textContent = field!=='rowid'?field:'';
        header.appendChild(cell);
    });
    grid.appendChild(header);
    grid.setAttribute("Dataset-Fields-Names",datasetFields);
    gridFetchData(grid) ;
    // Infinite scrolling logic
 
}

function gridPrev(e) {
    e.preventDefault();
    const grid = document.getElementById('Data-Grid');
    var currentPage=parseInt(grid.getAttribute("current_page"));
  
    if (currentPage>0)
    {
        currentPage--;
        console.log("......" + currentPage);
        grid.setAttribute("current_page",currentPage);
        removeAllChildNodes(grid);
        gridFetchData(grid) ;
    }
}

function gridNext(e) {
    e.preventDefault();
    const grid = document.getElementById('Data-Grid');
    console.log(grid);
    var currentPage=parseInt(grid.getAttribute("current_page"));
   
   
        currentPage++;
        grid.setAttribute("current_page",currentPage);
        removeAllChildNodes(grid);
        gridFetchData(grid) ;
   
}

function removeAllChildNodes(parent) {
    while (parent.lastChild && parent.lastChild !== parent.firstChild) {
        parent.removeChild(parent.lastChild);
    }
}

function gridFetchData(grid) {
    
    var tableName=grid.getAttribute("Table-Name");
    var currentPage=parseInt(grid.getAttribute("current_page"));
    var pageSize=parseInt(grid.getAttribute("page_size"));
    var datasetFields=grid.getAttribute("dataset-fields-names");
  
        var currentPage=parseInt(currentPage);
        currentPage++;
        
        fetchTableData(grid,tableName,currentPage,pageSize,datasetFields);
   
      
    
}

function fetchTableData(grid,tableName, page, pageSize, datasetFields) {
    // Prepare the fields query parameter
   

    console.log(tableName);
    console.log(page);
    console.log(pageSize);
    // Prepare the URL
    const url = `/table-data/${tableName}/${page}/${pageSize}?fields=${datasetFields}`;

    // Fetch the data from the web service
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // The data is now available
            data.forEach(row => {
               // console.log(Object.values(row));
                var rowDiv = document.createElement('div');
                rowDiv.className = 'grid-row';
                rowDiv.setAttribute("rowid",row.rowid);
                var i=0;
                Object.values(row).forEach(field => {
                    
                     const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    
                    rowDiv.appendChild(cell);
                    if (i==0 )
                    {
                     const input=document.createElement('input');
                      input.type="hidden";
                        input.value=field;
                        cell.appendChild(input);  
                    } else{
                        cell.textContent = field;
                    }
                    i++;
                });
                grid.appendChild(rowDiv);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}