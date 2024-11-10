function createDataSetComponentNavigate(type) {
  var main = document.createElement("div");
  main.className = "dataSetComponentNavigate";
  main.id = type + Date.now();
  main.draggable = true;
  main.tagName = type;
  renderNavigationBar(main);
  return main;
}

function renderNavigationBar(main) {
 
  // Create the navigation bar div
  var navigationBar = document.createElement("div");
  navigationBar.id = "navigationBar_" + Date.now();
  navigationBar.type = "navigation-bar";
  //   navigationBar.className = "navigation-bar";
  navigationBar.style.display = "block";
  
  // Create buttons and append them to the navigation bar
  var buttons = [
   
    {
      name: "PreviusDSBtn",
      title: "Previus",
      text: '<i class="bi bi-arrow-left-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "navbar_movePrev()",
    },
    {
      name: "NextDSBtn",
      title: "Next",
      text: '<i class="bi bi-arrow-right-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "navbar_moveNext()",
    },
   
    {
      name: "EditDSBtn",
      title: "Edit Record",
      text: '<i class="bi bi-credit-card-2-front" style="color:blue;margin-left:-6px"></i>',
      event: "navbar_EditRecord( false)",
    },
    {
      name: "InsertDSBtn",
      title: "Insert Record",
      text: '<i class="bi bi-sticky-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "navbar_InsertRecord()",
    },
    {
      name: "CopyDSBtn",
      title: "Copy",
      text: '<i class="bi bi-clipboard" style="color:red;margin-left:-6px"></i>',
      event:
        "navbar_CopyRecord()",
    },
    {
      name: "SaveDSBtn",
      title: "Save Record",
      text: '<i class="bi bi-sim-fill" style="color:red;margin-left:-6px"></i>',
      event: "navbar_SaveRecord()",
    }
  ];
  var htm = "";
  //for the dom2json is mandatory to create a html for the events
  buttons.forEach((buttonInfo) => {
    htm += `<button name='${buttonInfo.name}'  title="${
      buttonInfo.title
    }" onclick="${buttonInfo.event.trim()}" style="width:30px;">${
      buttonInfo.text
    }</button>`;
  });
  navigationBar.innerHTML += "<div >" + htm + "</div>";

  main.appendChild(navigationBar);
}



function navbar_movePrev() {
  // get dataGrid by tag name
  let dataGrid = document.querySelectorAll("[tagname='dataGrid']");
  // get all .grid-row and check if threse is a row selected and select the previous row
  for (let i = 0; i < dataGrid.length; i++) {
    let grid = dataGrid[i];
    let rows = grid.querySelectorAll(".grid-row");
    console.log(rows);
    let found = false;
    for (let j = 1; j < rows.length; j++) {
      if (rows[j].classList.contains("grid-row-selected")) {
         rows[j].classList.remove("grid-row-selected");
        //  rows[j - 1].classList.add("grid-row-selected");
          // simulate click on the row
          rows[j - 1].querySelector("div").click();
        found = true;
        break;
        }
      
    }
    if (!found) {
      rows[0].querySelector("div").click();
    }
  }
}

function navbar_moveNext(DBName, tableName, datasetFields) {
   // get dataGrid by tag name
   let dataGrid = document.querySelectorAll("[tagname='dataGrid']");
   // get all .grid-row and check if threse is a row selected and select the previous row
   for (let i = 0; i < dataGrid.length; i++) {
     let grid = dataGrid[i];
     let rows = grid.querySelectorAll(".grid-row");
     console.log(rows);
     let found = false;
     for (let j =  rows.length-1; j > 0; j--) {
       if (rows[j].classList.contains("grid-row-selected")) {
           rows[j].classList.remove("grid-row-selected");
       
           // simulate click on the row
           rows[j + 1].querySelector("div").click();
          found = true;
         break;
       }
     }
     if (!found) {
       rows[rows.length-1].querySelector("div").click();
     }
   }
}

function navbar_EditRecord(action) {
  const inputs = document.querySelectorAll(
    `[data-table-name] input[dataset-field-name]`
  );

  inputs.forEach((input) => {
    const tableLabel = input.getAttribute("dataset-table-name");
    input.readOnly = action;
    input.disabled = action;
    // }
  });

  document.querySelector("[name=SaveDSBtn]").disabled = action;
}

