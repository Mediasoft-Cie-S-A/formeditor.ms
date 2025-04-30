function createDataSetComponentNavigate(type) {
  var main = document.createElement("div");
  main.className = "dataSetComponentNavigate";
  main.id = type + Date.now();
  main.draggable = true;
  main.tagName = type;
  renderNavigationBar(main);
  return main;
}

function editDataSetComponentNavigate(type, element, content) {
  // Logic to edit the menu, for example adding/removing items
  const actions = JSON.parse(element.getAttribute("actions"));
  // generate input
  // Clear the content area to prevent duplicates
  const div = document.createElement("div");
  div.style.width = "100%";

  div.style.border = "1px solid #ccc";
  div.style.borderRadius = "5px";
  div.style.padding = "10px";
  // Button to save all variables as cookies
  const saveButton = document.createElement("button");
  saveButton.textContent = "Update";
  saveButton.onclick = () => saveActions(element);
  saveButton.style.width = "100%";
  div.appendChild(saveButton);
  // Create a container div for the variables
  const itemdiv = document.createElement("div");
  itemdiv.id = "actions";
  itemdiv.draggable = true;
  div.appendChild(itemdiv);

  // Button to add new variables
  const addButton = document.createElement("button");
  addButton.textContent = "Add Action";
  addButton.onclick = () => addAction(element, itemdiv, {});
  addButton.style.width = "100%";
  // Append the Add and Save buttons to the property bar
  div.appendChild(addButton);
  content.appendChild(div);
  // set the actions
  actions.forEach((action) => {
    addAction(element, itemdiv, action);
  });

}

function addAction(element, itemdiv, action) {
  const actionDiv = document.createElement("div");
  actionDiv.className = "action";
  actionDiv.draggable = true;
  actionDiv.style.border = "1px solid #ccc";
  actionDiv.style.borderRadius = "5px";
  actionDiv.style.padding = "5px";
  const actionEvent = document.createElement("select");
  actionEvent.options.add(new Option("Read", "read"));
  actionEvent.options.add(new Option("Write", "write"));
  actionEvent.options.add(new Option("Update", "update"));
  actionEvent.options.add(new Option("Copy", "copy"));
  if (action.actionEvent) {
    actionEvent.value = action.actionEvent;
  }
  actionDiv.appendChild(actionEvent);
  const actionType = document.createElement("select");
  actionType.options.add(new Option("Send Email", "email"));
  actionType.options.add(new Option("Call API", "api"));
  actionType.options.add(new Option("Navigate", "navigate"));
  actionType.options.add(new Option("Show Message", "message"));
  actionType.options.add(new Option("Show Toast", "toast"));
  actionType.options.add(new Option("Show Modal", "modal"));
  actionType.options.add(new Option("Show Alert", "alert"));
  actionType.options.add(new Option("Show Confirm", "confirm"));
  actionType.options.add(new Option("Show Prompt", "prompt"));
  // select the action type by action.actionType
  if (action.actionType)
  {
      actionType.value = action.actionType;
  }
  actionDiv.appendChild(actionType);
  const actionContent = document.createElement("textarea");
  actionContent.placeholder = "Action content";
  actionContent.style.width = "100%";
  actionContent.style.height = "100px";
  if (action.actionContent) {
    actionContent.value = action.actionContent;
  }
  actionDiv.appendChild(actionContent);
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.onclick = () => actionDiv.remove();
  actionDiv.appendChild(deleteButton);
  itemdiv.appendChild(actionDiv);
}
  

