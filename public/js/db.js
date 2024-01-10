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

const header=['NAME','TYPE','LABEL' ,'FORMAT','MANDATORY', 'DECIMAL', 'WIDTH', 'DEFAULT'];



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
             // add new table button
      
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
        table.style.padding='10px';

        detailsDiv.appendChild(table);
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
                td.innerHTML =`<input name='${prop}' value='${field[prop]}' readonly/>`  ;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
       
        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.className   = 'button';
        addButton.onclick     = function(event) {
            event.preventDefault();
            addTableColumn(table);
        };

       
        detailsDiv.appendChild(addButton);
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        addButton.className    = 'button';
        saveButton.onclick     = function(event) {
            event.preventDefault();
            saveAlterTable(table,tableName);
        };  
        detailsDiv.appendChild(saveButton); 

    } catch (error) {
        console.error('Error:', error);
    }
}

function getColumnData(type,newColumn) {
   var columnData='';
    switch (type) {
        case 'DECIMAL':
        case 'NUMERIC':
            columnData = `${newColumn.TYPE}(${newColumn.WIDTH}, ${newColumn.DECIMAL})`;
            break;
        case 'CHAR':
        case 'VARCHAR':
            columnData = `${newColumn.TYPE}(${newColumn.WIDTH})`;
            break;
        case 'INTEGER':
        case 'TIME':
        case 'TIMESTAMP':
        case 'DOUBLE':
        case 'FLOAT':
        case 'REAL':
        case 'SMALLINT':
        case 'BIGINT':
        case 'BIT':                
        case 'DATE':
            columnData = newColumn.TYPE;
            break;
        // Add more cases as needed
        default:
            throw new Error(`Unsupported type: ${newColumn.TYPE}`);
    }
    if (columnData.MANDATORY === '1') {
        columnData += ' NOT NULL';
    }   
    if (columnData.DEFAULT) {
        columnData += ` DEFAULT ${columnData.DEFAULT}`;
    }
    return columnData;
}

async function saveAlterTable(table,tabelName) {
    // Prepare the data
  
    const newColumns =table.querySelectorAll('tr[new]');
    // for each row get the input with property new
    newColumns.forEach(row => {
        const newInput = row.querySelectorAll('input[new], select[new]');
        console.log('newInput:', newInput);
        if (newInput) {
            const newColumn = {};       
            newInput.forEach(input => {
                newColumn[input.name] = input.value;
                console.log('input:', input.name);
            });
           
            // create the correct type example char(10 ) using the type and width
         
             var columnData=getColumnData(newColumn.TYPE,newColumn);
            
            console.log('newColumn:', newColumn.NAME);
            console.log('columnData:', columnData);
            // adding mandatory and default value if exists 
         
            // call the alter table function
           alterTable(tabelName, 'add', newColumn.NAME, columnData, null, null);
        }
    }
    );


    // adding in array all the elements in order to call altertable function, the column name and type are mandatory
   
    
}


function addTableColumn(table) {
    const tr = document.createElement('tr');
    tr.setAttribute('new', '');
    header.forEach(prop => {
        const td = document.createElement('td');
        td.style.padding = '0 2px';
        switch (prop) {
            case 'TYPE':
                var _select= `<select class="input-element" new name='${prop}'>`;
                    _select+=`<option value="INTEGER">INTEGER</option>`;
                    _select+=`<option value="CHAR">CHAR</option>`;
                    _select+=`<option value="VARCHAR">VARCHAR</option>`;
                    _select+=`<option value="DATE">DATE</option>`;
                    _select+=`<option value="DECIMAL">DECIMAL</option>`;
                    _select+=`<option value="NUMERIC">NUMERIC</option>`;
                    _select+=`<option value="TIME">TIME</option>`;
                    _select+=`<option value="TIMESTAMP">TIMESTAMP</option>`;
                    _select+=`<option value="DOUBLE">DOUBLE</option>`;
                    _select+=`<option value="FLOAT">FLOAT</option>`;
                    _select+=`<option value="REAL">REAL</option>`;
                    _select+=`<option value="SMALLINT">SMALLINT</option>`;
                    _select+=`<option value="BIGINT">BIGINT</option>`;
                    _select+=`<option value="BIT">BIT</option>`;    
                td.innerHTML = _select;
                break
            case 'MANDATORY':
            case 'DECIMAL':
            case 'WIDTH':
            td.innerHTML = `<input class="input-element" type='number' new name='${prop}' value='0'/>`;
            break;
            case 'NAME':
                td.innerHTML = `<input class="input-element" new name='${prop}' value=''/ placeholder='Field Name' required>`;
                break;
            default:
            td.innerHTML = `<input class="input-element" new name='${prop}' value=''/>`;
                
    
        }
        tr.appendChild(td);
    });
    table.appendChild(tr);
}

