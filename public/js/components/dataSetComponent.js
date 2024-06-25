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
    var main= document.createElement('div');
    main.className = 'form-container';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;
    
    const list = document.getElementById('ContentTableList');
    const detailsDiv = document.getElementById('tableDetails');
   
    return main;
}

function editElementDataSet(type,element,content)
{
    const button = document.createElement('button');
    button.textContent = 'update';
    button.onclick = function() {
        const propertiesBar = document.getElementById('propertiesBar');
        const gridID=propertiesBar.querySelector('label').textContent;
                 
        const main = document.getElementById(gridID);  
        updateDataSet(main,content);
    };
    content.appendChild(button);
    content.appendChild(createMultiSelectItem("Data", "data", "data",element.getAttribute('data'),"text",true));
    content.appendChild(createSelectItem("Filter", "filter", "filter",element.getAttribute('filter'),"text",true));  

    // load the data
    // check if jsonData is not empty
    if (element.getAttribute('dataSet')!=null)
    {
        var target=content.querySelector('#Data');
        var jsonData=JSON.parse(element.getAttribute('dataSet'));
        jsonData.forEach(fieldJson => {
            if (fieldJson.fieldType!=="rowid") 
                addFieldToPropertiesBar(target,fieldJson);
        });
    }

}

function updateDataSet(main,content)
{
    console.log("updateDataSet");
  
    // get all the span elements from data 
    var data=content.querySelectorAll('span[name="dataContainer"]');
    if (data.length==0) return; // no data to update
    // get the first span element 
    var firstJson=JSON.parse(data[0].getAttribute("data-field"));
    // generate the json of all the data
    var jsonData=[{"tableName":firstJson.tableName,"fieldName":"rowid","fieldType":"rowid","fieldDataType":"rowid","fieldLabel":"rowid","fieldMandatory":"0","fieldWidth":"0","fieldDefaultValue":"0"}];
    data.forEach(span => {
        console.log(span.getAttribute("data-field"));
       // get the json data from the span
         var json=JSON.parse(span.getAttribute("data-field"));
        // add the field to the json
          jsonData.push(json);
    });
    main.setAttribute("dataSet",JSON.stringify(jsonData));
    renderDataSet(main);
}

function renderDataSet(main)
{
    main.innerHTML="";
    main.style.height="200px";
    console.log("renderGrid");
    // get the data from the main
    var jsonData=JSON.parse(main.getAttribute("dataSet"));
    console.log(jsonData);
    // generate the div for the dataset
    var dataset=document.createElement("div");
    dataset.id="DataSet_"+jsonData[0].tableName;
    dataset.setAttribute('data-table-name', jsonData[0].tableName);
    dataset.className = "dataSetContainer";
    var datasetFields=[];
    jsonData.forEach(fieldJson => {
        var createField=createFieldFromJson(fieldJson);
        dataset.appendChild(createField);
        datasetFields.push(fieldJson.fieldName);
    });
    dataset.setAttribute("DataSet-Fields-List",datasetFields);
    main.setAttribute("DataSet-Fields-List",datasetFields);
    main.appendChild(dataset);
    main.appendChild(createNavigationBar(jsonData[0].tableName,datasetFields));
    moveFirst(jsonData[0].tableName,datasetFields);
}

function createFieldFromJson(fieldJson)
{
    var element=null;
    switch(fieldJson.fieldType) {
        case 'character':
        case 'varchar':
        case 'text':
        case 'fixchar':
            element = createElementInput('text');
            einput=element.querySelector('input');
            break;
        case 'rowid':
            console.log("rowid");
            element = createElementInput('hidden');
            einput=element.querySelector('input');
            element.style.display="none";
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
            einput.className = "apple-switch";
            break;

        default:
            // Handle default case or unknown types
            element = createElementInput('text');
            einput=element.querySelector('input');
            break;
    }
    if (element !== undefined && element !== null) {

        element.style.maxWidth = "500px";
        
        // get label from the element
        var label=element.querySelector('label');
        // if the label exists set the text
        if (label!==null) label.textContent = fieldJson.fieldLabel==='' || fieldJson.fieldLabel==='null' ?fieldJson.fieldName:fieldJson.fieldLabel; // Set label to column name
        // set the input attributes
        einput.id=fieldJson.tableName+"_"+fieldJson.fieldName;
        einput.setAttribute('dataset-table-name', fieldJson.tableName);
        einput.setAttribute('dataset-field-name', fieldJson.fieldName);        
        einput.setAttribute('dataset-field-type', fieldJson.fieldType);
        einput.setAttribute('dataset-field-size', fieldJson.fieldSize);
        einput.setAttribute('dataset-field-mandatory', fieldJson.fieldMandatory);
        einput.setAttribute('dataset-field-format', fieldJson.fieldFormat);
        if (fieldJson.fieldMandatory)
        {
            einput.required=true;
        }
    }
    return element;
}



