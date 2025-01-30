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

var tableList=[];
// The 'DOMContentLoaded' event fires when the initial HTML document has been completely loaded and parsed,
// without waiting for stylesheets, images, and subframes to finish loading.
// The function passed as the second argument will be executed once the 'DOMContentLoaded' event is fired.


// this function is used to get the table list from the server
// it will be used to create the table list
// is called when the page is loaded and when the user click on the table list
function fetchTablesList(list,tableDetailsDiv) {

    // sychronous call to get the table list
    const request = new XMLHttpRequest();
    request.open("GET", '/tables-list', false); // `false` makes the request synchronous



    request.send();
    
    if (request.status === 200) {
        const dbs = JSON.parse(request.responseText);
            // Clear the list
            
            list.innerHTML = '';
             // add new table button
             for(key in dbs)
             {
                
                const dbname = key;
                tables=dbs[key];
                tableList=[];
                var i=0;
                tables.forEach(table => {
                
                            const listItem = document.createElement('div');
                            if (i%2==0) 
                            {
                                listItem.style.backgroundColor='#e6e6e6';
                            }
                            listItem.classList.add('grid-row');
                            listItem.classList.add('table-item');
                            listItem.textContent = table.NAME; // Adjust based on your API response
                            listItem.setAttribute('database-name', dbname);
                            listItem.setAttribute('data-table-name', table.NAME);
                            listItem.setAttribute('data-table-label', table.LABEL);
                            listItem.setAttribute('title', table.LABEL);
                            listItem.onclick = function(event) {
                                    event.preventDefault();
                                        const tableName = event.target.getAttribute('data-table-name');
                                        const tableLabel = event.target.getAttribute('data-table-label');
                                        fetchTableDetails(dbname,tableName,tableLabel,tableDetailsDiv);
                            }
                            list.appendChild(listItem);
                            tableList.push(table.NAME);
                            i++;
                    
                             });
            }
       
}
}

function createTableList(list,tableDetails) {
   
    fetchTablesList(list);    
   
}   


// called when you change the tab to create a new table
function createEditableTableList(list,tableDetails) {
    fetchTablesList(list);
    
   list.addEventListener('click', function(event) {
        event.preventDefault();
        if (event.target.classList.contains('table-item')) {
            const  DBName = event.target.getAttribute('database-name');
            const tableName = event.target.getAttribute('data-table-name');
            const tableLabel = event.target.getAttribute('data-table-label');
            editTableDetails(DBName,tableName,tableLabel,tableDetails);
        }
    },{capture: true, once: true});

}   


// called when you change the tab to create a new table
function drageDroptableTableList(list) {
    fetch('/tables-list')
        .then(response => response.json())
        .then(dbs => {
            // Clear the list
            
            list.innerHTML = '';
             // add new table button
                for(key in dbs)
                {
                    
                    const dbname = key;
                    tables=dbs[key];
                tableList=[];
                var i=0;
                tables.forEach(table => {
                
                            var listItem = document.createElement('div');
                            
                            listItem.className='tables-list-item';
                        
                            listItem.textContent = table.NAME; // Adjust based on your API response
                            listItem.setAttribute('database-name', dbname);
                            listItem.setAttribute('data-table-name', table.NAME);
                            listItem.setAttribute('data-table-label', table.LABEL);
                            listItem.setAttribute('title', table.LABEL);
                            var tableDetailsDiv=document.createElement('div');
                            listItem.appendChild(tableDetailsDiv);
                            listItem.ondragstart = function(event) { drag(event); };
                            listItem.onclick = function(event) {
                                        event.preventDefault();
                                        const tableName = event.target.getAttribute('data-table-name');                                    
                                        fetchTableFields(dbname,tableName,tableDetailsDiv);
                            }
                            list.appendChild(listItem);
                            tableList.push(table.NAME);
                            i++;
                    
                });
            }
        }).catch(error => console.error('Error:', error));
}   




