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

const e = require("express");


function createElementDateSet(type) {
    var main= document.createElement('div');
    main.className = 'form-container';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;
    
    const list = document.getElementById('tablesList');
    const detailsDiv = document.getElementById('tableDetails');
    createTableList(list,detailsDiv);
    showModalDbStrc(main,type);
    return main;
}

function editElementDataSet(type,element,content)
{
}

// --- internal functions ---
function createNavigationBar(tableName,datasetFields) {
    // Create the navigation bar div
    var navigationBar = document.createElement('div');
    navigationBar.id = 'navigationBar';
    navigationBar.type = 'navigation-bar';
    navigationBar.setAttribute('data-table-name', tableName);
    navigationBar.setAttribute('data-current-row', '0');

    // Create buttons and append them to the navigation bar
    var buttons = [
        { id: 'firstRecordBtn', text: '<i class="bi bi-arrow-up-circle-fill"></i>', event:"moveFirst('"+tableName+"','"+datasetFields+"')" },
        { id: 'previousRecordBtn', text: '<i class="bi bi-arrow-left-circle-fill"></i>', event: "movePrev('"+tableName+"','"+datasetFields+"')" },
        { id: 'nextRecordBtn', text: '<i class="bi bi-arrow-right-circle-fill"></i>', event: "moveNext('"+tableName+"','"+datasetFields+"')" },
        { id: 'lastRecordBtn', text: '<i class="bi bi-arrow-down-square-fill"></i>', event: "moveLast('"+tableName+"','"+datasetFields+"')" },
        { id: 'EditRecordBtn', text: '<i class="bi bi-credit-card-2-front"></i>', event: "EditRecord('"+tableName+"','"+datasetFields+"')" },
        { id: 'InsertRecordBtn', text: '<i class="bi bi-sticky-fill"></i>', event: "InsertRecord('"+tableName+"','"+datasetFields+"')" },
        { id: 'SaveRecordBtn', text: '<i class="bi bi-sim-fill"></i>', event: "SaveRecord('"+tableName+"')" },
        { id: 'RefreshBtn', text: '<i class="bi bi-sim-fill"></i>', event: "RefreshRecord('"+tableName+"')" }
       
    ];

    //for the dom2json is mandatory to create a html for the events
    buttons.forEach(buttonInfo => {
        const htm='<button id="'+buttonInfo.id+'" onclick="'+buttonInfo.event.trim()+'">'+buttonInfo.text+"</button>";

        navigationBar.innerHTML+=htm;
    });
    
    // Append the navigation bar to the body or another element in your document
    return navigationBar;
}