// --- internal functions ---
function createNavigationBar(tableName,datasetFields) {

    console.log("createNavigationBar");
    console.log(tableName);
    console.log(datasetFields);
    // Create the navigation bar div
    var navigationBar = document.createElement('div');
    navigationBar.id = 'navigationBar_'+tableName;
    navigationBar.type = 'navigation-bar';
    navigationBar.className = 'navigation-bar';
    navigationBar.setAttribute('data-table-name', tableName);
    navigationBar.setAttribute('data-current-row', '0');
    navigationBar.setAttribute('data-dataset-fields', datasetFields);
    navigationBar.innerHTML = '<div class="navigation-bar-title">record: </div>';
    // Create buttons and append them to the navigation bar
    var buttons = [
        { name:'firstDSBtn',   title: 'First',  text: '<i class="bi bi-arrow-up-circle-fill" style="color:green;margin-left:-6px"></i>', event:"moveFirst('"+tableName+"','"+datasetFields+"')" },
        { name:'PreviusDSBtn',  title: 'Previus',  text: '<i class="bi bi-arrow-left-circle-fill" style="color:green;margin-left:-6px"></i>', event: "movePrev('"+tableName+"','"+datasetFields+"')" },
        { name:'NextDSBtn',  title: 'Next',  text: '<i class="bi bi-arrow-right-circle-fill" style="color:green;margin-left:-6px"></i>', event: "moveNext('"+tableName+"','"+datasetFields+"')" },
        { name:'LastDSBtn',  title: 'Last', text: '<i class="bi bi-arrow-down-circle-fill" style="color:green;margin-left:-6px"></i>', event: "moveLast('"+tableName+"','"+datasetFields+"')" },
        { name:'EditDSBtn', title: 'Edit Record',text: '<i class="bi bi-credit-card-2-front" style="color:blue;margin-left:-6px"></i>', event: "EditRecord('"+tableName+"','"+datasetFields+"')" },
        { name:'InsertDSBtn', title: 'Insert Record', text: '<i class="bi bi-sticky-fill" style="color:green;margin-left:-6px"></i>', event: "InsertRecord('"+tableName+"','"+datasetFields+"')" },
        { name: 'SaveDSBtn', title: 'Save Record', text: '<i class="bi bi-sim-fill" style="color:red;margin-left:-6px"></i>', event: "SaveRecord('"+tableName+"')" },
        { name: 'RefreshDSBtn', title: 'Refresh Data',text: '<i class="bi bi-arrow-clockwise" style="color:green;margin-left:-6px"></i>', event: "RefreshRecord('"+tableName+"')" }
       
    ];
    var htm="";
    //for the dom2json is mandatory to create a html for the events
    buttons.forEach(buttonInfo => {
        htm+=`<button name='${buttonInfo.name}'  title="${buttonInfo.title}" onclick="${buttonInfo.event.trim()}" style="width:30px;">${buttonInfo.text}</button>`

    });
    navigationBar.innerHTML+='<div class="navigation-bar-buttons">'+htm+'</div>';
    // Append the navigation bar to the body or another element in your document
    return navigationBar;
}



function insertTable()
{
    const modal = document.getElementById('tableDetailsModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
    console.log("dbitem");
    const formContainer = document.getElementById(modal.getAttribute('data-main-id'));
    const tableName = document.getElementById('TableDetails_TableName').getAttribute('table-name');
    element = document.createElement('div');
    createFormElementsFromStructure(tableName,element);

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
        const rowNum=getRowNum(tableName);
        if (rowNum==0) return;
        navigateRecords('move-to-previous', tableName,datasetFields, rowNum-1);
    }
}

function moveNext(tableName,datasetFields) {
    
    if (tableName ) {
        navigateRecords('move-to-next', tableName,datasetFields, getRowNum(tableName)+1);
    }
}

function moveLast(tableName,datasetFields) {

    if (tableName) navigateRecords('move-to-last', tableName,datasetFields);
}

// refresh record
function RefreshRecord(tableName)
{
    if (tableName ) {
        navigateRecords('move-to-next', tableName,datasetFields, getRowNum(tableName));
    }
}

