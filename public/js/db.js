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


async function fetchTableStructure(tableName) {
    try {
        var response = await fetch(`/table-structure/${tableName}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}

function createNavigationBar(tableName) {
    // Create the navigation bar div
    var navigationBar = document.createElement('div');
    navigationBar.id = 'navigationBar';
    navigationBar.setAttribute('data-table-name', tableName);
    navigationBar.setAttribute('data-current-row', '0');

    // Create buttons and append them to the navigation bar
    var buttons = [
        { id: 'firstRecordBtn', text: 'F', event:"moveFirst('"+tableName+"')" },
        { id: 'previousRecordBtn', text: '<', event: "movePrev('"+tableName+"')" },
        { id: 'nextRecordBtn', text: '>', event: "moveNext('"+tableName+"')" },
        { id: 'lastRecordBtn', text: 'L', event: "moveLast('"+tableName+"')" },
        { id: 'EditRecordBtn', text: 'E', event: "EditRecord('"+tableName+"')" },
        { id: 'SaveRecordBtn', text: 'S', event: "UpdateRecord('"+tableName+"')" }
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
    dataset.appendChild(createNavigationBar(tableName));
    fieldsList=document.querySelectorAll('#tableDetails table input:checked')
    console.log(fieldsList);
    fieldsList.forEach(field => { 
        fieldName=field.getAttribute("dataset-field-name");
        console.log(fieldName);
        console.log(structure);
        column=structure.find(({ name }) => name === fieldName);;
        
        console.log(column);
        console.log(">>"+column.dataTypeName);
        const type = mapColumnTypeToInputType(column.dataTypeName); // Map the column type to input type
        switch(type) {
            case 'text':
            case 'password':
            case 'numeric':
            case 'checkbox':
            case 'radio':
            case 'datetime-local':
                element = createInputElement(type);
                break;
            case 'textarea':
                element = createInputElement('textarea');
                break;
            case 'select':
                element = createSelectElement('select');
                // Add options to select element here
                break;
            default:
                // Handle default case or unknown types
                element = createInputElement('text');
        }
    
        if (element) {
            element.querySelector('label').textContent = column.name; // Set label to column name
            const input=element.querySelector('input');
            input.setAttribute('dataset-table-name', tableName);
            input.setAttribute('dataset-field-name', column.name);

        }
        
       dataset.appendChild(element); // Append to the desired container
    });

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


// database structure
document.addEventListener('DOMContentLoaded', function() {
    fetchTablesList();

    document.getElementById('tablesList').addEventListener('click', function(event) {
        event.preventDefault();
        if (event.target.classList.contains('table-item')) {
            const tableName = event.target.getAttribute('data-table-name');
            const tableLabel = event.target.getAttribute('data-table-label');
            fetchTableDetails(tableName,tableLabel);
        }
    },{capture: true, once: true});
});

function fetchTablesList() {
    fetch('/tables-list')
        .then(response => response.json())
        .then(tables => {
            const list = document.getElementById('tablesList');
            tables.forEach(table => {
                const listItem = document.createElement('div');
                listItem.classList.add('table-item');
                listItem.textContent = table.NAME; // Adjust based on your API response
                listItem.setAttribute('data-table-name', table.NAME);
                listItem.setAttribute('data-table-label', table.LABEL);

                list.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error:', error));
}
/*
function fetchTableDetailsOld(tableName,tableLabel) {
    Promise.all([
        fetch(`/table-fields/${tableName}`).then(response => response.json()),
        fetch(`/table-indexes/${tableName}`).then(response => response.json())
    ])
    .then(([fields, indexes]) => {
        const detailsDiv = document.getElementById('tableDetails');
        detailsDiv.innerHTML = `<h2 id='TableDetails_TableName'>${tableName}</h2><h3>${tableLabel}</h3>`;
        
        // Display fields
        const fieldsList = document.createElement('ul');
        fields.forEach(field => {
            const fieldItem = document.createElement('li');
            fieldItem.textContent = `${field.NAME} - ${field.TYPE} - ${field.LABEL}`;
            fieldsList.appendChild(fieldItem);
        });
        detailsDiv.appendChild(fieldsList);

        // Display indexes
        const indexesList = document.createElement('ul');
        indexes.forEach(index => {
            const indexItem = document.createElement('li');
            indexItem.textContent = index.NAME; // Adjust based on your API response
            indexesList.appendChild(indexItem);
        });
        detailsDiv.appendChild(indexesList);
    })
    .catch(error => console.error('Error:', error));
}*/


document.addEventListener('DOMContentLoaded', function() {
    fetchTablesList();

    document.getElementById('tablesList').addEventListener('click', function(event) {
        if (event.target.classList.contains('table-item')) {
            event.preventDefault();
            const tableName = event.target.getAttribute('data-table-name');
            fetchTableDetails(tableName);
            showModalDbStrc();
        }
    }, {capture: true, once: true});
});

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


function closeModalEdit() {
    const modal = document.getElementById('modalDialogText');
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
function insertGrid()
{
    const modal = document.getElementById('tableDetailsModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
    const tableName = document.getElementById('TableDetails_TableName');
    formContainer.innerHTML=`<div id="dataGrid" style="height: 400px; overflow-y: auto;" dataset-table-name="${tableName}"></div>`;
    createGrid(tableName.innerText,1,10);
    
}


function fetchTableDetails(tableName,tableLabel) {
    Promise.all([
        fetch(`/table-fields/${tableName}`).then(response => response.json())        
    ])
    .then(([fields]) => {
        const detailsDiv = document.getElementById('tableDetails');
        detailsDiv.innerHTML = `<h2 id='TableDetails_TableName' table-name='${tableName}'>${tableName}</h2><h3>${tableLabel}</h3>`;
        
        // Display fields
        const table=  document.createElement('table');
                
        fields.forEach(field => {
            const tr = document.createElement('tr');
            const td0 = document.createElement('td');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            const fieldItem = document.createElement('input');                
            fieldItem.value = `${field.NAME}`;
            fieldItem.setAttribute("type", "checkbox");
            fieldItem.checked=true;
            fieldItem.setAttribute("dataset-field-name",field.NAME);
            td0.appendChild(fieldItem);
            td1.innerHTML=`${field.NAME}`;
            td2.innerHTML=`${field.TYPE}`;
            td3.innerHTML=`${field.LABEL}`;         
            tr.appendChild(td0);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            table.appendChild(tr);
        });
        detailsDiv.appendChild(table);       
    })
    .catch(error => console.error('Error:', error));
}

 




//Grid code
function createGrid(tableName)
{
    const grid = document.getElementById('dataGrid');
    //header
    grid.setAttribute("current_page",1);
    grid.setAttribute("page_size",10);
    grid.setAttribute("Table-Name",tableName);
    const fields=document.querySelectorAll("#tableDetails li");
    var header = document.createElement('div');
    header.className = 'grid-row';   
    fields.forEach(field => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell-header';        
        cell.textContent = field.getAttribute('dataset-field-name');
        header.appendChild(cell);
    });
    grid.appendChild(header);
    gridFetchData(grid,1) ;
    // Infinite scrolling logic
    grid.addEventListener('scroll', () => {
        console.log("scroll");
        if (this.scrollTop + this.clientHeight >= this.scrollHeight) {

            var currentPage=parseInt(this.getAttribute("current_page"));
            currentPage++;
            console.log(currentPage);
            gridFetchData(currentPage);
        }
    });
}