function fetchTableFields(database,tableName,detailsDiv) {
    removeAllChildNodes(detailsDiv);
    fetch(`/table-fields/${database}/${tableName}`)
        .then(response => response.json())
        .then(fields => {
           fields.forEach(field => {
                const fieldDiv = document.createElement('div');
                fieldDiv.className='field-item';
                fieldDiv.id=field.NAME+'_'+tableName+'_Editor';
                fieldDiv.draggable=true;
                fieldDiv.ondragstart = function(event) { drag(event); };
                fieldDiv.textContent = field.NAME; // Adjust based on your API response
                fieldDiv.setAttribute('database-name', database);
                fieldDiv.setAttribute('data-table-name', tableName);
                fieldDiv.setAttribute('data-field-name', field.NAME);
                fieldDiv.setAttribute('data-field-type', field.TYPE);
                fieldDiv.setAttribute('data-field-label', field.LABEL);
                fieldDiv.setAttribute('data-field-format', field.FORMAT);
                fieldDiv.setAttribute('data-field-mandatory', field.MANDATORY);
                fieldDiv.setAttribute('data-field-decimal', field.DECIMAL);
                fieldDiv.setAttribute('data-field-width', field.WIDTH);
                fieldDiv.setAttribute('data-field-default', field.DEFAULT);
                fieldDiv.setAttribute('title', field.LABEL);
                detailsDiv.appendChild(fieldDiv);
            });
            
        })
        .catch(error => console.error('Error:', error));
}