function saveActions(element) {
  const actions = [];
  const actionDivs = element.querySelectorAll(".action");
  actionDivs.forEach((actionDiv) => {
    const action = {};
    const actionEvent = actionDiv.querySelector("select");
    action.actionEvent = actionEvent.value;
    const actionType = actionDiv.querySelector("select");
    action.actionType = actionType.value;
    const actionContent = actionDiv.querySelector("textarea");
    action.actionContent = actionContent.value;
    actions.push(action);
  });
  element.setAttribute("actions", JSON.stringify(actions));
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
      text: '<p>Previus</p> <i class="fa fa-chevron-left" style="color:#4d61fc;margin-left:-6px"></i>',
      event:
        "navbar_movePrev()",
    },
    {
      name: "NextDSBtn",
      title: "Next",
      text: '<p>Next</p><i class="fa fa-chevron-right" style="color:#4d61fc;margin-left:-6px"></i>',
      event:
        "navbar_moveNext()",
    },

    {
      name: "EditDSBtn",
      title: "Edit Record",
      text: '<p>Edit</p><i class="fa fa-pencil-square-o" style="color:#4d61fc;margin-left:-6px"></i>',
      event: "navbar_EditRecord( false)",
    },
    {
      name: "InsertDSBtn",
      title: "New Record",
      text: '<p>New Record</p><i class="fa fa-plus" style="color:green;margin-left:-6px"></i>',
      event:
        "navbar_InsertRecord()",
    },
    {
      name: "CopyDSBtn",
      title: "Copy",
      text: '<p>Copy</p><i class="fa fa-files-o" style="color:#4d61fc;margin-left:-6px"></i>',
      event:
        "navbar_CopyRecord()",
    },
    {
      name: "SaveDSBtn",
      title: "Save Record",
      text: '<p>Save</p><i class="fa fa-floppy-o" style="color:red;margin-left:-6px"></i>',
      event: "navbar_SaveRecord()",
    }
  ];
  var htm = "";
  //for the dom2json is mandatory to create a html for the events
  buttons.forEach((buttonInfo) => {
    htm += `<button name='${buttonInfo.name}'  title="${buttonInfo.title
      }" onclick="${buttonInfo.event.trim()}" style="width:150px;">${buttonInfo.text
      }</button>`;
  });
  navigationBar.innerHTML += "<div >" + htm + "</div>";

  main.appendChild(navigationBar);
}

function navbar_movePrev() {
  let allPanels = document.querySelectorAll("[tagname='dataTable'] div.panel");
  let selectedPanel = document.querySelector(".selected-panel");

  if (!selectedPanel && allPanels.length > 0) {
    // If no panel is selected, consider the first panel as selected
    selectedPanel = allPanels[0];
    selectedPanel.classList.add("selected-panel");
  }

  if (selectedPanel) {
    selectedPanel.classList.remove("selected-panel");

    let panels = Array.from(allPanels);
    let currentIndex = panels.indexOf(selectedPanel);

    // Click on the previous panel div if it exists
    if (currentIndex > 0) {
      panels[currentIndex - 1].classList.add("selected-panel");
      panels[currentIndex - 1].click();
      return; // Exit after handling panels
    } else {
      console.log("No previous panel to select.");
    }
  }

  let dataGrid = document.querySelectorAll("[tagname='dataGrid']");

  for (let i = 0; i < dataGrid.length; i++) {
    let grid = dataGrid[i];
    let rows = grid.querySelectorAll(".grid-row");
    let found = false;

    // Iterate through the rows to find the selected one
    for (let j = 1; j < rows.length; j++) {
      if (rows[j].classList.contains("grid-row-selected")) {
        rows[j].classList.remove("grid-row-selected");

        // Simulate click on the previous row
        if (j - 1 >= 0) {
          rows[j - 1].querySelector("div").click();
        }
        found = true;
        break;
      }
    }

    // If no row is selected, simulate click on the first row
    if (!found && rows.length > 0) {
      rows[0].querySelector("div").click();
    }
  }
}