function navbar_InsertRecord() {
  const inputs = document.querySelectorAll(`[data-table-name] input,select`);
  console.log(inputs);
  inputs.forEach((input) => {
         input.readOnly = false;
         input.disabled = false;
      const field = input.getAttribute("dataset-field-name");
      if (field === "rowid") {
        input.value = "new";
      } else {
        input.value = "";
      }
   
  });
  document.querySelector("[name=SaveDSBtn]").disabled = false;
}

function navbar_CopyRecord() {
  const inputs = document.querySelectorAll(`[data-table-name] input`);
  const selects = document.querySelectorAll(`[data-table-name] select`);
  const idObject = getIdObject();
  const main = document.getElementById(idObject.dataSet);
  const exceptionData = JSON.parse(main.getAttribute("exceptionSet"));
  const exceptionFieldNames = exceptionData.map((field) => field.fieldName);

  inputs.forEach((input) => {
    if (input.id && input.id.includes("__")) {
      return;
    }
    input.readOnly = false; // Make input editable
    const field = input.getAttribute("dataset-field-name");
    input.setAttribute("value", "new"); // Set all non-exception inputs to "new"

    if (exceptionFieldNames.includes(field) && field !== "rowid") {
      input.value = ""; // Clear the value for exception fields
    }
  });

  // Process all select fields
  selects.forEach((select) => {
    const field = select.getAttribute("dataset-field-name");

    // If the select field is in the exception list and not "rowid"
    if (exceptionFieldNames.includes(field) && field !== "rowid") {
      select.selectedIndex = -1; // Clear the selection for exception fields
    } else {
      select.selectedIndex; // Set to the first option or a default value
    }
  });
  document.querySelector("[name=SaveDSBtn]").disabled = false;
}

function CreateUpdated(DBName, tableName) {

  const inputs = document.querySelectorAll(
    `#DataSet_${tableName} input[dataset-field-name]`
  );


  let updateFields = [];
  let fieldGroups = {};

  inputs.forEach((input) => {
    const field = input.getAttribute("dataset-field-name");
    const value = input.value;
    if (field === "rowid") {
      return; // Skip rowid field
    }
    // Extract the prefix and index
    const match = field.match(/^([a-zA-Z]+)__(\d+)$/);
    if (match) {
      const prefix = match[1]; // Extract the base prefix (e.g., 'droit')
      const index = parseInt(match[2], 10); // Extract and convert the index
      if (!fieldGroups[prefix]) {
        fieldGroups[prefix] = [];
      }
      // Ensure the array is large enough to hold the value at the given index
      if (fieldGroups[prefix].length <= index) {
        fieldGroups[prefix].length = index + 1;
      }

      fieldGroups[prefix][index] = value; // Store the value at the correct index
    } else {
      // Handle fields without a detectable prefix
      if (value) {
        // Only add fields with non-empty values
        updateFields.push(`"${field}" = '${value}'`);
      }
    }

    input.readOnly = true;
  });

  // Format grouped values and ensure only the last non-empty value is kept
  for (const prefix in fieldGroups) {
    const valuesArray = fieldGroups[prefix];
    const valuesString = valuesArray
      .filter((v) => v !== undefined && v !== "")
      .join(";");

    // Add to updateFields only if valuesString is not empty
    if (valuesString) {
      updateFields.push(`"${prefix}" = '${valuesString}'`);
    }
  }

  // Return the final formatted string
  return updateFields.join(", ");
}

