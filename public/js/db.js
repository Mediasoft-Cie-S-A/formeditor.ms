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



function fetchTablesList() {
    fetch('/tables-list')
        .then(response => response.json())
        .then(tables => {
            const list = document.getElementById('tablesList');
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
}


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
*/









// table structure
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

 