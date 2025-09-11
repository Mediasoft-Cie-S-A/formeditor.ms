
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
  // Parse actions (defensive)
  let actions = [];
  try { actions = JSON.parse(element.getAttribute("actions") || "[]"); }
  catch { actions = []; }

  // Build editor panel
  const div = document.createElement("div");
  div.style.width = "100%";
  div.style.border = "1px solid #ccc";
  div.style.borderRadius = "5px";
  div.style.padding = "10px";
  div.style.overflow = "auto";

  // ---- locate the navigation bar inside this component ----
  let navBar =
    element.querySelector(".ms-nav") ||
    element.querySelector("div[id^='navigationBar_']");

  // If it has no hook class yet, add it so CSS can target it
  if (navBar && !navBar.classList.contains("ms-nav")) {
    navBar.classList.add("ms-nav");
  }

  // ======== STYLE CONTROLS (new) ========
  const styleBox = document.createElement("fieldset");
  styleBox.style.marginBottom = "10px";
  styleBox.style.border = "1px dashed #cfd3dc";
  styleBox.style.borderRadius = "6px";
  styleBox.style.padding = "8px 10px";

  const legend = document.createElement("legend");
  legend.textContent = "Navigation Bar Style";
  legend.style.padding = "0 6px";
  legend.style.color = "#394150";
  styleBox.appendChild(legend);

  const row = document.createElement("div");
  row.style.display = "grid";
  row.style.gridTemplateColumns = "1fr 1fr auto";
  row.style.gap = "8px";
  row.style.alignItems = "center";

  // Variant select
  const labelVariant = document.createElement("label");
  labelVariant.textContent = "Variant";
  const variantSelect = document.createElement("select");
  variantSelect.innerHTML = `
    <option value="classic">Classic</option>
    <option value="pill">Pill</option>
    <option value="segmented">Segmented</option>
    <option value="ghost">Ghost</option>
    <option value="vertical">Vertical</option>
    <option value="floating">Floating</option>
  `;
  labelVariant.appendChild(variantSelect);

  // Anchor select (for floating)
  const labelAnchor = document.createElement("label");
  labelAnchor.textContent = "Anchor";
  const anchorSelect = document.createElement("select");
  anchorSelect.innerHTML = `
    <option value="tl">Top-Left</option>
    <option value="tr">Top-Right</option>
    <option value="bl">Bottom-Left</option>
    <option value="br">Bottom-Right</option>
  `;
  labelAnchor.appendChild(anchorSelect);

  // Compact toggle
  const compactWrap = document.createElement("label");
  const compactChk = document.createElement("input");
  compactChk.type = "checkbox";
  compactChk.style.marginRight = "6px";
  compactWrap.appendChild(compactChk);
  compactWrap.appendChild(document.createTextNode("Compact"));

  row.appendChild(labelVariant);
  row.appendChild(labelAnchor);
  row.appendChild(compactWrap);
  styleBox.appendChild(row);

  // Read current state from dataset/classes
  const readCurrentVariant = () => {
    if (!navBar) return "classic";
    if (navBar.dataset.navVariant) return navBar.dataset.navVariant;
    if (navBar.classList.contains("ms-nav--pill")) return "pill";
    if (navBar.classList.contains("ms-nav--segmented")) return "segmented";
    if (navBar.classList.contains("ms-nav--ghost")) return "ghost";
    if (navBar.classList.contains("ms-nav--vertical")) return "vertical";
    if (navBar.classList.contains("ms-nav--floating")) return "floating";
    return "classic";
  };
  const readCurrentAnchor = () => {
    if (!navBar) return "tr";
    if (navBar.dataset.navAnchor) return navBar.dataset.navAnchor;
    if (navBar.classList.contains("ms-nav--at-tl")) return "tl";
    if (navBar.classList.contains("ms-nav--at-tr")) return "tr";
    if (navBar.classList.contains("ms-nav--at-bl")) return "bl";
    if (navBar.classList.contains("ms-nav--at-br")) return "br";
    return "tr";
  };
  const readCurrentCompact = () => {
    if (!navBar) return false;
    if (navBar.dataset.navCompact) return true;
    return navBar.classList.contains("ms-nav--compact");
  };

  // Initialize controls
  const currentVariant = readCurrentVariant();
  const currentAnchor = readCurrentAnchor();
  const currentCompact = readCurrentCompact();

  variantSelect.value = currentVariant;
  anchorSelect.value = currentAnchor;
  anchorSelect.disabled = currentVariant !== "floating";
  compactChk.checked = currentCompact;

  // Apply function (uses helper if available, else inline)
  const applyStyle = (variant, anchor, compact) => {
    if (!navBar) return;

    if (typeof setNavigationBarStyle === "function") {
      setNavigationBarStyle(navBar, variant, anchor, compact);
      return;
    }

    // Fallback: inline class management
    const rm = [
      "ms-nav--classic", "ms-nav--pill", "ms-nav--segmented", "ms-nav--ghost",
      "ms-nav--vertical", "ms-nav--floating",
      "ms-nav--at-tl", "ms-nav--at-tr", "ms-nav--at-bl", "ms-nav--at-br",
      "ms-nav--compact"
    ];
    navBar.classList.remove(...rm);

    switch (variant) {
      case "pill": navBar.classList.add("ms-nav--pill"); break;
      case "segmented": navBar.classList.add("ms-nav--segmented"); break;
      case "ghost": navBar.classList.add("ms-nav--ghost"); break;
      case "vertical": navBar.classList.add("ms-nav--vertical"); break;
      case "floating":
        navBar.classList.add("ms-nav--floating");
        if (anchor) navBar.classList.add(`ms-nav--at-${anchor}`);
        break;
      default: navBar.classList.add("ms-nav--classic");
    }
    if (compact) navBar.classList.add("ms-nav--compact");

    // Persist so re-render can restore
    navBar.dataset.navVariant = variant;
    navBar.dataset.navAnchor = anchor || "";
    navBar.dataset.navCompact = compact ? "1" : "";
  };

  // Wire events
  variantSelect.addEventListener("change", () => {
    const v = variantSelect.value;
    anchorSelect.disabled = v !== "floating";
    applyStyle(v, anchorSelect.value, compactChk.checked);
  });
  anchorSelect.addEventListener("change", () => {
    applyStyle(variantSelect.value, anchorSelect.value, compactChk.checked);
  });
  compactChk.addEventListener("change", () => {
    applyStyle(variantSelect.value, anchorSelect.value, compactChk.checked);
  });

  // Apply once to normalize classes/dataset
  applyStyle(currentVariant, currentAnchor, currentCompact);

  // Add Style box to panel
  div.appendChild(styleBox);

  // ======== EXISTING UI (Update / Actions) ========
  const saveButton = document.createElement("button");
  saveButton.textContent = "Update";
  saveButton.onclick = () => saveActions(element, content);
  saveButton.style.width = "100%";
  div.appendChild(saveButton);

  const itemdiv = document.createElement("div");
  itemdiv.id = "actions";
  itemdiv.draggable = true;
  div.appendChild(itemdiv);

  const addButton = document.createElement("button");
  addButton.textContent = "Add Action";
  addButton.onclick = () => addAction(element, itemdiv, {});
  addButton.style.width = "100%";
  div.appendChild(addButton);

  // Render existing actions
  actions.forEach((action) => addAction(element, itemdiv, action));

  // Mount panel
  content.appendChild(div);
}