async function alterTable(tableName, action, columnName, columnType, newColumnName, newColumnType) {
    try {

        const response = await fetch(`/alter-table/${tableName}`, {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action,
                columnName,
                columnType,
                newColumnName,
                newColumnType
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        showToast('Table altered successfully');
        console.log('Table altered successfully:', result);
    } catch (error) {
        console.error('Error altering table:', error);
    }
}

function  newTable() {
    const detailsDiv = document.getElementById('mtableDetails');
    removeAllChildNodes(detailsDiv);
    // label and input for table name
    const tableNameLabel = document.createElement('label');
    tableNameLabel.textContent = 'Table Name';
    detailsDiv.appendChild(tableNameLabel);
    const tableNameInput = document.createElement('input');
    tableNameInput.setAttribute('type', 'text');
    tableNameInput.setAttribute('id', 'NewtableName');
    tableNameInput.setAttribute('name', 'tableName');
    tableNameInput.setAttribute('placeholder', 'Table Name');
    tableNameInput.setAttribute('required', '');
    tableNameInput.className = 'input-element';
    detailsDiv.appendChild(tableNameInput);
    
    // generate html table
    const table = document.createElement('table');
    table.style.padding='10px';
    table.style.marginTop='10px';
    detailsDiv.appendChild(table);

    // header
    const tr = document.createElement('tr');
    table.appendChild(tr);
    header.forEach(prop => {
        const td = document.createElement('td');
        td.innerText =prop  ;
        tr.appendChild(td);
    });

    const buttonContainer = document.createElement('div');
    buttonContainer.className   = 'button-container';

    // button to add row    
    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.className   = 'button';
    addButton.onclick = function(event) {
        event.preventDefault();
        addTableColumn(table);
    };  
    buttonContainer.appendChild(addButton);
    // button to save table
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className    = 'button';
    saveButton.onclick = function(event) {
        event.preventDefault();
        createTable(table);
    }; 
    // append all elements
    buttonContainer.appendChild(saveButton);

    detailsDiv.appendChild(buttonContainer);
}

async function createTable(table) {
    // get tablename form input
    const tableName = document.getElementById('NewtableName').value;
    console.log('tableName:', tableName);
    if (!tableName) {
        showToast('Table name is required');
        return;
    }
    // Prepare the data
    const newColumns = table.querySelectorAll('tr[new]');
    const columns = Array.from(newColumns).map(row => {
        const newInputs = row.querySelectorAll('input[new], select[new]');
        const newColumn = {};
        newInputs.forEach(input => {
            newColumn[input.name] = input.value;
        });
        return newColumn;
    });

    /* organise the columns data following the structure below:
    
            CREATE TABLE SPORTS.Customer
                (
                cust_no INTEGER NOT NULL,
                last_name CHAR (30),
                street CHAR (30),
                city CHAR (20),
                state CHAR (2)
                ) ; 
     */
    const columnsData = columns.map(column => {
         
        return `${column.NAME} ${getColumnData(column.TYPE,column)}` ;
    }
    );
    // post the data to the backend `/create-table/${tableName}` post body.columns
    console.log('columnsData:', columnsData);
    if (columnsData.length === 0) {
        showToast('Table must have at least one column');
        return;
    }   
    postCreateTable(tableName, columnsData);
       
}

async function postCreateTable(tableName, columns) {
    
    try {
        const response = await fetch(`/create-table/${tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Include other headers as needed, like authentication tokens
            },
            body: JSON.stringify({ columns })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        console.log('Table created successfully:', result);
        showToast('Table created successfully');
    } catch (error) {
        console.error('Error creating table:', error);
    }
}



