
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

    const list = document.getElementById('ContentTableList');
    const detailsDiv = document.getElementById('tableDetails');
    fetchTablesList(list,detailsDiv,"");
    showModalDbStrc(main,type);
    return main;
}

function editDatabaseGrid(type,element,content)
{
  /*  // create attribute to store the datasetid
     // generate the list of options
     var DataSetID = document.createElement('div');
     // generate a label for the list
     var label=document.createElement('label');
     label.innerHTML="DataSetID";
     DataSetID.appendChild(label);
     // generate a textarea for the list
     var input=document.createElement('input');
     input.id=element.id+"inputDatasetId";
     // locate Data-Grid
        var grid=element.querySelector('#Data-Grid');
        if (grid)
        {
            input.value=grid.getAttribute("datasetid");
        }
     
     // adding to the textarea onchage event to update the options
     input.onchange=function(){
        grid.setAttribute("datasetid",input.value);
    };
    
     DataSetID.appendChild(input);
     content.appendChild(DataSetID);
     */
}


function insertGrid()
{
    // get fields list
    fieldsList=document.querySelectorAll('#tableDetails table input:checked')
    var datasetFields=[];
    var datasetFieldsTypes=[];
    datasetFields.push('rowid');
    fieldsList.forEach(field => { 
        fieldName=field.getAttribute("dataset-field-name");
        fieldType=field.getAttribute("dataset-field-type");
        datasetFields.push(fieldName);   
        datasetFieldsTypes.push(fieldType);    
    });

    const modal = document.getElementById('tableDetailsModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
    const tableName = document.getElementById('TableDetails_TableName').innerText;
    const gridContainer = document.getElementById(modal.getAttribute("data-main-id"));
    gridContainer.innerHTML="";
    gridContainer.style.padding="10px";
    gridContainer.style.display="flex";
    gridContainer.style.flexDirection="column";
    gridContainer.style.justifyContent="space-between";
    gridContainer.style.width="100%";
    gridContainer.style.height="100%";
    gridContainer.style.alignItems="flex-start";
    gridContainer.style.overflow="auto";

    
    
      // search header
      var search = document.createElement('div');
      search.style="display:flex;flex-direction:row;justify-content:space-between;width:50%;align-items:right;float:right; padding: 10px;";      
      gridContainer.appendChild(search);
      var searchfields=document.createElement('select');
      searchfields.setAttribute("id","searchfields");
      search.appendChild(searchfields);
      for (var i=0;i<datasetFields.length;i++)
       {       
              field=datasetFields[i];
              const cell = document.createElement('option');
              
              if (field!=='rowid')
              {
                  cell.textContent = field;
                  cell.value=field;
              }
              searchfields.appendChild(cell);
      }
      searchOperator=document.createElement('select');
      searchOperator.setAttribute("id","searchOperator");
      search.appendChild(searchOperator);
      const operators=["like","eq","gt","lt","gte","lte"];
      for (var i=0;i<operators.length;i++)
          {
              const cell = document.createElement('option');
              cell.textContent = operators[i];
              cell.value=operators[i];
              searchOperator.appendChild(cell);
          }
      var  input=document.createElement('input');
          input.type="text";
          input.setAttribute("id","searchValue");
          // set search event on keyup
          input.addEventListener("keyup", function(event) {
              if (event.keyCode === 13) {
                      event.preventDefault();
                      grid.setAttribute("current_page",1);
                      removeAllChildRows(grid);
                      gridFetchData(grid) ;
              }
          });
          search.appendChild(input);
  
    var html=`<table id="DataGrid_${tableName}" style="min-height: 400px; overflow-y: auto; vertical-align: top;"></table>`;
    html+=`<div style='display:flex;flex-direction:row;width:50%;align-items:right;float:right; padding: 10px;'>`;
    html+=`<span>Page Size:</span><select onchange='grid_page_size(event,"${tableName}")' style='width:80px'>`;
    html+=`<option value='10'>10</option>`;
    html+=`<option value='20'>20</option>`;
    html+=`<option value='50'>50</option>`;
    html+=`<option value='100'>100</option>`;
    html+=`</select>`;
    // record count
    html+=`<div style='padding: 10px;'>Record Count:<span id="recordCount_${tableName}">0</span></div>`;
    html+=`<button title='Previus'  onclick='gridPrev(event,"${tableName}")'><i class="bi bi-arrow-left-circle-fill"  style='color:blue;'></i></button>`;
    html+=`<button title='Next' onclick='gridNext(event,"${tableName}")'><i class="bi bi-arrow-right-circle-fill"  style='color:blue;'></i></button>`;
    html+=`<button  title='Refresh' onclick='refresh(event,"${tableName}")'><i class="bi bi-arrow-repeat"  style='color:green;'></i></button>`;
    html+=`<button  title='Postit' onclick='postit(event,"${tableName}")'><i class="bi bi-card-text" style='color:#aa0;'></i></button>`;
    html+=`<button  title='Export Data' onclick='export2CSV(event,"${tableName}")'><i class="bi bi-file-spreadsheet" style='color:green;'></i></button></div>`;
    html+=`<div id="Data-Grid-Postit" style="display:none;position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0.5); z-index: 1000;"></div>`;    
    html+="</div>";
    gridContainer.innerHTML+=html;
    

    createGrid(gridContainer,tableName,datasetFields,datasetFieldsTypes);
    
}

//Grid code
function createGrid(gridContainer,tableName,datasetFields,datasetFieldsTypes)
{
    console.log(gridContainer.id + " " + tableName + " " + datasetFields + " " + datasetFieldsTypes);
   const grid = gridContainer.querySelector('#DataGrid_'+tableName);
   console.log(grid);
    //header
    grid.setAttribute("dataset-table-name",tableName);
    grid.setAttribute("current_page",1);
    grid.setAttribute("page_size",10);
    grid.setAttribute("Table-Name",tableName);
   
    // table header
    var header = document.createElement('thead');
    header.className = 'grid-row';
  
    // header


    var row = document.createElement('tr');
    row.className = 'grid-row';

    datasetFields.forEach(field => {
        if (field!=='rowid')
            {
                const cell = document.createElement('td');
                cell.className = 'grid-cell-header';        
                cell.textContent = field!=='rowid'?field:'';
                row.appendChild(cell);
            }
            else
            {
                const cell = document.createElement('td');
                cell.style.width = '1px';
                cell.className = '';        
                cell.textContent = '';
                row.appendChild(cell);
            }
    });
    header.appendChild(row);
    grid.appendChild(header);
    // search inputs
   
    grid.setAttribute("Dataset-Fields-Names",datasetFields);
    grid.setAttribute("Dataset-Fields-Types",datasetFieldsTypes);
    const body = document.createElement('tbody');
    body.className = 'grid-body';
    grid.appendChild(body);
    //set search inputs
    gridFetchData(grid) ; 
}

function grid_page_size(e,tableName) {
    e.preventDefault();
    // get parent grid n
}

function gridPrev(e,tableName) {
    e.preventDefault();
    // get parent grid n
    const grid=e.target.parentElement.parentElement.parentElement.querySelector('table');
    const gtableName=grid.getAttribute("table-name"); 

    if (tableName==gtableName)
    {             
        var currentPage=parseInt(grid.getAttribute("current_page"));
        if (currentPage>1)
        {
            currentPage--;
        }
      
        grid.setAttribute("current_page",currentPage);
        removeAllChildRows(grid);
        gridFetchData(grid) ;
    }
}

function gridNext(e,tableName) {
    e.preventDefault();
    // get parent grid n
    const grid=e.target.parentElement.parentElement.parentElement.querySelector('table');
    console.log(grid);
    const gtableName=grid.getAttribute("table-name"); 
    console.log(tableName + " " + gtableName);
    if (tableName==gtableName)
    {             
        var currentPage=parseInt(grid.getAttribute("current_page"));
        currentPage++;
        grid.setAttribute("current_page",currentPage);
        removeAllChildRows(grid);
        gridFetchData(grid) ;
    }
}

function searchGrid(filter){
    const grid = document.getElementById('Data-Grid');
    grid.setAttribute("current_page",1);
    var tableName=grid.getAttribute("Table-Name");
    var datasetFields=grid.getAttribute("Dataset-Fields-Names");
    var datasetFieldsTypes=grid.getAttribute("Dataset-Fields-Types");
    removeAllChildRows(grid);
    gridGetData(grid,tableName,1,10,datasetFields,datasetFieldsTypes,filter );

}

// export grid to csv
function export2CSV(e,tabelName) {
    e.preventDefault();
    const grid = document.getElementById('Data-Grid_'+tabelName);
    var tableName=grid.getAttribute("Table-Name");
    var datasetFields=grid.getAttribute("Dataset-Fields-Names");
    // call the export service
    const url = `/export-table/${tableName}?fields=${datasetFields}`;
    window.open(url, '_blank');
}


//remove all rows except the row get have the header attribute  
function removeAllChildRows(grid) {
    // get body form the table
    const body = grid.querySelector('tbody');
  //remove all rows in the body
    while (body.firstChild) {
        body.removeChild(body.firstChild);
    }
}

function gridFetchData(grid,body) {
    
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
    var filtervalue=grid.querySelectorAll('input[id^="searchValue"]')
    var searchfields=grid.querySelectorAll('select[id^="searchfields"]')
    var searchOperator=grid.querySelectorAll('select[id^="searchOperator"]')
    if (filtervalue.length>0)
    {
        filter=filtervalue[0].value;
        filter+="|";
        filter+=searchfields[0].value;
        filter+="|";
        filter+=searchOperator[0].value;
    }

    
    gridGetData(grid,tableName,page,pageSize,datasetFields,filter );
    

}

// get the filter type based on the field type
function getFilterType(fieldType)
{
    switch (fieldType) {
        case "string":
            return "like";
        case "number":
            return "eq";
        case "date":
            return "eq";
        default:
            return "like";
    }
}

async function gridGetData(grid,tableName,page,pageSize,datasetFields,filter)
{    
    //get body form the table
    const body = grid.querySelector('tbody');
    // Prepare the URL
    const url = `/table-data/${tableName}/${page}/${pageSize}?fields=${datasetFields}&filter=${filter}`;
    // Fetch the data from the web service
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // The data is now available
        for (var j = 0; data.length; j++) {
            const row = data[j];
            // console.log(Object.values(row));
            var rowDiv = document.createElement('tr');
            if (j % 2 == 0)
              rowDiv.style.backgroundColor = "#f2f2f2";
            else
                rowDiv.style.backgroundColor = "#ffffff";
            rowDiv.className = 'grid-row';
            rowDiv.setAttribute("rowid", row.rowid);
            // add click event to row to call linkRecordToGrid(tableName, rowId)
            rowDiv.addEventListener("click", function (event) {
                event.preventDefault();
                // find div in dataset 
                const datasetDivs = document.querySelectorAll('#DataSet_' + tableName);
                // get the datasetFieldsLink
                datasetDivs.forEach(datasetDiv => {
                    const datasetFieldsLink = datasetDiv.getAttribute("Dataset-Fields-List");
                    console.log(datasetFieldsLink + " " + row.rowid + " " + j + page * pageSize);
                    linkRecordToGrid(tableName, datasetFieldsLink, row.rowid, j + page * pageSize);
                });

            });
            var i = 0;
            Object.values(row).forEach(field => {

                const cell = document.createElement('td');
                cell.className = 'grid-cell';

                rowDiv.appendChild(cell);
                // skip rowid field
                if (i > 0) {
                    cell.textContent = field;
                }
                i++;
            });
            body.appendChild(rowDiv);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