function addAction(element, itemdiv, action) {
  const actionDiv = document.createElement("div");
  actionDiv.id = "action_" + Date.now();
  actionDiv.setAttribute("tagname", "actionContainer");
  actionDiv.className = "action";
  actionDiv.draggable = true;
  actionDiv.style.border = "1px solid #ccc";
  actionDiv.style.borderRadius = "5px";
  actionDiv.style.padding = "5px";
  const actionEvent = document.createElement("select");
  actionEvent.setAttribute("tagname", "actionEvent");

  actionEvent.style.width = "100%";
  actionEvent.options.add(new Option("Write", "write"));
  if (action.actionEvent) {
    actionEvent.value = action.actionEvent;
  }
  actionDiv.appendChild(actionEvent);
  const actionType = document.createElement("select");
  actionType.setAttribute("tagname", "actionType");
  actionType.style.width = "100%";
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
  if (action.actionType) {
    actionType.value = action.actionType;
  }
  actionDiv.appendChild(actionType);
  const actionContent = document.createElement("textarea");
  actionContent.setAttribute("tagname", "actionContent");
  actionContent.setAttribute("placeholder", "Action content [variable:value]");
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

function saveActions(element, content) {
  const actions = [];
  const actionDivs = content.querySelectorAll("[tagname='actionContainer']");
  actionDivs.forEach((actionDiv) => {
    const action = {};
    const actionEvent = actionDiv.querySelector("[tagname='actionEvent']");

    if (actionEvent) {
      console.log("actionEvent: ", actionEvent.value);
      action.actionEvent = actionEvent.value;
    }
    const actionType = actionDiv.querySelector("[tagname='actionType']");

    if (actionType) {
      action.actionType = actionType.value;
    }
    // Get the action content textarea
    const actionContent = actionDiv.querySelector("[tagname='actionContent']");
    if (actionContent) {
      action.actionContent = actionContent.value;
    }
    actions.push(action);
  });
  console.log("Actions to save:", actions);
  element.setAttribute("actions", JSON.stringify(actions));
}

function renderNavigationBar(main) {

  console.log("Rendering navigation Bar");
  main.innerHTML = "";
  main.style.width = "100%";
  // align center
  main.style.textAlign = "center";
  // Create the navigation bar div
  var navigationBar = document.createElement("div");
  navigationBar.id = "navigationBar_" + Date.now();
  navigationBar.type = "navigation-bar";
  navigationBar.style.margin = "auto";
  //   navigationBar.className = "navigation-bar";
  navigationBar.style.display = "block";

  console.log(navigationBar.id)


  // Create buttons and append them to the navigation bar
  var buttons = [

    {
      name: "PreviousDSBtn",
      title: "Previous",
      text: '<p>Previous</p> <i class="fa fa-chevron-left" style="color:#4d61fc;margin-left:-6px"></i>',
      event:
        "navbar_movePrev()",
      id: "btnPrevious",
      disabled: false,

    },
    {
      name: "NextDSBtn",
      title: "Next",
      text: '<p>Next</p><i class="fa fa-chevron-right" style="color:#4d61fc;margin-left:-6px"></i>',
      event:
        "navbar_moveNext()",
      disabled: false,
    },
    {
      name: "EditDSBtn",
      title: "Edit Record",
      text: '<p>Edit</p><i class="fa fa-pencil-square-o" style="color:#4d61fc;margin-left:-6px"></i>',
      event: "navbar_EditRecord( false)",
      disabled: false,
    },
    {
      name: "InsertDSBtn",
      title: "New Record",
      text: '<p>New Record</p><i class="fa fa-plus" style="color:green;margin-left:-6px"></i>',
      event:
        "navbar_InsertRecord()",
      disabled: false,
    },
    {
      name: "CopyDSBtn",
      title: "Copy",
      text: '<p>Copy</p><i class="fa fa-files-o" style="color:#4d61fc;margin-left:-6px"></i>',
      event:
        "navbar_CopyRecord()",
      disabled: false,
    },
    {
      name: "DeleteDSBtn",
      title: "Delete",
      text: '<p>Delete</p><i class="fa fa-trash" style="color:#e74c3c; margin-left: -6px;"></i>',
      event: "navbar_DeleteRecord()",
      disabled: false,
    },
    {
      name: "SaveDSBtn",
      title: "Save Record",
      text: '<p>Save</p><i class="fa fa-floppy-o" style="color:red;margin-left:-6px"></i>',
      event: "navbar_SaveRecord()",
      disabled: true,
    },
    {
      name: "CancelDSBtn",
      title: "Cancel",
      text: '<p>Cancel</p><i class="fa fa-ban" style="color:#4d61fc;margin-left:-6px"></i>',
      event: "navbar_CancelEdit()",
      disabled: true,
    },
    {
      name: "SaveAllDSBtn",
      title: "Save All and Exit",
      text: '<p>Save All</p><i class="fa fa-check-circle" style="color:green; margin-left: -6px;"></i>',
      event: "handleSaveAllAndExit()",
      disabled: true,
    },
  ];
  var htm = "";
  //for the dom2json is mandatory to create a html for the events
  buttons.forEach((buttonInfo) => {
    htm += `<button id="${buttonInfo.id || ''}" name='${buttonInfo.name}' title="${buttonInfo.title
      }" onclick="${buttonInfo.event.trim()}" style="width:150px;" ${buttonInfo.disabled ? 'disabled' : ''
      } class=${buttonInfo.disabled ? 'disabled' : ''} >${buttonInfo.text}</button>`;
  });
  navigationBar.innerHTML += "<div >" + htm + "</div>";

  main.appendChild(navigationBar);
}


function navbar_movePrev() {
  console.log("Moving prev");
  let allPanels = document.querySelectorAll("[tagname='dataTable'] > .grid-body > .grid-row");
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
      currentIndex = currentIndex - 1
      panels[currentIndex].classList.add("selected-panel");
      panels[currentIndex].click();
      //updatePreviousButtonState(currentIndex-1 > 0); 
      return; // Exit after handling panels
    } else if (currentIndex == 0) {
      currentIndex = panels.length - 1;
      panels[currentIndex].classList.add("selected-panel");
      panels[currentIndex].click();
      return;
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
  console.log("next has been pressed");

  const modal = document.getElementById("editBigModal");

  // Handle selected-panel logic
  let allPanels = document.querySelectorAll("[tagname='dataTable'] > .grid-body > .grid-row");
  let selectedPanel = document.querySelector(".selected-panel");

  if (!selectedPanel && allPanels.length > 0) {
    // If no panel is selected, consider the first panel as selected
    selectedPanel = allPanels[0];
    selectedPanel.classList.add("selected-panel");
  }

  if (selectedPanel) {
    console.log("There is a selected panel"); //Should always print
    selectedPanel.classList.remove("selected-panel");

    let panels = Array.from(allPanels);
    let currentIndex = panels.indexOf(selectedPanel);

    // Click on the next panel div if it exists
    currentIndex = currentIndex + 1;
    if (currentIndex < panels.length) {
      panels[currentIndex].classList.add("selected-panel");
      panels[currentIndex].click();
    } else if (currentIndex === panels.length) {
      currentIndex = 0;
      panels[currentIndex].classList.add("selected-panel");
      panels[currentIndex].click();
    } else {
      console.log("current index : " + currentIndex);
      console.log("length : " + panels.length);
      console.log("No next panel to select.");
    }
  }


  /*
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
      */
}


function changeInputReadOnly(readOnly) {

  const inputs = document.querySelectorAll(
    `[data-table-name] input[dataset-field-name]`
  );

  inputs.forEach((input) => {
    const tableLabel = input.getAttribute("dataset-table-name");
    input.readOnly = readOnly;
    input.disabled = readOnly;
  });

  document.querySelector("[name=SaveDSBtn]").disabled = readOnly;
}

function loadBigModalWithJson(jsonResponse) {

  onCreateBigModal();
  actionSaveAllButton(false);

  changeInputReadOnly(false)


  const modal = document.getElementById("editBigModal");
  let dataSetNavigator = document.querySelector("[tagname='dataSetNavigation']");
  const parentDiv = dataSetNavigator.parentElement.cloneNode(true);
  dataSetNavigator = parentDiv.querySelector("[tagname='dataSetNavigation']");

  const previousButton = parentDiv.querySelector('[name="PreviousDSBtn"]');
  const nextButton = parentDiv.querySelector('[name="NextDSBtn"]');
  const editButton = parentDiv.querySelector('[name="EditDSBtn"]');
  const insertButton = parentDiv.querySelector('[name="InsertDSBtn"]');
  const copyButton = parentDiv.querySelector('[name="CopyDSBtn"]');
  const deleteButton = parentDiv.querySelector('[name="DeleteDSBtn"]');
  const cancelButton = parentDiv.querySelector('[name="CancelDSBtn"]');
  const saveButton = parentDiv.querySelector('[name="SaveDSBtn"]');
  const saveAllButton = parentDiv.querySelector('[name="SaveAllDSBtn"]');



  let i = 0;

  cancelButton.onclick = function (event) {
    navbar_CancelEdit();
  };

  saveButton.onclick = async function (event) {
    event.preventDefault();
    console.log('New save logic here');
    i++;
    // save the data and load the next


    try {
      if (isSaveButtonDisabled()) {
        showToast("Save button is disabled");
        return;
      }

      disableSaveButton();
      activateLoaders();

      const rowIds = getActiveModalRowIds(modal);
      if (rowIds.length === 0) {
        deactivateLoaders();
        enableSaveButton(); // re-enable if error
        showToast("No dataset found to save");
        return;
      }

      console.log("Row IDs to save:");
      console.log(rowIds);
      for (const rowIdElement of rowIds) {
        const result = await prepareAndSaveRecord(rowIdElement);
        if (!result) {
          // Save failed or validation failed
          console.error("Save failed for rowId:", rowIdElement.value);
          enableSaveButton(); // re-enable if error
          deactivateLoaders();
          return;
        }
      }

      if (i < jsonResponse.length) {
        const selected = jsonResponse[i];

        for (const [key, value] of Object.entries(selected)) {
          if (key !== "rowid") { // Skip rowid as it is handled by the system
            const field = parentDiv.querySelector(`[dataset-field-name="${key}"]`);
            if (field) {
              field.value = value !== null ? value : '';
            }
          }
        }
        deactivateLoaders();
        enableSaveButton();
      } else {
        deactivateLoaders();
        showToast("No more records to save, closing modal.");
        console.log("No more records to save, closing modal.");
        loadFormData(activeForm.objectId, document.getElementById('renderContainer'), true);
        onCloseBigModal();
      }
    } catch (error) {
      handleSaveError(error);
      enableSaveButton();
    }
  };

  saveAllButton.onclick = async function (event) {
    event.preventDefault();
    console.log('New save all logic here');
    handleSaveAllAndExit(parentDiv, modal, jsonResponse, i);
  }


  const modalContent = modal.querySelector(".modal-content");
  modalContent.innerHTML = '';
  // set in parentDiv the id of original parent and next sibling


  modalContent.appendChild(parentDiv);

  modal.style.display = "flex";

  //clear the inputs in the modal
  const inputs = modal.querySelectorAll(`[data-table-name] input,select`);
  inputs.forEach((input) => {
    const field = input.getAttribute("dataset-field-name");
    switch (input.type) {
      case "hidden":
        if (field === "rowid") {
          input.value = "new";
        }
        break;
      default:
        input.value = "";
        input.readOnly = false; // Make input editable
        break;
    }
  });


  console.log("jsonResponse inside big modal: ", jsonResponse);
  const selected = jsonResponse[i];


  for (const [key, value] of Object.entries(selected)) {
    if (key !== "rowid") { // Skip rowid as it is handled by the system
      const field = parentDiv.querySelector(`[dataset-field-name="${key}"]`);
      if (field) {
        field.value = value !== null ? value : '';
      }
    }
  }
}

function loadBigModalFromInputs() {
  onCreateBigModal();

  const modal = document.getElementById("editBigModal");
  let dataSetNavigator = document.querySelector("[tagname='dataSetNavigation']");
  const parentDiv = dataSetNavigator.parentElement.cloneNode(true);
  dataSetNavigator = parentDiv.querySelector("[tagname='dataSetNavigation']");

  const modalContent = modal.querySelector(".modal-content");
  modalContent.innerHTML = '';
  // set in parentDiv the id of original parent and next sibling


  modalContent.appendChild(parentDiv);

  changeInputReadOnly(false)

  modal.style.display = "flex";
}

function onCreateBigModal() {
  actionPreviousButton(true);
  actionNextButton(true);
  actionEditButton(true);
  actionInsertButton(true);
  actionCopyButton(true);
  actionDeleteButton(true);

  actionSaveButton(false);
  actionCancelButton(false);

  actionSaveAllButton(true);
  createEditBigModal();
}

function onCloseBigModal() {
  const modal = document.getElementById("editBigModal");
  if (modal) {
    modal.remove();
  }

  actionPreviousButton(false);
  actionNextButton(false);
  actionEditButton(false);
  actionInsertButton(false);
  actionCopyButton(false);
  actionDeleteButton(false);

  actionSaveButton(true);
  actionCancelButton(true);
  actionSaveAllButton(true);

  changeInputReadOnly(true);
}


function handleSaveAllAndExit(parentDiv = undefined, modal = undefined, jsonResponse = [], i = 0) {
  if (typeof parentDiv === 'undefined' || typeof modal === 'undefined' || !Array.isArray(jsonResponse)) {
    console.error("Missing parentDiv, modal, or jsonResponse");
    return;
  }

  disableSaveButton();

  (async function saveAll() {
    try {
      const total = jsonResponse.length;
      for (let idx = i; idx < total; idx++) {
        const selected = jsonResponse[idx];

        for (const [key, value] of Object.entries(selected)) {
          if (key !== "rowid") {
            const field = parentDiv.querySelector(`[dataset-field-name="${key}"]`);
            if (field) {
              field.value = value !== null ? value : '';
            }
          }
        }

        const rowIds = getActiveModalRowIds(modal);
        if (rowIds.length === 0) {
          showToast(`No dataset found to save at index ${idx}`);
          continue;
        }

        let allSuccessful = true;
        for (const rowIdElement of rowIds) {
          const result = await prepareAndSaveRecord(rowIdElement);
          if (!result) {
            console.error(`Save failed for rowId at index ${idx}`);
            showToast(`Save failed at index ${idx}`);
            allSuccessful = false;
            break;
          }
        }

        if (!allSuccessful) break;

        i++; // increment global index
      }

      showToast("All records processed. Closing modal.");
      onCloseBigModal();
      loadFormData(activeForm.objectId, document.getElementById('renderContainer'), true);

    } catch (err) {
      console.error("Save All error:", err);
      handleSaveError(err);
    } finally {
      enableSaveButton();
    }
  })();
}


function navbar_EditRecord() {
  actionPreviousButton(true);
  actionNextButton(true);
  actionEditButton(true);
  actionInsertButton(true);
  actionCopyButton(true);
  actionDeleteButton(true);
  actionSaveAllButton(true);

  actionSaveButton(false);
  actionCancelButton(false);

  loadBigModalFromInputs();

}

function navbar_CancelEdit() {

  onCloseBigModal();
}

function navbar_InsertRecord() {
  //navbar_EditRecord(false);

  actionPreviousButton(true);
  actionNextButton(true);
  actionEditButton(true);
  actionInsertButton(true);
  actionCopyButton(true);
  actionDeleteButton(true);
  actionSaveAllButton(true);

  actionSaveButton(false);
  actionCancelButton(false);



  loadBigModalFromInputs();
  const modal = document.getElementById("editBigModal");
  const inputs = modal.querySelectorAll(`[data-table-name] input,select`);
  inputs.forEach((input) => {
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

async function navbar_DeleteRecord() {
  console.log("Delete record");

  try {
    const confirmation = confirm("Are you sure you want to delete this record?");
    if (!confirmation) return;

    const dataSetNavigator = document.querySelector("[tagname='dataSetNavigation']");
    const datasetDiv = document.querySelector("[tagname='dataSet']");
    if (!datasetDiv) {
      showToast("No dataset found to delete");
      return;
    }

    const rowIdElement = datasetDiv.querySelector("[dataset-field-type='rowid']");
    if (!rowIdElement) {
      showToast("No record selected to delete");
      return;
    }

    const rowId = rowIdElement.value;
    const tableName = rowIdElement.getAttribute("dataset-table-name");
    const dbName = rowIdElement.getAttribute("dbname");
    const actions = dataSetNavigator.getAttribute("actions");

    if (!rowId || rowId === "new") {
      showToast("Cannot delete unsaved record");
      return;
    }

    // Perform the delete operation
    const result = await deleteRecordDB(dbName, tableName, rowId, actions);

    console.log("Result delete : " + result?.success);

    if (result?.message) {
      showToast(result?.message);
      loadFormData(activeForm.objectId, document.getElementById('renderContainer'), true);
    } else {
      showToast("Failed to delete record");
    }

    return result;

  } catch (error) {
    console.error("Error deleting record:", error);
    showToast("Error occurred while deleting record");
  }
}


async function navbar_SaveRecord() {
  const modal = document.getElementById("editBigModal");
  if (!modal || modal.style.display === "none") return;

  try {
    if (isSaveButtonDisabled()) {
      showToast("Save button is disabled");
      return;
    }

    disableSaveButton();

    const rowIds = getActiveModalRowIds(modal);
    if (rowIds.length === 0) {
      showToast("No dataset found to save");
      return;
    }

    for (const rowIdElement of rowIds) {
      const result = await prepareAndSaveRecord(rowIdElement);
      if (!result) {
        // Save failed or validation failed
        console.error("Save failed for rowId:", rowIdElement.value);
        enableSaveButton(); // re-enable if error
        return;
      }


    }

    navbar_CancelEdit();
    loadFormData(activeForm.objectId, document.getElementById('renderContainer'), true);


  } catch (error) {
    handleSaveError(error);
    enableSaveButton();
  }
}


function CreateUpdated(DBName, tableName, divLine) {

  const inputs = divLine.querySelectorAll(
    `#DataSet_${tableName} input[dataset-field-name]`
  );


  let fields = [];
  let values = [];
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
        fields.push(field);
        values.push(value);

      }
    }
  });

  // Format grouped values and ensure only the last non-empty value is kept
  for (const prefix in fieldGroups) {
    const valuesArray = fieldGroups[prefix];
    const valuesString = valuesArray
      .filter((v) => v !== undefined && v !== "")
      .join(";");

    // Add to updateFields only if valuesString is not empty
    if (valuesString) {
      fields.push(prefix); // Add the prefix as a field
      values.push(valuesString); // Add the concatenated values

    }
  }

  // Return the final formatted string
  return { fields: fields, values: values };
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

/* Helper functions for Save Button state management */
function isSaveButtonDisabled() {
  const btn = document.querySelector("[name=SaveDSBtn]");
  return btn.disabled;
}

function disableSaveButton() {
  const btn = document.querySelector("[name=SaveDSBtn]");
  if (btn) btn.disabled = true;
}

function enableSaveButton() {
  const btn = document.querySelector("[name=SaveDSBtn]");
  if (btn) btn.disabled = false;
}

function getActiveModalRowIds(modal = document) {
  const datasetDiv = modal.querySelector("[tagname='dataSet']");
  if (!datasetDiv) return [];
  return datasetDiv.querySelectorAll("[dataset-field-type='rowid']:not([disabled])");
}

function collectFieldElements(rowElement) {
  const divLine = rowElement.closest("[tagname='dataSet']");
  return divLine ? divLine.querySelectorAll("input,select") : [];
}

function validateFields(fields) {
  let hasError = false;
  for (const field of fields) {
    const fieldName = field.getAttribute("dataset-field-name");
    const regexRule = field.getAttribute("validation");
    const value = field.value?.trim();

    if (!fieldName || !value) continue;
    if (!regexRule || regexRule === "undefined") continue;

    const regex = new RegExp(regexRule);
    const isValid = regex.test(value);

    if (!isValid) {
      console.log(`Value: ${value}, Regex: ${regexRule}`);
      console.log(`Validation failed for field: ${field.getAttribute("dataset-field-name")}`);
      hasError = true;
      field.style.border = "2px solid red";
    } else {
      field.style.border = "";
    }
  }

  return !hasError;
}

async function prepareAndSaveRecord(rowIdElement) {
  const tableName = rowIdElement.getAttribute("dataset-table-name");
  const dbName = rowIdElement.getAttribute("dbname");
  const rowIdValue = rowIdElement.value;
  const divLine = rowIdElement.closest("[tagname='dataSet']");
  const fields = collectFieldElements(rowIdElement);

  const isValid = validateFields(fields);
  if (!isValid) {
    showToast("Validation error, please fix the highlighted fields.");
    return false;
  }

  const actions = document.querySelector("[tagname='dataSetNavigation']").getAttribute("actions");

  if (rowIdValue === "new") {
    const data = await CreateInsert(dbName, tableName, divLine);
    return await insertRecordDB(dbName, tableName, JSON.stringify(data), actions);
  } else {
    const data = CreateUpdated(dbName, tableName, divLine);
    return await updateRecordDB(dbName, tableName, rowIdValue, JSON.stringify(data), actions);

  }
}

function handleSaveError(error) {
  console.error("Error during save:", error);
  showToast("An error occurred while saving.");
}
/* End of Helper functions for Save Button state management */

// create insert data structure
async function CreateInsert(DBName, tableName, divLine) {
  // create data for insert following this structure  `INSERT INTO ${tableName} (${data.fields}) VALUES (${data.values})`;
  // return data with data.fields and data.values
  const inputs = divLine.querySelectorAll(`#DataSet_${tableName} input`);
  var insertFields = [];
  var insertValues = [];
  for (i = 0; i < inputs.length; i++) {

    if (inputs[i].id && inputs[i].id.includes("__")) {
      continue; // Skip this iteration
    }
    switch (inputs[i].type) {

      default:

        // get the field name from the input
        var field = inputs[i].getAttribute("dataset-field-name");
        var subtype = inputs[i].getAttribute("dataset-field-type");
        if (field === "rowid") continue; // Skip rowid field

        insertFields.push(field); // Add field name to insertFields;
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
          insertValues.push(sequenceValue); // Add sequence value
        } else {
          insertValues.push(inputs[i].value); // Add input value
        }

        break;
    } // end switch

    //inputs[i].readOnly = true;
  } // end for


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

async function updateRecordDB(DBName, tableName, nextRowId, data, actions) {
  try {
    const response = await fetch(
      `/update-record/${DBName}/${tableName}/${nextRowId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        // add to the body data and action if it exists
        body: JSON.stringify({
          data: data,
          actions: actions,
        }),

      }
    );

    if (!response.ok) {
      showToast(`HTTP error! status: ${response.status}`);
      return false; // Return null if the response is not OK
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

async function insertRecordDB(DBName, tableName, data, actions, apikey) {
  try {
    const response = await fetch(`/insert-record/${DBName}/${tableName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api_key": apikey || "", // Include API key if provided
        // Include other headers as needed, like authentication tokens

      },
      // Add the data and action to the body
      body: JSON.stringify({
        data: data,
        actions: actions,
      }),
    });

    if (!response.ok) {
      showToast(`HTTP error! Status: ${response.status}`);
      return false;
    }

    const result = await response.json();
    showToast("Record inserted successfully", 5000); // Show toast for 5 seconds
    return result;
  } catch (error) {
    showToast("Error inserting record:" + error);
  }
}

