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


function createElementDateSet(type) {
    console.log("createElementDateSet");
    showModalDbStrc();
    return null;
}

function editElementDataSet(type,element,content)
{
  alert("editElementDataSet");
}

// --- internal functions ---
function createNavigationBar(tableName,datasetFields) {
    // Create the navigation bar div
    var navigationBar = document.createElement('div');
    navigationBar.id = 'navigationBar';
    navigationBar.setAttribute('data-table-name', tableName);
    navigationBar.setAttribute('data-current-row', '0');

    // Create buttons and append them to the navigation bar
    var buttons = [
        { id: 'firstRecordBtn', text: 'F', event:"moveFirst('"+tableName+"','"+datasetFields+"')" },
        { id: 'previousRecordBtn', text: '<', event: "movePrev('"+tableName+"','"+datasetFields+"')" },
        { id: 'nextRecordBtn', text: '>', event: "moveNext('"+tableName+"','"+datasetFields+"')" },
        { id: 'lastRecordBtn', text: 'L', event: "moveLast('"+tableName+"','"+datasetFields+"')" },
        { id: 'EditRecordBtn', text: 'E', event: "EditRecord('"+tableName+"','"+datasetFields+"')" },
        { id: 'SaveRecordBtn', text: 'S', event: "SaveRecord('"+tableName+"')" }
    ];

    //for the dom2json is mandatory to create a html for the events
    buttons.forEach(buttonInfo => {
        const htm='<button id="'+buttonInfo.id+'" onclick="'+buttonInfo.event.trim()+'">'+buttonInfo.text+"</button>";

        navigationBar.innerHTML+=htm;
    });
    
    // Append the navigation bar to the body or another element in your document
    return navigationBar;
}

async function createFormElementsFromStructure(tableName,formContainer) {
    var structure = await fetchTableStructure(tableName);
   
    const dataset=document.createElement("div");
    dataset.id="DataSet";
   
    fieldsList=document.querySelectorAll('#tableDetails table input:checked')
    var datasetFields=['rowid'];
    const input=document.createElement('input');
            input.setAttribute('dataset-table-name', tableName);
            input.setAttribute('dataset-field-name', 'rowid');
            input.id="dataset-rowid";
            input.type='hidden';
            dataset.appendChild(input); 
    fieldsList.forEach(field => { 
        fieldName=field.getAttribute("dataset-field-name");
        datasetFields.push(fieldName);       
        column=structure.find(({ name }) => name === fieldName);;
   
        const type = mapColumnTypeToInputType(column.dataTypeName); // Map the column type to input type
        switch(type) {
            case 'text':
            case 'password':
            case 'numeric':
            case 'checkbox':
            case 'radio':
            case 'datetime-local':
                element = createElementInput(type);
                break;
            case 'textarea':
                element = createElementInput('textarea');
                break;
            case 'select':
                element = createSelectElement('select');
                // Add options to select element here
                break;
            default:
                // Handle default case or unknown types
                element = createElementInput('text');
        }
    
        if (element) {
            element.querySelector('label').textContent = column.name; // Set label to column name
            const input=element.querySelector('input');
            input.setAttribute('dataset-table-name', tableName);
            input.setAttribute('dataset-field-name', column.name);

        }
        
       dataset.appendChild(element); // Append to the desired container
    });
    dataset.appendChild(createNavigationBar(tableName,datasetFields));
    dataset.setAttribute("DataSet-Fields-List",datasetFields);
    formContainer.innerHTML="";
    formContainer.appendChild(dataset);
}



function mapColumnTypeToInputType(columnType) {
    // Map your database column types to appropriate input types
    // This is a basic example, adjust according to your database schema
 
    switch(columnType) {
        case 'SQL_NUMERIC':
        case 'SQL_VARCHAR':
            return 'text';
        case 'SQL_INTEGER':
                return 'number';
        case 'date':
        case 'datetime':
            return 'datetime-local';
        // Add more mappings as needed
        default:
            return 'text';
    }
}