// table structure
function fetchTableDetails(DBName,tableName,tableLabel,detailsDiv) {
    removeAllChildNodes(detailsDiv);
    Promise.all([
        fetch(`/table-fields/${DBName}/${tableName}`).then(response => response.json())        
    ])
    .then(([fields]) => {
      
        detailsDiv.innerHTML = `<h3 id='TableDetails_TableName' table-name='${tableName}'>Table Name:${tableName} Description:${tableLabel}</h3>`;
        // align the content to top
        detailsDiv.style.verticalAlign = 'top';
        detailsDiv.style.padding = '10px';

        // Display fields
        const table=  document.createElement('table');
        table.style.padding='10px';
        table.style.cellpadding='10px';

        
        const isNotSearch=document.getElementById('_insertSearch').style.display == 'none';   
        const header=['X','NAME','TYPE','LABEL' ,'FORMAT','*',  'WIDTH','TYPE','TABLE','FIELD','ORDER'];
        // create table header with th elements base on the foreach
        const thead = document.createElement('thead');
        thead.style.padding='10px';

        table.appendChild(thead);
        const tr = document.createElement('tr');
        tr.classList.add('table-header');
        tr.style.padding='10px';
        tr.style.backgroundColor='#0056b3';
        tr.style.color='white';
        tr.id='TableFieldsList';
        tr.style.borderbottom='1px solid #ddd';
        header.forEach(prop => {
            const th = document.createElement('th');
            if (prop === 'X') {
                // genereate the checkbox
                var selectAll = document.createElement('input');
                selectAll.type = 'checkbox';
                selectAll.name = 'selectAll';
                selectAll.className= 'apple-switch';
                selectAll.addEventListener('change', function(event) {
                    var checkboxes= table.querySelectorAll('input[name="fieldItem"]');
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = selectAll.checked;
                    });
                });
                th.appendChild(selectAll);
            } else {
            th.innerHTML =prop  ;
            }
            th.style.padding='10px';
            th.style.alignContent='center';
            th.style.borderRight='1px solid #ddd';
            tr.appendChild(th);
        }); 
        thead.appendChild(tr);
        const tbody = document.createElement('tbody');
        tbody.style.padding='10px';
        table.appendChild(tbody);
        var i=0;
        fields.forEach(field => {
            // Sample configuration array
                                const fieldConfig = [
                                    { name: 'fieldItem', type: 'checkbox', attributes: { type: 'checkbox', 
                                                                                        'dataset-field-name': field.NAME, 
                                                                                        'dataset-field-type': field.TYPE,
                                                                                        'dataset-field-label':field.LABEL,
                                                                                        'dataset-field-format':field.FORMAT,
                                                                                        'dataset-field-mandatory':field.MANDATORY,
                                                                                        'dataset-field-decimal':field.DECIMAL,
                                                                                        'dataset-field-width':field.WIDTH,
                                                                                        'dataset-field-default':field.DEFAULT
                                    } 
                                    },
                                    { name: 'td1', innerHTML: field.NAME },
                                    { name: 'td2', innerHTML: field.TYPE },
                                    { name: 'td3', innerHTML: field.LABEL },
                                    { name: 'td4', innerHTML: field.FORMAT },
                                    { name: 'td5', innerHTML: `<input type='checkbox' class='apple-switch' ${field.MANDATORY=="1"?"checked":""} readonly/>` } ,
                                    { name: 'td6', innerHTML: field.WIDTH },
                                
                                    { name: 'td7', innerHTML: `<select name="inputType" class="input-element" onchange="activateSelect('${field.NAME}')"><option value="input">input</option><option value="select">select</option><option value="checkbox">checkbox</option></select>` },
                                    { name: 'td8', innerHTML: `<select name="tableName" class="input-element" onchange="loadFieldsList('${DBName}','${field.NAME}')" disabled=true><option></option>#TABLELIST#</select>`	 },
                                    { name: 'td9', innerHTML: '<select name="fieldName" class="input-element" disabled=true></select>' },
                                    { name: 'td10', innerHTML: '<select name="order" class="input-element"></select>' }
                                ];

                                // Create table row and elements dynamically based on the configuration array
                                const tr = document.createElement('tr');
                                tr.classList.add('grid-row');
                                tr.style.padding='10px';
                                tr.style.borderbottom='1px solid #ddd';
                                if (i%2==0) 
                                {
                                    tr.style.backgroundColor='#f2f2f2';
                                }
                                tr.setAttribute('data-field-name', field.NAME);
                                
                                fieldConfig.forEach(field => {
                                    const element = document.createElement('td');
                                    if (field.type === 'checkbox') {
                                        const input = document.createElement('input');
                                        input.type = field.type;
                                        input.name = field.name;
                                        input.checked = false;
                                        input.className= 'apple-switch';
                                        for (const key in field.attributes) {
                                            input.setAttribute(key, field.attributes[key]);
                                        }
                                        input.addEventListener('change', function(event) {
                                            // get the order select in the line
                                            var selects= tr.querySelector('select[name="order"]');
                                            // get all the checkboxes cheecked
                                            var checkboxes= table.querySelectorAll('input[name="fieldItem"]:checked');
                                            if (event.target.checked) {
                                                selects.selectedIndex=checkboxes.length-1;
                                            }
                                            else
                                            {
                                                selects.selectedIndex=0;
                                            }
                                        });

                                        element.appendChild(input);
                                    } else if (field.innerHTML) {
                                        element.innerHTML = field.innerHTML;
                                        // check if innerHTML contains #TABLELIST# and replace it with the table list
                                        if (element.innerHTML.indexOf('#TABLELIST#') !== -1) {
                                            element.innerHTML = element.innerHTML.replace('#TABLELIST#', tableList.map(t => `<option value="${t}">${t}</option>`).join(''));
                                        }
                                    }

                                    tr.appendChild(element);
                                });

                                // Append the created table row to the table
                                tbody.appendChild(tr);
                                i++;
           
       });
        detailsDiv.appendChild(table);       
        // insert in order select the options and select the current row
        var selects= table.querySelectorAll('select[name="order"]');
        for (var i = 0; i < selects.length; i++) {
            for (var j = 0; j < selects.length; j++) {
                    var option = document.createElement('option');
                    option.value = j+1;
                    option.text = j+1;
                    selects[i].appendChild(option);
            }
            selects[i].selectedIndex=0;
        }

    })
    .catch(error => console.error('Error:', error));
}

// if the select value is "select" activate tablename select and fieldName otherwise desactivated them
function activateSelect(fieldName)
{
    var table= document.getElementById('TableFieldsList');
    var select= document.querySelector('tr[data-field-name="'+fieldName+'"] select[name="inputType"]');
    var tableNameSelect= document.querySelector('tr[data-field-name="'+fieldName+'"] select[name="tableName"]');
    var fieldNameSelect= document.querySelector('tr[data-field-name="'+fieldName+'"] select[name="fieldName"]');
    var type=select.options[select.selectedIndex].value;
    if (type==="select")
    {
        tableNameSelect.setAttribute("disabled",false);
        fieldNameSelect.setAttribute("disabled",false);
    }
    else
    {
        tableNameSelect.setAttribute("disabled",true);
        fieldNameSelect.setAttribute("disabled",true);
    }
}

