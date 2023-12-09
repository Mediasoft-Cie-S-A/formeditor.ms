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


// The 'DOMContentLoaded' event fires when the initial HTML document has been completely loaded and parsed,
// without waiting for stylesheets, images, and subframes to finish loading.
// The function passed as the second argument will be executed once the 'DOMContentLoaded' event is fired.



function fetchTablesList(list) {
    fetch('/tables-list')
        .then(response => response.json())
        .then(tables => {
            
            list.innerHTML = '';
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
function createTableList(list,tableDetails) {
    fetchTablesList(list);
    
   list.addEventListener('click', function(event) {
        event.preventDefault();
        if (event.target.classList.contains('table-item')) {
            const tableName = event.target.getAttribute('data-table-name');
            const tableLabel = event.target.getAttribute('data-table-label');
            fetchTableDetails(tableName,tableLabel,tableDetails);
        }
    },{capture: true, once: true});

}   

function createEditableTableList(list,tableDetails) {
    fetchTablesList(list);
    
   list.addEventListener('click', function(event) {
        event.preventDefault();
        if (event.target.classList.contains('table-item')) {
            const tableName = event.target.getAttribute('data-table-name');
            const tableLabel = event.target.getAttribute('data-table-label');
            editTableDetails(tableName,tableLabel,tableDetails);
        }
    },{capture: true, once: true});

}   





// table structure
function fetchTableDetails(tableName,tableLabel,detailsDiv) {
    removeAllChildNodes(detailsDiv);
    Promise.all([
        fetch(`/table-fields/${tableName}`).then(response => response.json())        
    ])
    .then(([fields]) => {
      
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


// table structure
async function editTableDetails(tableName, tableLabel, detailsDiv) {
    // Remove all child nodes
    removeAllChildNodes(detailsDiv);

    try {
        // Fetch table fields
        const response = await fetch(`/table-fields/${tableName}`);
        const fields = await response.json();
        // Set innerHTML
        detailsDiv.innerHTML = `<h2 id='TableDetails_TableName' table-name='${tableName}'>${tableName}</h2><h3>${tableLabel}</h3>`;
        detailsDiv.style.padding = '10px';
        // Create and append table
        const table = document.createElement('table');
        detailsDiv.appendChild(table);
        const header=['NAME','TYPE','LABEL' ,'FORMAT','MANDATORY', 'DECIMAL', 'WIDTH'];
        var tr = document.createElement('tr');
        header.forEach(prop => {
            const td = document.createElement('td');
            td.innerText =prop  ;
            tr.appendChild(td);
        });
        table.appendChild(tr);
        // Add fields to table
        fields.forEach(field => {
            const tr = document.createElement('tr');
           header.forEach(prop => {
                const td = document.createElement('td');
                td.innerHTML =`<input name='${prop}' value='${field[prop]}'/>`  ;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
       
        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.onclick = function() {
            addTableDetails(tableName, tableLabel, detailsDiv);
        };
        detailsDiv.appendChild(addButton);
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.onclick = function() {
            saveTableDetails(tableName, tableLabel, detailsDiv);
        };  
        detailsDiv.appendChild(saveButton); 

    } catch (error) {
        console.error('Error:', error);
    }
}


// table structure
/*

function editTableDetails(tableName,tableLabel,detailsDiv) {
    removeAllChildNodes(detailsDiv);
    Promise.all([
        fetch(`/table-fields/${tableName}`).then(response => response.json())        
    ])
    .then(([fields]) => {
      
        detailsDiv.innerHTML = `<h2 id='TableDetails_TableName' table-name='${tableName}'>${tableName}</h2><h3>${tableLabel}</h3>`;
        
        // Display fields
        const table=  document.createElement('table');
        const tr = document.createElement('tr');
            const td0 = document.createElement('td');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            const fieldItem = document.createElement('div');                
            fieldItem.innerText = `Field Name`;            
            td0.appendChild(fieldItem);
            td1.innerHTML=`<div>TYPE</div>`;
            td2.innerHTML=`<div>FORMAT</div>`;
            td3.innerHTML=`<div>LABEL</div>`;         
            tr.appendChild(td0);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            table.appendChild(tr);
        fields.forEach(field => {
            const tr = document.createElement('tr');
            const td0 = document.createElement('td');
            const td1 = document.createElement('td');
            const td2 = document.createElement('td');
            const td3 = document.createElement('td');
            const fieldItem = document.createElement('input');                
            fieldItem.value = `${field.NAME}`;            
            fieldItem.setAttribute("dataset-field-name",field.NAME);
            td0.appendChild(fieldItem);
            td1.innerHTML=`<input value="${field.TYPE}" />`;
            td2.innerHTML=`<input value="${field.FORMAT}" />`;
            td3.innerHTML=`<input value="${field.LABEL}" />`;         
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
*/