function showModalDbStrc() {
    console.log("show");
    const modal = document.getElementById('tableDetailsModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'block';
    overl.style.display = 'block';
}

function closeModalDbStrct() {
    const modal = document.getElementById('tableDetailsModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
}

function insertTable()
{
    const modal = document.getElementById('tableDetailsModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
    console.log("dbitem");

    const tableName = document.getElementById('TableDetails_TableName');
    element = document.createElement('div');
    createFormElementsFromStructure('PUB.'+tableName.innerText,element);
    const formContainer = document.getElementById('formContainer');
    formContainer.appendChild(element);
}

//--- data set navigation ---


function moveFirst(tableName,datasetFields) {
        
    if (tableName)
    {
      navigateRecords('move-to-first', tableName,datasetFields);
    }
}

function movePrev(tableName,datasetFields) {
  
    if (tableName ) {
        navigateRecords('move-to-previous', tableName,datasetFields, parseInt(getRowID())-1);
    }
}

function moveNext(tableName,datasetFields) {
    
    if (tableName ) {
        navigateRecords('move-to-next', tableName,datasetFields, parseInt(getRowID())+1);
    }
}

function moveLast(tableName,datasetFields) {

    if (tableName) navigateRecords('move-to-last', tableName,datasetFields);
}

function navigateRecords(action, tableName,datasetFields, rowId = '') {
    const url = `/${action}/${tableName}` + (rowId ? `/${rowId}` : '')+`?fields=${datasetFields}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateInputs(data);
            rowId=rowId==""?0:rowId;
            setRowID(rowId); // Assuming the data includes ROWID
        })
        .catch(error => console.error('Error:', error));
}

function updateInputs(data) {
    const inputs = document.querySelectorAll('#DataSet input');
   // console.log(data[0]);
    inputs.forEach(input => {
       // console.log(input);
        const fieldLabel = input.getAttribute('dataset-field-name');
        console.log(fieldLabel+":"+data[0][fieldLabel]);
        if (data[0][fieldLabel] !== undefined) {
            input.value = data[0][fieldLabel];
            input.readOnly = true;
        }
    });
    // disable save record button
    document.getElementById("SaveRecordBtn").disabled = true;
}


function setRowID(id)
{
navbar=document.getElementById("navigationBar");
navbar.setAttribute("dataset-current-row",id);
}

function getRowID()
{
navbar=document.getElementById("navigationBar");
return navbar.getAttribute("dataset-current-row");
}

function EditRecord(tableName)
{
    const inputs = document.querySelectorAll('#DataSet input');
   
    inputs.forEach(input => {
        const tableLabel = input.getAttribute('dataset-table-name');
        console.log(tableLabel);
        if (tableLabel == tableName) {           
            input.readOnly = false;
        }
    });     

    document.getElementById("SaveRecordBtn").disabled = false;
}

function CreateUpdated(tableName)
{
    const inputs = document.querySelectorAll('#DataSet input');
   var updateFields="";
   for (i=0;i<inputs.length;i++)
    {
        if (inputs[i].type!='hidden') 
        {
            const field = inputs[i].getAttribute('dataset-field-name');
            console.log(field);
            updateFields+=`"${field}" = '${inputs[i].value}'`;
            if (i<inputs.length-1) updateFields+=',';
        }
    };     
    console.log(updateFields);
    return updateFields;
}
//update record 
async function SaveRecord(tableName) {
    try {
        const nextRowId=document.querySelector('#dataset-rowid').value; 
         console.log(nextRowId);
        const updateData= {
                            body: CreateUpdated(tableName)
        };
        // Update the next record
        response = await fetch(`/update-record/${tableName}/${nextRowId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updateResult = await response.json();

        return updateResult;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to fetch and display data
function gridFetchData(dataGrid,page,datasetFields) {
    var pageSize=dataGrid.getAttribute("page_size");
    var tableName=dataGrid.getAttribute("Table-Name");
    fetch(`/table-data/${tableName}/${page}/${pageSize}?fields=${datasetFields}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(row => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'grid-row';
                // Assuming 'row' is an object with keys corresponding to column names
                for (const key in row) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    
                    if (key=='rowid')
                    {
                        const input=document.createElement('input');
                        input.type='hidden';
                        input.value=row[key];
                        cell.appendChild(input);
                    }
                    else
                    {
                    cell.textContent = row[key];
                    }
                    rowDiv.appendChild(cell);
                }
                dataGrid.appendChild(rowDiv);
            });
        })
        .catch(error => console.error('Error:', error));
}