function addIdToData(data, id, value) {
  let fieldsArray = data.fields.replace(/"/g, "").split(",");
  let valuesArray = data.values.replace(/'/g, "").split(",");
  const idIndex = fieldsArray.indexOf("id");
  if (idIndex !== -1) {
    const valueIndex = idIndex;
    valuesArray[valueIndex] = value;
  } else {
    fieldsArray.push("id");
    valuesArray.push(value);
  }
  data.fields = fieldsArray.map((f) => `"${f}"`).join(",");
  data.values = valuesArray.map((v) => `'${v}'`).join(",");
  return data;
}

async function navbar_SaveRecord () {
  try {
    if ( document.querySelector("[name=SaveDSBtn]").disabled){
     showToast("Save button is disabled");
      return;
    }
    console.log("SaveRecord");
    const nextRowIds = document.querySelectorAll("[dataset-field-type='rowid']");
    for (const nextRowId of nextRowIds) {
      console.log(nextRowId);
      const tableName = nextRowId.getAttribute("dataset-table-name");
      const dbName = nextRowId.getAttribute("dbname");
     
        const rowIdValue = nextRowId.value;
        let result;
        if (rowIdValue === "new") {
          let data = await CreateInsert(dbName, tableName);
          result = await insertRecordDB(dbName, tableName, data);
        } else {
          const data = {
            body: CreateUpdated(dbName, tableName),
          };
          result = await updateRecordDB(dbName, tableName, rowIdValue, data);
        }
        document.querySelector("[name=SaveDSBtn]").disabled = true;
        return result;
      
    }
  } catch (error) {
    showToast("Error:" + error);
  }
}

// create insert data structure
async function CreateInsert(DBName, tableName) {
  // create data for insert following this structure  `INSERT INTO ${tableName} (${data.fields}) VALUES (${data.values})`;
  // return data with data.fields and data.values
  const inputs = document.querySelectorAll(`#DataSet_${tableName} input`);
  var insertFields = "";
  var insertValues = "";
  for (i = 0; i < inputs.length; i++) {
    
    if (inputs[i].id && inputs[i].id.includes("__")) {
      continue; // Skip this iteration
    }
    switch (inputs[i].type) {
      case "hidden":
        break;
      default:
        // get the field name from the input
        var field = inputs[i].getAttribute("dataset-field-name");
        var subtype = inputs[i].getAttribute("dataset-field-type");
        insertFields += `"${field}"`;
        // get sequence value from the the attribute dataset-field-values
        if (subtype === "sequence") {
          let sequence = inputs[i].getAttribute("dataset-field-values");
          console.log(sequence);
          console.log(inputs[i]);
          let tabelName = inputs[i].getAttribute("dataset-table-name");
          let sequenceValue = await navigateSequence(
            DBName,
            tabelName,
            sequence
          );
          inputs[i].value = sequenceValue;
          insertValues += `'${sequenceValue}'`;
        } else {
          insertValues += `'${inputs[i].value}'`;
        }
        if (i < inputs.length - 1) {
          insertFields += ",";
          insertValues += ",";
        } // end if i
        break;
    } // end switch

    inputs[i].readOnly = true;
  } // end for

  if (insertFields.endsWith(",")) {
    insertFields = insertFields.slice(0, -1); // Remove last comma
  }
  if (insertValues.endsWith(",")) {
    insertValues = insertValues.slice(0, -1); // Remove last comma
  }

  return { fields: insertFields, values: insertValues };
}

async function navigateSequence(DBName, tableName, sequenceName) {
  const url = `/next-sequence/${DBName}/${tableName}/${sequenceName}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[0]?.sequence_next; // Return the desired sequence
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function updateRecordDB(DBName, tableName, nextRowId, updateData) {
  try {
    const response = await fetch(
      `/update-record/${DBName}/${tableName}/${nextRowId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      showToast(`HTTP error! status: ${response.status}`);
    }
    const updateResult = await response.json();
    let idObject = getIdObject();
    let filedName = "";
    let operator = "";
    let searchValue = "";
    if (idObject?.dataGrid) {
      const grid = document.getElementById(idObject?.dataGrid);
      filedName = grid.getAttribute("filedName") || "";
      operator = grid.getAttribute("operator") || "";
      searchValue = grid.getAttribute("searchValue") || "";
    }
    searchGrid(filedName, operator, searchValue, idObject?.dataGrid);

    showToast("Record updated successfully", 5000); // Show toast for 5 seconds
    return updateResult;
  } catch (error) {
    showToast("Error:" + error);
  }
}

async function insertRecordDB(DBName, tableName, data) {
  try {
    const payload = JSON.stringify(data);
    const response = await fetch(`/insert-record/${DBName}/${tableName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include other headers as needed, like authentication tokens
      },
      body: payload,
    });

    if (!response.ok) {
      showToast(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    showToast("Record inserted successfully", 5000); // Show toast for 5 seconds
    return result;
  } catch (error) {
    showToast("Error inserting record:" + error);
  }
}