async function createFormElementsFromStructure(tableName,container) {
    try {
                    const dataset=document.createElement("div");
                    dataset.id="DataSet_"+tableName;
                
                    fieldsList=document.querySelectorAll('#tableDetails table tr')
                    var datasetFields=['rowid'];
                    var datasetFieldsTypes=['rowid'];
                    const input=document.createElement('input');
                            input.setAttribute('dataset-table-name', tableName);
                            input.setAttribute('dataset-field-name', 'rowid');
                            input.id="dataset-rowid";
                            input.type='hidden';
                            dataset.appendChild(input); 
                        //  console.log(fieldsList);
                    fieldsList.forEach(trline => { 
                        field=trline.querySelector('input:checked');
                        isSelect=trline.querySelector('select[name="inputType"]')
                        inputType=isSelect.options[isSelect.selectedIndex].text;
                        if (field)
                        {
                                    fieldName=field.getAttribute("dataset-field-name");
                                    fieldType=field.getAttribute("dataset-field-type");
                                    datasetFields.push(fieldName);
                                    datasetFieldsTypes.push(fieldType);
                                    //console.log(field.getAttribute("dataset-field-type"));
                                    var element=null;
                                    switch(fieldType) {
                                        case 'character':
                                        case 'varchar':
                                        case 'text':
                                        case 'fixchar':
                                            // Get the select value 
                                           
                                                // get option value from the select
                                               switch( inputType)
                                               {
                                                case "input":
                                                    element = createElementInput('text');
                                                     einput=element.querySelector('input');
                                                break;
                                                case "select":
                                                    element = createElementSelect('select');
                                                    einput=element.querySelector('select');
                                                break;
                                                case "checkbox":
                                                    element = createElementInput('checkbox');
                                                    einput=element.querySelector('input');
                                                    break; 
                                               }
                                           
                                            break;
                                        case 'INT':
                                        case 'integer':
                                        case 'bigint':
                                        case 'float':
                                        case 'double':
                                        case 'decimal':
                                            element = createElementInput('number');
                                            einput=element.querySelector('input');
                                            break;
                                        case 'date':
                                        case 'datetime':
                                            element = createElementInput('date');
                                            einput=element.querySelector('input');
                                            break;
                                        case 'time':
                                            element = createElementInput('time');
                                            einput=element.querySelector('input');
                                            break;
                                        case 'boolean':
                                        case 'bool':
                                        case 'bit':
                                            element = createElementInput('checkbox');
                                            einput=element.querySelector('input');
                                            break;
                                        
                                        default:
                                            // Handle default case or unknown types
                                            element = createElementInput('text');
                                            einput=element.querySelector('input');
                                            break;
                                    }
                                    
                                console.log(element);
                                
                                    if (element !== undefined && element !== null) {
                                        element.querySelector('label').textContent = fieldName; // Set label to column name
                                        
                                        
                                        einput.setAttribute('dataset-table-name', tableName);
                                        einput.setAttribute('dataset-field-name', fieldName);
                                        einput.id=tableName+"_"+fieldName;
                                        einput.setAttribute('dataset-field-type', field.getAttribute("dataset-field-type"));
                                        einput.setAttribute('dataset-field-size', field.getAttribute("dataset-field-size"));
                                        einput.setAttribute('dataset-field-mandatory', field.getAttribute("dataset-field-mandatory"));
                                        einput.setAttribute('dataset-field-format', field.getAttribute("dataset-field-format"));

                                        if (field.MANDATORY)
                                        {
                                            einput.required=true;
                                        }

                                    }
                                //console.log(element);
                                    
                                dataset.appendChild(element); // Append to the desired container
                                }
                    });

                    dataset.appendChild(createNavigationBar(tableName,datasetFields));
                    dataset.setAttribute("DataSet-Fields-List",datasetFields);
                    dataset.setAttribute("DataSet-Fields-Types",datasetFieldsTypes);
                    console.log(dataset);
                    container.appendChild(dataset);
            } catch (error) {
                    console.error('Error:', error);
            }
}