async function deleteRecordDB(DBName, tableName, rowId, actions) {
  console.log("New delete record from data set component navigate");
  try {
    const response = await fetch(
      `/delete-record/${DBName}/${tableName}/${rowId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actions: actions,
        }),
      }
    );

    if (!response.ok) {
      showToast(`HTTP error! Status: ${response.status}`);
      return { success: false };
    }

    const result = await response.json();
    console.log(`result async record db : ${result}`);
    console.log(result);

    let filedName = "";
    let operator = "";
    let searchValue = "";
    let idObject = getIdObject();
    console.log("idObject : " + idObject?.dataGrid)
    console.log(idObject)
    if (idObject?.dataGrid) {
      searchGrid(DBName, filedName, operator, searchValue, idObject.dataGrid);
    }

    return result;

  } catch (error) {
    console.error("Error deleting record:", error);
    return { success: false };
  }
}

/*
Deactivate and activate buttons
*/

function actionPreviousButton(disabled) {
  const previousButton = document.querySelector("[name=PreviousDSBtn]");
  if (previousButton) {
    previousButton.disabled = disabled;
    //Grey out the button if disabled
    if (disabled) {
      previousButton.classList.add("disabled");
    } else {
      previousButton.classList.remove("disabled");
    }
  }
}


function actionNextButton(disabled) {
  const nextButton = document.querySelector("[name=NextDSBtn]");
  helperAction(disabled, nextButton);
}

function actionEditButton(disabled) {
  const editButton = document.querySelector("[name=EditDSBtn]");
  helperAction(disabled, editButton);
}

function actionInsertButton(disabled) {
  const insertButton = document.querySelector("[name=InsertDSBtn]");
  helperAction(disabled, insertButton);
}

function actionCopyButton(disabled) {
  const copyButton = document.querySelector("[name=CopyDSBtn]");
  helperAction(disabled, copyButton);
}

function actionSaveButton(disabled) {
  const saveButton = document.querySelector("[name=SaveDSBtn]");
  helperAction(disabled, saveButton);

}

function actionCancelButton(disabled) {
  const cancelButton = document.querySelector("[name=CancelDSBtn]");
  helperAction(disabled, cancelButton);
}

function actionDeleteButton(disabled) {
  const deleteButton = document.querySelector("[name=DeleteDSBtn]");
  helperAction(disabled, deleteButton);
}

function actionSaveAllButton(disabled) {
  const saveAllButton = document.querySelector("[name=SaveAllDSBtn]");
  helperAction(disabled, saveAllButton);
}

function helperAction(disabled, button) {
  if (button) {
    button.disabled = disabled;
    if (disabled) {
      button.classList.add("disabled");
    } else {
      button.classList.remove("disabled");
    }
  }
}

function setNavigationBarStyle(barEl, variant = 'classic', anchor /* tl|tr|bl|br */, compact /* bool */) {
  if (!barEl) return;
  const rm = ['ms-nav--classic', 'ms-nav--pill', 'ms-nav--segmented', 'ms-nav--ghost', 'ms-nav--vertical', 'ms-nav--floating',
    'ms-nav--at-tl', 'ms-nav--at-tr', 'ms-nav--at-bl', 'ms-nav--at-br', 'ms-nav--compact'];
  barEl.classList.remove(...rm);

  switch (variant) {
    case 'pill': barEl.classList.add('ms-nav--pill'); break;
    case 'segmented': barEl.classList.add('ms-nav--segmented'); break;
    case 'ghost': barEl.classList.add('ms-nav--ghost'); break;
    case 'vertical': barEl.classList.add('ms-nav--vertical'); break;
    case 'floating':
      barEl.classList.add('ms-nav--floating');
      if (anchor) barEl.classList.add(`ms-nav--at-${anchor}`); // tl|tr|bl|br
      break;
    default: barEl.classList.add('ms-nav--classic');
  }
  if (compact) barEl.classList.add('ms-nav--compact');

  // persist per bar (for re-rendering)
  barEl.dataset.navVariant = variant;
  barEl.dataset.navAnchor = anchor || '';
  barEl.dataset.navCompact = compact ? '1' : '';
}

function applyNavClassesFromDataset(barEl) {
  if (!barEl) return;
  setNavigationBarStyle(
    barEl,
    barEl.dataset.navVariant || 'classic',
    barEl.dataset.navAnchor || '',
    !!barEl.dataset.navCompact
  );
}

