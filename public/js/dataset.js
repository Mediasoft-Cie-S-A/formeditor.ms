
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
function gridFetchData(dataGrid,page) {
    var pageSize=dataGrid.getAttribute("page_size");
    var tableName=dataGrid.getAttribute("Table-Name");
    fetch(`/table-data/${tableName}/${page}/${pageSize}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(row => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'grid-row';
                // Assuming 'row' is an object with keys corresponding to column names
                for (const key in row) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell';
                    cell.textContent = row[key];
                    rowDiv.appendChild(cell);
                }
                dataGrid.appendChild(rowDiv);
            });
        })
        .catch(error => console.error('Error:', error));
}