function insertTable()
{
    const modal = document.getElementById('tableDetailsModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
    console.log("dbitem");
    const formContainer = document.getElementById(modal.getAttribute('data-main-id'));
    const tableName = document.getElementById('TableDetails_TableName');
    element = document.createElement('div');
    createFormElementsFromStructure(tableName.innerText,element);

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

// refresh record
function RefreshRecord(tableName)
{
    if (tableName ) {
        navigateRecords('move-to-next', tableName,datasetFields, parseInt(getRowID()));
    }
}

function navigateRecords(action, tableName,datasetFields, rowId = '') {
    const url = `/${action}/${tableName}` + (rowId ? `/${rowId}` : '')+`?fields=${datasetFields}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateInputs(data,tableName);
            rowId=rowId==""?0:rowId;
            setRowID(rowId); // Assuming the data includes ROWID
        })
        .catch(error => console.error('Error:', error));
}

// link record to grid using this web service /get-record-by-rowid/:tableName/:rowID and update the inputs with the data
// use the fetch function to call the web service and update the inputs with the data
// use the updateInputs function to update the inputs with the data
// use the setRowID function to set the current row id in the navigation bar
async function linkRecordToGrid(tableName,datasetFields, rowId) {
    try {
        const url = `/get-record-by-rowid/${tableName}/${rowId}?fields=${datasetFields}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateInputs(data,tableName);
        setRowID(0); // Assuming the data includes ROWID to-do check if the data includes ROWID
    } catch (error) {
        console.error('Error:', error);
    }
}



function updateInputs(data,tableName) {
    
    const inputs = document.querySelectorAll(`#DataSet_${tableName} input`);
    console.log(inputs);
    inputs.forEach(input => {
       // console.log(input);
        const fieldLabel = input.getAttribute('dataset-field-name');
      //  console.log(fieldLabel+":"+data[0][fieldLabel]);
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
    const inputs = document.querySelectorAll(`#DataSet_${tableName} input`);
   
    inputs.forEach(input => {
        const tableLabel = input.getAttribute('dataset-table-name');
        console.log(tableLabel);
        if (tableLabel == tableName) {           
            input.readOnly = false;
        }
    });     

    document.getElementById("SaveRecordBtn").disabled = false;
}

function InsertRecord(tableName)
{
    const inputs = document.querySelectorAll(`#DataSet_${tableName} input`);
   
    inputs.forEach(input => {
        const tableLabel = input.getAttribute('dataset-table-name');
        if (tableLabel == tableName) {           
            input.readOnly = false;
            if (input.type==='hidden')
            {
                input.value="new";
            }
            else{
                input.value="";
            }
        }

    });     

    document.getElementById("SaveRecordBtn").disabled = false;
}

function CreateUpdated(tableName)
{
    const inputs = document.querySelectorAll(`#DataSet_${tableName} input`);
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
        const nextRowId = document.querySelector('#dataset-rowid').value; 
        console.log(nextRowId);

      
        let result;
        if (nextRowId === 'new') {
            // create data for insert
            const data =  CreateInsert(tableName);

            
            // If nextRowId is 'new', call insertRecord
            result = await insertRecordDB(tableName, data);
        } else {
            // Otherwise, call updateRecord
            const data = {
                body: CreateUpdated(tableName)
            };
    
            result = await updateRecordDB(tableName, nextRowId, data);
        }

        return result;
    } catch (error) {
        showToast('Error:'+ error);
    }
}

// create insert data structure
function CreateInsert(tableName)
{

   // create data for insert following this structure  `INSERT INTO ${tableName} (${data.fields}) VALUES (${data.values})`;
   // return data with data.fields and data.values
    const inputs = document.querySelectorAll(`#DataSet_${tableName} input`);
    var insertFields="";
    var insertValues="";
    for (i=0;i<inputs.length;i++)
    {
        if (inputs[i].type!='hidden') 
        {
            const field = inputs[i].getAttribute('dataset-field-name');
            insertFields+=`"${field}"`;
            insertValues+=`'${inputs[i].value}'`;
            if (i<inputs.length-1) 
            {
                insertFields+=',';
                insertValues+=',';
            }
        }
    };

    return {fields:insertFields,values:insertValues};

}

async function updateRecordDB(tableName, nextRowId, updateData) {
    try {
        const response = await fetch(`/update-record/${tableName}/${nextRowId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            showToast(`HTTP error! status: ${response.status}`);
        }
        const updateResult = await response.json();
        showToast('Record updated successfully', 5000); // Show toast for 5 seconds
        return updateResult;
    } catch (error) {
        showToast('Error:'+ error);
    }
}


async function insertRecordDB(tableName, data) {
    try {
        const response = await fetch(`/insert-record/${tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include other headers as needed, like authentication tokens
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            showToast(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Record inserted successfully:', result);
        showToast('Record inserted successfully', 5000); // Show toast for 5 seconds
        return result;
    } catch (error) {
        showToast('Error inserting record:'+error);
    }
}


function closeModalEdit() {
    const modal = document.getElementById('modalDialogText');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
}