function navbar_moveNext() {
  // Handle selected-panel logic
  let allPanels = document.querySelectorAll("[tagname='dataTable'] div.panel");
  let selectedPanel = document.querySelector(".selected-panel");

  if (!selectedPanel && allPanels.length > 0) {
    // If no panel is selected, consider the first panel as selected
    selectedPanel = allPanels[0];
    selectedPanel.classList.add("selected-panel");
  }

  if (selectedPanel) {
    selectedPanel.classList.remove("selected-panel");

    let panels = Array.from(allPanels);
    let currentIndex = panels.indexOf(selectedPanel);

    // Click on the next panel div if it exists
    if (currentIndex + 1 < panels.length) {
      panels[currentIndex + 1].classList.add("selected-panel");
      panels[currentIndex + 1].click();
      return; // Exit after handling panels
    } else {
      console.log("No next panel to select.");
    }
  }

  // Fallback: Handle grid-row navigation if no panels or no more panels are available
  let dataGrid = document.querySelectorAll("[tagname='dataGrid']");

  for (let i = 0; i < dataGrid.length; i++) {
    let grid = dataGrid[i];
    let rows = grid.querySelectorAll(".grid-row");
    let found = false;

    // Iterate through the rows to find the selected one
    for (let j = rows.length - 1; j >= 0; j--) {
      if (rows[j].classList.contains("grid-row-selected")) {
        rows[j].classList.remove("grid-row-selected");

        // Simulate click on the next row
        if (j + 1 < rows.length) {
          rows[j + 1].querySelector("div").click();
        }
        found = true;
        break;
      }
    }

    // If no row is selected, simulate click on the first row
    if (!found && rows.length > 0) {
      rows[0].querySelector("div").click();
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
  deactivateLoaders();
}

function navbar_InsertRecord() {
  const inputs = document.querySelectorAll(`[data-table-name] input,select`);
  console.log(inputs);
  inputs.forEach((input) => {
    input.readOnly = false;
    input.disabled = false;
    const field = input.getAttribute("dataset-field-name");
    switch (input.type) {
      case "hidden":
          if (field === "rowid") {
          input.value = "new";
        } 
        break;
    default:
      input.value = "";
    break;
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

function CreateUpdated(DBName, tableName, divLine) {

  const inputs = divLine.querySelectorAll(
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


async function navbar_SaveRecord() {
  try {
    if (document.querySelector("[name=SaveDSBtn]").disabled) {
      showToast("Save button is disabled");
      return;
    }
    console.log("SaveRecord");

    // validation
    // Select all row ID elements (one per dataset record)
    const nextRowIds = document.querySelectorAll("[dataset-field-type='rowid']");

    for (const nextRowId of nextRowIds) {
      console.log("Row being processed:", nextRowId);

      const tableName = nextRowId.getAttribute("dataset-table-name");
      const dbName = nextRowId.getAttribute("dbname");
      const divLine = nextRowId.closest("[tagname='dataSet']");
      const rowIdValue = nextRowId.value;

      // Select all fields in the current record with a data-field-type attribute
      const fields = divLine.querySelectorAll("input,select");
      console.log("fields where are you: ", fields);

      let validationFailed = false;

      for (const fieldElement of fields) {
        const closestDataSet = fieldElement.closest('[tagname="dataSet"]');
        const dataFieldContainer = fieldElement.closest('[data-field]');
        const validationField = fieldElement.getAttribute("validation");

        // Make sure we have a valid JSON field definition
        let fieldJson = {};
        if (dataFieldContainer) {
          try {
            fieldJson = JSON.parse(dataFieldContainer.getAttribute("data-field"));
          } catch (error) {
            console.warn("Invalid JSON in data-field:", error);
            validationFailed = true;
          }
        }

        // display to see the datas
        console.log("rowIdValue: ", rowIdValue);
        console.log("every element: ", fieldElement);
        console.log("fieldJson : ", fieldJson);
        console.log("Attribut validation: ", validationField);

        // Ensure the field is within a dataset and has a data-field JSON config
        if (validationField == "undefined" || validationField == fieldElement.getAttribute("validation")) {
          const datasetTableName = closestDataSet.getAttribute("data-table-name");

          console.log("in 1st condition !!");

          // Compare the tableName in JSON with the dataset container's table name
          if (fieldJson.tableName !== datasetTableName) {
            console.log("in 2nd condition !!");
            validationFailed = true;
            showToast(`Field "${fieldJson.fieldName}" does not match dataset "${datasetTableName}".`);
          }
        } else {
          console.log("else condition !!!");
          validationFailed = true;
        }
      }

      // If any mismatch or error occurred, skip the save for this record
      if (validationFailed) {
        console.warn("Validation failed. Record will not be saved.");
      }

      let result;
      console.log("before verifiying rowIsValue if new");
      if (rowIdValue === "new") {
        let data = await CreateInsert(dbName, tableName, divLine);
        result = await insertRecordDB(dbName, tableName, data);
      } else {
        const data = {
          body: CreateUpdated(dbName, tableName, divLine),
        };
        result = await updateRecordDB(dbName, tableName, rowIdValue, data);
      }

      document.querySelector("[name=SaveDSBtn]").disabled = true;
      return result;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}


// create insert data structure
async function CreateInsert(DBName, tableName,divLine) {
  // create data for insert following this structure  `INSERT INTO ${tableName} (${data.fields}) VALUES (${data.values})`;
  // return data with data.fields and data.values
  const inputs = divLine.querySelectorAll(`#DataSet_${tableName} input`);
  var insertFields = "";
  var insertValues = "";
  for (i = 0; i < inputs.length; i++) {

    if (inputs[i].id && inputs[i].id.includes("__")) {
      continue; // Skip this iteration
    }
    switch (inputs[i].type) {
    
      default:

        // get the field name from the input
        var field = inputs[i].getAttribute("dataset-field-name");
        var subtype = inputs[i].getAttribute("dataset-field-type");
        if (field === "rowid")  continue; // Skip rowid field
        
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

    let filedName = "";
    let operator = "";
    let searchValue = "";
    let idObject = getIdObject();
    if (idObject?.dataGrid) {
      //const gridDiv = document.getElementById(idObject.dataGrid);

      searchGrid(DBName, filedName, operator, searchValue, idObject.dataGrid);
    }

    showToast("Record updated successfully", 5000); // Show toast for 5 seconds
    return updateResult;
  } catch (error) {
    showToast("Error:" + error);
    console.error("Error:", error);
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