// loadFieldsList function check the table name and load the fields in the select
function loadFieldsList(DBName, fieldName)
{
   var table= document.getElementById('TableFieldsList');
   var tableNameSelect= document.querySelector('tr[data-field-name="'+fieldName+'"] select[name="tableName"]');
   console.log('tableNameSelect:', tableNameSelect);
   var tableName=tableNameSelect.options[tableNameSelect.selectedIndex].value;
    var select = document.querySelector('tr[data-field-name="'+fieldName+'"] select[name="fieldName"]');
    select.innerHTML = '';
    if (table) {
        fetch(`/table-fields/${DBName}/${tableName}`)
            .then(response => response.json())
            .then(fields => {
                fields.forEach(field => {
                    const option = document.createElement('option');
                    option.value = field.NAME;
                    option.text = field.NAME;
                    select.appendChild(option);
                });
            })
            .catch(error => console.error('Error:', error));
    }
}

// table structure
async function editTableDetails(DBName,tableName, tableLabel, detailsDiv) {
    // Remove all child nodes
    removeAllChildNodes(detailsDiv);

    try {
        // Fetch table fields
        const response = await fetch(`/table-fields/${DBName}/${tableName}`);
        const fields = await response.json();
        // Set innerHTML
        detailsDiv.innerHTML = `<h3 id='TableDetails_TableName' DBName='${DBName}' table-name='${tableName}'>Table Name:${tableName} Description:${tableLabel}</h3>`;
        detailsDiv.style.padding = '10px';
        // Create and append table
        const table = document.createElement('table');
        table.style.padding='10px';

        detailsDiv.appendChild(table);
        // Add header to table
        const thead = document.createElement('thead');
        thead.style.padding='10px';
        thead.style.backgroundColor='#0056b3';
        thead.style.color='white';
        thead.style.alignContent='center';
        table.appendChild(thead);
        var tr = document.createElement('tr');
        tr.style.padding='10px';
        tr.style.borderbottom='1px solid #ddd';
        header.forEach(prop => {
            const td = document.createElement('td');
            td.innerText =prop  ;
            td.style.padding='10px';
            td.style.alignContent='center';
            td.style.borderRight='1px solid #aaa';
            tr.appendChild(td);
        });
        thead.appendChild(tr);
        // Add fields to table
        const tbody = document.createElement('tbody');
        tbody.style.padding='10px';
        table.appendChild(tbody);
        
        fields.forEach(field => {
            const tr = document.createElement('tr');
            tr.style.padding='10px';
            tr.style.borderbottom='1px solid #eee';
           header.forEach(prop => {
                const td = document.createElement('td');
                if (prop === 'MANDATORY') {
                    // checkbox
                    td.innerHTML =`<input name='${prop}' value='${field[prop]}' class="apple-switch" type='checkbox' readonly/>`  ;
                } else {
                    td.innerHTML =`<input name='${prop}' class="input-element" value='${field[prop]}' readonly/>`  ;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        const buttonContainer = document.createElement('div');
        buttonContainer.className   = 'button-container';
       
        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.className   = 'button';
        addButton.onclick = function(event) {
            event.preventDefault();
            addTableColumn(tbody);
        };
        buttonContainer.appendChild(addButton);
       
       
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.className   = 'button';
        saveButton.onclick = function(event) {
            event.preventDefault();
            saveAlterTable(DBName,table,tableName);
        };  
        buttonContainer.appendChild(saveButton);
        detailsDiv.appendChild(buttonContainer);

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

async function saveAlterTable(DBName,table,tabelName) {
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
           alterTable(DBName,tabelName, 'add', newColumn.NAME, columnData, null, null);
        }
    }
    );


    // adding in array all the elements in order to call altertable function, the column name and type are mandatory
   
    
}


function addTableColumn(DBName,table) {
    const tr = document.createElement('tr');
    tr.setAttribute('new', '');
    header.forEach(prop => {
        const td = document.createElement('td');
        switch (prop) {
            case 'TYPE':
                var _select= `<select new name='${prop}' class="input-element">`;
                  
                    _select+=`<option value="CHAR">CHAR</option>`;
                    _select+=`<option value="VARCHAR">VARCHAR</option>`;
                    _select+=`<option value="INTEGER">INTEGER</option>`;
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

async function alterTable(DBName,tableName, action, columnName, columnType, newColumnName, newColumnType) {
    try {
        const response = await fetch(`/alter-table/${DBName}/${tableName}`, {
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
    // button to add row    
    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.onclick = function(event) {
        event.preventDefault();
        addTableColumn(table);
    };  
    detailsDiv.appendChild(addButton);
    // button to save table
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.onclick = function(event) {
        event.preventDefault();
        createTable(table);
    }; 
    // append all elements
    detailsDiv.appendChild(saveButton);
}

async function createTable(DBName,table) {
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
    postCreateTable(DBName,tableName, columnsData);
       
}

async function postCreateTable(DBName,tableName, columns) {
    
    try {
        const response = await fetch(`/create-table/${DBName}/${tableName}`, {
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


function showModalDbStrc(main,type) {
    console.log(type);
    const modal = document.getElementById('DatabaseDetailsModal');
  
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'block';
   // overl.style.display = 'block';
    // get the table list
    const list = modal.querySelector('#modalTableListPanel');
    // get table details from api   
    fetchTablesList(list);
    // wait for the table list to be loaded
    
    // replace the click event with the new one for all the div in the list
    const tables= list.querySelectorAll('.table-item');

 
    tables.forEach(table => {
        // remove the click event
       
        table.onclick = function(event) {
            // Clear the table details div
             event.preventDefault();
             const contentDiv = modal.querySelector('#modaltableDetails');
            console.log('contentDiv:', contentDiv);
             contentDiv.innerHTML = '';
            
             const DBName = event.target.getAttribute('database-name');
            const tableName = event.target.getAttribute('data-table-name');
            const tableLabel = event.target.getAttribute('data-table-label');
            // get the table details div
            var header = ['X', 'Name', 'Field Description', 'Type', 'Mandatory','Up','Down'];
                const table = document.createElement('table');
                table.style.padding='10px';
                table.style.cellpadding='10px';
                const thead = document.createElement('thead');
                thead.style.padding='10px';
                table.appendChild(thead);
                const tr = document.createElement('tr');
                tr.style.padding='10px';
                tr.style.backgroundColor='#4d61fc';
                tr.style.color='white';
                tr.id='TableFieldsList';
                tr.style.borderbottom='1px solid #ddd';
                header.forEach(prop => {
                    const th = document.createElement('th');
                    if (prop === 'X') {
                        // genereate the checkbox
                        var selectAll = document.createElement('input');
                        selectAll.type = 'checkbox';
                        selectAll.name = 'selectAll';
                        selectAll.className= 'apple-switch';
                        selectAll.addEventListener('change', function(event) {
                            var checkboxes= table.querySelectorAll('input[name="fieldItem"]');
                            checkboxes.forEach(checkbox => {
                                checkbox.checked = selectAll.checked;
                            });
                        });
                        th.appendChild(selectAll);
                    } else {
                    th.innerHTML =prop  ;
                    }
                    th.style.padding='10px';
                    th.style.alignContent='center';
                    th.style.borderRight='1px solid #ddd';
                    tr.appendChild(th);
                });
                thead.appendChild(tr);
                const tbody = document.createElement('tbody');
                tbody.style.padding='10px';
                table.appendChild(tbody);
                contentDiv.appendChild(table);

                header = ['X', 'NAME', 'LABEL', 'TYPE', 'MANDATORY','UP','DOWN'];
            fetch(`/table-fields/${DBName}/${tableName}`).then(response => response.json())        
            .then(fields => {
               // add to the tbody the fields with this structure  const header = ['X', 'Field Name', 'Field Description', 'Type', 'Mandatory'];
              //  console.log('fields:', fields);
                // c
               fields.forEach(field => {
                  //  console.log('field:', field);
                     const tr = document.createElement('tr');
                      tr.classList.add('grid-row');
                      tr.style.padding='10px';
                      tr.style.borderbottom='1px solid #ddd';
                      const json = {
                            DBName: DBName,
                            tableName: tableName,
                            fieldName: field.NAME,
                            fieldLabel: field.LABEL,
                            fieldType: field.TYPE,
                            fieldDataType: field.TYPE,
                            fieldMandatory: field.MANDATORY,
                            fieldWidth: field.WIDTH,    
                            copyType: 'Data',
                            fieldDefault: field.DEFAULT


                        };
                      // add table name and db name json
                      
                      tr.setAttribute('filed-data', JSON.stringify(json));
                      header.forEach(prop => {
                            const td = document.createElement('td');
                            if (prop === 'X') {
                             // genereate the checkbox
                             var selectAll = document.createElement('input');
                             selectAll.type = 'checkbox';
                             selectAll.name = 'fieldItem';
                             selectAll.className= 'apple-switch';
                             selectAll.setAttribute('data-field-name', field.NAME);
                             selectAll.addEventListener('change', function(event) {
                                  // get the order select in the line
                                  var selects= tr.querySelector('select[name="order"]');
                                  // get all the checkboxes cheecked
                                  var checkboxes= table.querySelectorAll('input[name="fieldItem"]:checked');
                                  if (event.target.checked) {
                                        selects.selectedIndex=checkboxes.length-1;
                                  }
                                  else
                                  {
                                        selects.selectedIndex=0;
                                  }
                             });
    
                             td.appendChild(selectAll);
                            } else if (prop === 'UP') {
                                var up = document.createElement('i');
                               
                                up.className = 'fa fa-arrow-up';
                                up.onclick = function(event) {
                                    event.preventDefault();
                                   // move the row up
                                      var previous = tr.previousElementSibling;
                                        if (previous) {
                                            tbody.insertBefore(tr, previous);
                                        }
                                };
                                td.appendChild(up);
                            } else if (prop === 'DOWN') {
                                var down = document.createElement('i');
                              
                                down.className = 'fa fa-arrow-down';
                                down.onclick = function(event) {
                                    event.preventDefault();
                                    // move the row down
                                    var next = tr.nextElementSibling;
                                    if (next) {
                                        tbody.insertBefore(next, tr);
                                    }
                                };
                                td.appendChild(down);
                            }
                            else {
                            td.innerHTML =field[prop]  ;
                            }
                            td.style.padding='10px';
                            td.style.alignContent='center';
                            td.style.borderRight='1px solid #ddd';
                            tr.appendChild(td);
                      });
                      tbody.appendChild(tr);
                }); // end of foreach
            }); // end of fetch
               
                
           
        };
    });


    // 

}

function applyDBModal(button){
    const contentDiv = button.closest('.modal').querySelector('#modaltableDetails').querySelector('tBody');
    // get all the tr in contentDiv
    const trs = contentDiv.querySelectorAll('tr');
     // get the propertiesBar
     const propertiesBar = document.getElementById('propertiesBar');
     console.log('propertiesBar:', propertiesBar);
     // gest Data div
     const dataDiv = propertiesBar.querySelector('#Data');
     console.log('dataDiv:', dataDiv);
    trs.forEach(tr => {
        console.log('tr:', tr);
        // check if the checkbox is checked
        if (tr.querySelector('input[name="fieldItem"]').checked) {
            const json = JSON.parse(tr.getAttribute('filed-data'));            
            addFieldToPropertiesBar(dataDiv, json);
        }
       
    });
   

    // close the modal
    const modal = button.closest('.modal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';

}

function closeModalDbStrct() {
    const modal = document.getElementById('tableDetailsModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
}

function closeDBModalEdit(button){
    const modal = button.closest('.modal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';

}

function searchtable(search,contentDivID)
{
    var filter=search.toUpperCase().split(' ');
    var tables = filter[0].trim();
    //var fields = filter[1].trim();
    contentDivID.innerHTML = '';    
    var list=document.getElementById(contentDivID);
    // get all the divs in the list with the property data-table-name
    var items = list.querySelectorAll('[data-table-name]');
    items.forEach(item => {
        //var dbname = item.getAttribute('database-name').toUpperCase();
        var table = item.getAttribute('data-table-name').toUpperCase();
        if (table.indexOf(tables) > -1) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}