function navigateRecords(action, tableName,datasetFields, rowNum = '', filter="") {

    console.log("..............row no:", rowNum)

    if(!filter){
    const formContainer = document.getElementById("formContainer");
    var childElements = formContainer.children;
     var idObject = {};
     for (var i = 0; i < childElements.length; i++) {
         var fullId = childElements[i].id;
         var name = fullId.match(/[a-zA-Z]+/)[0]; 
         idObject[name] = fullId;
     }
     if(idObject.dataSet){
        const main = document.getElementById(idObject.dataSet);
        let filterData=main.getAttribute("filter")
        if(filterData){
            filter= filterData
        }
     }
    }
    const url = `/${action}/${tableName}` + (rowNum>=0 ? `/${rowNum}` : "")+`?fields=${datasetFields}&filter=${filter}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateInputs(data,tableName);
            rowNum=rowNum==""?0:rowNum;
            setRowNum(tableName, rowNum); // Assuming the data includes ROWID
        })
        .catch(error => console.error('Error:', error));
}

// link record to grid using this web service /get-record-by-rowid/:tableName/:rowID and update the inputs with the data
// use the fetch function to call the web service and update the inputs with the data
// use the updateInputs function to update the inputs with the data
// use the setRowID function to set the current row id in the navigation bar
async function linkRecordToGrid(tableName,rowId,rowNum) {
    try {
            // get all the datasets
    const datasets = document.querySelectorAll("#DataSet_"+tableName);    
        console.log(datasets);
    // for all the datasets check the div with name DataSet
    datasets.forEach(dataset => {
                    console.log(dataset);
                    // get table name from the dataset
                    datasetTableName=dataset.getAttribute("data-table-name");
                    // if the table name is the same as the table name of the record
                    if (datasetTableName==tableName)
                    {
                    // get the fields from the dataset
                    const datasetFields = dataset.getAttribute('dataset-fields-list');
                    console.log(datasetFields);
                
                    const url = `/get-record-by-rowid/${tableName}/${rowId}?fields=${datasetFields}`;
                    fetch(url).then(response => response.json()).then(data => {
                        updateInputs(data,tableName);
                        setRowNum(tableName,rowNum); // Assuming the data includes ROWID to-do check if the data includes ROWID
                    }).catch(error => showToast('Error:'+ error));
                }
      });
    } catch (error) {
        console.error('Error:', error);
    }
}



function updateInputs(data,tableName) {
    
    // get all the datasets
    const datasets = document.querySelectorAll("#DataSet_"+tableName);    

    // for all the datasets check the div with name DataSet
    datasets.forEach(dataset => {
       
        // get table name from the dataset
        datasetTableName=dataset.getAttribute("data-table-name");
        // if the table name is the same as the table name of the record
        if (datasetTableName==tableName)
        {
            const inputs = dataset.querySelectorAll('input');
           // console.log(inputs);
            inputs.forEach(input => {
            // console.log(input);
                const fieldLabel = input.getAttribute('dataset-field-name');
            //  console.log(fieldLabel+":"+data[0][fieldLabel]);
            input.value = '';
            input.readOnly = true;
                if (data[0][fieldLabel] !== undefined && data[0][fieldLabel] !== '')
                 {
                    input.value = data[0][fieldLabel].toString().trim();
                  
                }
               
            // disable save record button with name SaveRecordBtn
            dataset.parentElement.querySelector('[name=SaveDSBtn]').disabled = true;
            
            });
        }
    });
}


function setRowNum(tabelName,Num)
{
navbar=document.getElementById("navigationBar_"+tabelName);
navbar.setAttribute("dataset-current-row",Num);
// get the div with the name navigation-bar-title
var title=navbar.querySelector('.navigation-bar-title');
// set the text of the div with the row number
title.textContent="record: "+Num;
}

function getRowNum(tabelName)
{
navbar=document.getElementById("navigationBar_"+tabelName);
rowNum=parseInt(navbar.getAttribute("dataset-current-row"));
return rowNum;
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
            const field = inputs[i].getAttribute('dataset-field-name');
            if (field!==null && field!=='rowid') 
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
        const field = inputs[i].getAttribute('dataset-field-name');
        if (field!==null && field!=='rowid') 
        {
            
            console.log(field);
            updateFields+=`"${field}" = '${inputs[i].value}'`;
            if (i<inputs.length-1) updateFields+=',';
            inputs[i].readOnly = true;
        }
    };     
    console.log(updateFields);
    return updateFields;
}
//update record 
async function SaveRecord(tableName) {
    try {
        console.log("SaveRecord");
        // Get the next row id from the navigation bar
        const nextRowIds = document.querySelectorAll('#'+tableName+'_rowid'); 
        console.log(nextRowIds);
        nextRowIds.forEach(nextRowId => {
            // get table name from the dataset
            datasetTableName=nextRowId.getAttribute("dataset-table-name");
            // if the table name is the same as the table name of the record
                    if (datasetTableName==tableName)
                    {
                        nextRowId=nextRowId.value;
                    
                        let result;
                        if (nextRowId === 'new') {
                            // create data for insert
                            const data =  CreateInsert(tableName);

                            
                            // If nextRowId is 'new', call insertRecord
                            result =  insertRecordDB(tableName, data);
                        } else {
                            // Otherwise, call updateRecord
                            const data = {
                                body: CreateUpdated(tableName)
                            };
                    
                            result =  updateRecordDB(tableName, nextRowId, data);
                        }

                        return result;
                    }
                });
            
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
            inputs[i].readOnly = true;
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


