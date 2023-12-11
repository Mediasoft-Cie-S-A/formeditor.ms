const e = require("express");

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

    const list = document.getElementById('tablesList');
    const detailsDiv = document.getElementById('tableDetails');
    createTableList(list,detailsDiv);
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
    header.setAttribute("header","");
    //header
    datasetFields.forEach(field => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell-header';        
        cell.textContent = field!=='rowid'?field:'';
        header.appendChild(cell);
    });
    grid.appendChild(header);
    // search inputs
    var search = document.createElement('div');
    search.className = 'grid-row';  
    search.setAttribute("header","");
    datasetFields.forEach(field => {
       
   
            const cell = document.createElement('div');
            cell.className = 'grid-cell';    
            if (field!=='rowid')
            {
                input=document.createElement('input');
                input.type="text";
                input.setAttribute("dataset-field-name",field);
                // set search event on keyup
                input.addEventListener("keyup", function(event) {
                    if (event.keyCode === 13) {
                      event.preventDefault();
                      grid.setAttribute("current_page",1);
                      removeAllChildRows(grid);
                      gridFetchData(grid) ;
                    }
                  });
            }
            else    
            {
                input=document.createElement('div');
                input.textContent="";
            }
         
            
            cell.appendChild(input);    
            
            search.appendChild(cell);
        
    });
    grid.appendChild(search);


    grid.setAttribute("Dataset-Fields-Names",datasetFields);
    //set search inputs
    gridFetchData(grid) ;
 
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
        removeAllChildRows(grid);
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
        removeAllChildRows(grid);
        gridFetchData(grid) ;
   
}


//remove all rows except the row get have the header attribute  
function removeAllChildRows(grid) {
  for(var i = grid.childNodes.length - 1; i >= 0; i--) {
    if(grid.childNodes[i].getAttribute("header")===null) {
        grid.removeChild(grid.childNodes[i]);
    }
  }
}

function gridFetchData(grid) {
    
    var tableName=grid.getAttribute("Table-Name");
    var currentPage=parseInt(grid.getAttribute("current_page"));
    var pageSize=parseInt(grid.getAttribute("page_size"));
    var datasetFields=grid.getAttribute("dataset-fields-names");
  
        var currentPage=parseInt(currentPage);

        fetchTableData(grid,tableName,currentPage,pageSize,datasetFields);
    
}

function fetchTableData(grid,tableName, page, pageSize, datasetFields) {
    // Prepare the fields query parameter
    // create filter for search based on the input values, with field name and value separated by | and each filter separated by ,
    var filter="";
    var i=0;
    var fieldsList=grid.querySelectorAll('input[type="text"]')
    fieldsList.forEach(field => { 
        fieldName=field.getAttribute("dataset-field-name");
        fieldValue=field.value;
        if (fieldValue!=="")
        {
            if (i>0)
            {
                filter+=",";
            }
            filter+=fieldName+"|"+fieldValue;
            i++;
        }
        
    }); 

    
    

    // Prepare the URL

    const url = `/table-data/${tableName}/${page}/${pageSize}?fields=${datasetFields}&filter=${filter}`;

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


