function createDataSetComponentNavigate(type) {
  var main = document.createElement("div");
  main.className = "dataSetComponentNavigate";
  main.id = type + Date.now();
  main.draggable = true;
  main.tagName = type;
  return main;
}

function createNavigationBar(DBName, tableName, datasetFields) {
  const ides = getIdObject();
  const main = document.getElementById(ides.dataSetNavigation);
  // Create the navigation bar div
  var navigationBar = document.createElement("div");
  navigationBar.id = "navigationBar_" + tableName;
  navigationBar.type = "navigation-bar";
  //   navigationBar.className = "navigation-bar";
  navigationBar.style.display = "block";
  navigationBar.setAttribute("DBName", DBName);
  navigationBar.setAttribute("data-table-name", tableName);
  navigationBar.setAttribute("data-current-row", "0");
  navigationBar.setAttribute("data-dataset-fields", datasetFields);
  navigationBar.innerHTML = '<div class="navigation-bar-title">record: </div>';

  // Create buttons and append them to the navigation bar
  var buttons = [
    {
      name: "firstDSBtn",
      title: "First",
      text: '<i class="bi bi-arrow-up-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "moveFirst('" +
        DBName +
        "','" +
        tableName +
        "','" +
        datasetFields +
        "')",
    },
    {
      name: "PreviusDSBtn",
      title: "Previus",
      text: '<i class="bi bi-arrow-left-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "movePrev('" +
        DBName +
        "','" +
        tableName +
        "','" +
        datasetFields +
        "')",
    },
    {
      name: "NextDSBtn",
      title: "Next",
      text: '<i class="bi bi-arrow-right-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "moveNext('" +
        DBName +
        "','" +
        tableName +
        "','" +
        datasetFields +
        "')",
    },
    {
      name: "LastDSBtn",
      title: "Last",
      text: '<i class="bi bi-arrow-down-circle-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "moveLast('" +
        DBName +
        "','" +
        tableName +
        "','" +
        datasetFields +
        "')",
    },
    {
      name: "EditDSBtn",
      title: "Edit Record",
      text: '<i class="bi bi-credit-card-2-front" style="color:blue;margin-left:-6px"></i>',
      event: "EditRecord('" + tableName + "', false)",
    },
    {
      name: "InsertDSBtn",
      title: "Insert Record",
      text: '<i class="bi bi-sticky-fill" style="color:green;margin-left:-6px"></i>',
      event:
        "InsertRecord('" +
        DBName +
        "','" +
        tableName +
        "','" +
        datasetFields +
        "')",
    },
    {
      name: "CopyDSBtn",
      title: "Copy",
      text: '<i class="bi bi-clipboard" style="color:red;margin-left:-6px"></i>',
      event:
        "CopyRecord('" +
        DBName +
        "','" +
        tableName +
        "', '" +
        datasetFields +
        "')",
    },
    {
      name: "SaveDSBtn",
      title: "Save Record",
      text: '<i class="bi bi-sim-fill" style="color:red;margin-left:-6px"></i>',
      event: "SaveRecord('" + DBName + "','" + tableName + "')",
    },
    {
      name: "RefreshDSBtn",
      title: "Refresh Data",
      text: '<i class="bi bi-arrow-clockwise" style="color:green;margin-left:-6px"></i>',
      event: "RefreshRecord('" + DBName + "','" + tableName + "')",
    },
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
  // Append the navigation bar to the body or another element in your document
  while (main.firstChild) {
    main.removeChild(main.firstChild);
  }
  main.appendChild(navigationBar);
}

function moveFirst(DBName, tableName, datasetFields) {
  if (tableName) {
    navigateRecords("move-to-first", DBName, tableName, datasetFields);
  }
}

function movePrev(DBName, tableName, datasetFields) {
  if (tableName) {
    const rowNum = getRowNum(tableName);
    if (rowNum == 0) return;
    navigateRecords(
      "move-to-previous",
      DBName,
      tableName,
      datasetFields,
      rowNum - 1
    );
  }
}

function moveNext(DBName, tableName, datasetFields) {
  if (tableName) {
    navigateRecords(
      "move-to-next",
      DBName,
      tableName,
      datasetFields,
      getRowNum(tableName) + 1
    );
  }
}

function moveLast(DBName, tableName, datasetFields) {
  if (tableName)
    navigateRecords(
      "move-to-last",
      DBName,
      tableName,
      datasetFields,
      "",
      "",
      true
    );
}

function EditRecord(tableName, action) {
  const inputs = document.querySelectorAll(
    `#DataSet_${tableName} input, #DataSet_${tableName} select`
  );

  inputs.forEach((input) => {
    const tableLabel = input.getAttribute("dataset-table-name");
    input.readOnly = action;
    input.disabled = action;
    // }
  });

  document.querySelector("[name=SaveDSBtn]").disabled = action;
}

function InsertRecord(DBName, tableName) {
  const inputs = document.querySelectorAll(`#DataSet_${tableName} input`);
  inputs.forEach((input) => {
    const tableLabel = input.getAttribute("dataset-table-name");
    if (tableLabel == tableName) {
      input.readOnly = false;
      const field = inputs[i].getAttribute("dataset-field-name");
      if (field !== null && field !== "rowid") {
        input.value = "new";
      } else {
        input.value = "";
      }
    }
  });
  document.getElementById("SaveRecordBtn").disabled = false;
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

async function SaveRecord(DBName, tableName) {
  try {
    console.log("SaveRecord");
    const nextRowIds = document.querySelectorAll("#" + tableName + "_rowid");
    for (const nextRowId of nextRowIds) {
      console.log(nextRowId);
      const datasetTableName = nextRowId.getAttribute("dataset-table-name");
      const dbName = nextRowId.getAttribute("DBName");
      if (datasetTableName === tableName) {
        const rowIdValue = nextRowId.value;
        let result;
        if (rowIdValue === "new") {
          let data = await CreateInsert(DBName, tableName);
          result = await insertRecordDB(DBName, tableName, data);
        } else {
          const data = {
            body: CreateUpdated(DBName, tableName),
          };
          result = await updateRecordDB(DBName, tableName, rowIdValue, data);
        }
        document.querySelector("[name=SaveDSBtn]").disabled = true;
        return result;
      }
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
    console.log(inputs[i].type);
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
