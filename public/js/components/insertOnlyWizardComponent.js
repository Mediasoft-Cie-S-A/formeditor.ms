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

/**
 * Data storage
 * - wizard: boolean flag ("true"/"false") marking wizard-enabled panels.
 * - apikey: plain string storing the API key associated with the wizard.
 * - data-current-step: numeric string tracking the currently visible step.
 */

const e = require("express");

// This function creates a new HTML element of a given type, sets its ID and tag name, and makes it draggable.
function createElementInsertWizard(type) {
    var main = document.createElement("div");
    main.className = "form-container";
    main.id = type + Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName = type;
    const list = document.getElementById("ContentTableList");
    const detailsDiv = document.getElementById("tableDetails");

    return main;
}

function editElementInsertWizard(type, element, content) {
    const propertiesBar = document.getElementById("propertiesBar");


    editElementDataSet(type, element, content);
    // add checkbok apple class for true or not of wizard attribute
    const wizardCheckbox = document.createElement("input");
    wizardCheckbox.type = "checkbox";
    wizardCheckbox.tagName = "wizard";
    wizardCheckbox.className = "apple-switch";

    wizardCheckbox.checked = element.getAttribute("wizard") === "true";
    const wizardLabel = document.createElement("label");
    wizardLabel.textContent = "Wizard";

    wizardLabel.style.fontWeight = "bold";
    wizardLabel.style.fontSize = "16px";
    wizardLabel.prepend(wizardCheckbox);
    propertiesBar.appendChild(wizardLabel);
    wizardCheckbox.onchange = function (event) {
        if (wizardCheckbox.checked) {
            element.setAttribute("wizard", "true");
        } else {
            element.setAttribute("wizard", "false");
        }
        renderInsertOnlyWizard(element);
    }

    // add apikey input for apikey attribute
    const apikeyInput = document.createElement("input");
    apikeyInput.type = "text";
    apikeyInput.tagName = "apikey";
    apikeyInput.style.marginRight = "10px";
    apikeyInput.value = element.getAttribute("apikey") || "";
    apikeyInput.style.width = "200px";
    const apikeyLabel = document.createElement("label");
    apikeyLabel.textContent = "API Key:";
    apikeyLabel.style.marginRight = "10px";
    apikeyLabel.style.fontWeight = "bold";
    apikeyLabel.style.fontSize = "16px";
    apikeyLabel.appendChild(apikeyInput);
    propertiesBar.appendChild(apikeyLabel);
    apikeyInput.onchange = function (event) {
        element.setAttribute("apikey", apikeyInput.value);
        renderInsertOnlyWizard(element);
    }


}

function renderInsertOnlyWizard(element) {
    //get apikey attribute
    const apikey = element.getAttribute("apikey") || "";
    const wizard = element.getAttribute("wizard") === "true";
    const dataset = JSON.parse(element.getAttribute("dataset") || "[]");
    const labels = JSON.parse(element.getAttribute("labels") || "[]");
    element.innerHTML = "";
    if (!wizard) {
        renderDataSet(element);
        // add insert button
        const insertButton = document.createElement("button");
        insertButton.textContent = "Insert";
        insertButton.style.marginTop = "10px";
        insertButton.name = "SaveDSBtn";
        insertButton.className = "btn btn-primary";
        element.appendChild(insertButton);

        insertButton.onclick = function () {
            helperAction(disabled, insertButton);
        }
        return;
    } else {
        // generate 
        renderDataSet(element);

        // add to element the class iwz-container and store the orginal class in data-orig-class
        element.classList.add("iwz-container");
        // hidden all the panel in element except the first one
        const panels = element.querySelectorAll(".panel");

        // set in element the index of the first panel visible (display != none)
        const firstVisiblePanelIndex = Array.from(panels).findIndex(panel => panel.style.display !== "none");
        element.setAttribute("data-current-step", firstVisiblePanelIndex);
        // hide all the others panels
        panels.forEach((panel, index) => {
            panel.classList.add("iwz-card");
            // get input,select,textarea inside panel and add class iwz-input
            const inputs = panel.querySelectorAll("input, select, textarea");
            inputs.forEach(input => {
                input.classList.add("iwz-input");
                // set editable true for input
                input.readOnly = false;
                input.disabled = false;
            });
            if (index !== firstVisiblePanelIndex) {
                panel.style.display = "none";
            }
        });
        // center the card in the container with the parent element of first panel
        const parent = panels[firstVisiblePanelIndex].parentElement;
        parent.style.display = "flex";
        parent.style.justifyContent = "center";
        parent.style.alignItems = "center";
        parent.style.minHeight = "300px";
        // add steps container
        const stepsBar = document.createElement("div");
        stepsBar.className = "iwz-steps";
        element.appendChild(stepsBar);
        for (let i = firstVisiblePanelIndex; i < panels.length; i++) {
            const chip = document.createElement("div");
            chip.className = "iwz-step-chip" + (i === firstVisiblePanelIndex ? " active" : "");
            chip.textContent = `${i}/${panels.length}`;
            stepsBar.appendChild(chip);
        }

        // steps navigation
        const nav = document.createElement("div");
        nav.className = "iwz-nav";
        element.appendChild(nav);
        const insertButton = document.createElement("button");
        insertButton.textContent = "Insert";
        insertButton.style.marginTop = "10px";
        insertButton.name = "SaveDSBtn";
        insertButton.className = "iwz-btn";
        insertButton.style.display = "none";
        // add icon to the button
        const insertIcon = document.createElement("i");
        insertIcon.className = "fa fa-save";
        insertIcon.style.marginRight = "5px";
        insertButton.prepend(insertIcon);
        element.appendChild(insertButton);
        insertButton.onclick = async function (event) {
            console.log("insertButton clicked");
            console.log(dataset);
            if (dataset.length === 0) {
                alert("Please select a valid dataset");
                return;
            }
            const dbName = dataset[0].DBName || "";
            const tableName = dataset[0].tableName || "";
            console.log("dbName:", dbName, "tableName:", tableName);
            if (dbName.length === 0 || tableName.length === 0) {
                alert("Please select a valid dataset with database and table name");
                return;
            }

            const actions = [];
            const data = await CreateInsert(dbName, tableName, element);
            console.log("data to insert:", data);
            await insertRecordDB(dbName, tableName, JSON.stringify(data), actions, apikey);
        }
        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.className = "iwz-btn";
        // add icon to the button
        const prevIcon = document.createElement("i");
        prevIcon.className = "fa fa-arrow-left";
        prevIcon.style.marginRight = "5px";
        prevButton.prepend(prevIcon);
        nav.appendChild(prevButton);
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.className = "iwz-btn";
        // add icon to the button
        const nextIcon = document.createElement("i");
        nextIcon.className = "fa fa-arrow-right";
        nextIcon.style.marginRight = "5px";
        nextButton.appendChild(nextIcon);
        nav.appendChild(nextButton);

        prevButton.onclick = function () {
            const currentStep = parseInt(element.getAttribute("data-current-step")) || 0;
            if (currentStep > 0) {
                panels[currentStep].style.display = "none";
                panels[currentStep - 1].style.display = "flex";
                element.setAttribute("data-current-step", currentStep - 1);
                // change the active class on stepsBar
                const chips = stepsBar.querySelectorAll(".iwz-step-chip");
                chips.forEach((chip, index) => {
                    chip.classList.toggle("active", index === currentStep - 1);
                });
            }
            //hide the insert button
            const insertButton = element.querySelector("button[name='SaveDSBtn']");
            if (insertButton) {
                insertButton.style.display = "none";
            }
            // show the next button
            nextButton.style.display = "inline-block";
        }
        nextButton.onclick = function () {
            const currentStep = parseInt(element.getAttribute("data-current-step")) || 1;
            if (currentStep < panels.length - 1) {
                panels[currentStep].style.display = "none";
                panels[currentStep + 1].style.display = "flex";
                element.setAttribute("data-current-step", currentStep + 1);
                // change the active class on stepsBar
                const chips = stepsBar.querySelectorAll(".iwz-step-chip");
                chips.forEach((chip, index) => {
                    chip.classList.toggle("active", index === currentStep);
                });
                // validate the inputs in the panel if any input is invalid do not go to next panel
                const inputs = panels[currentStep].querySelectorAll("input, select, textarea");
                let valid = true;
                inputs.forEach(input => {
                    if (!input.value.length === 0) {
                        valid = false;
                    }
                });
                if (!valid) {
                    // draw a red border around the panel
                    panels[currentStep].style.border = "2px solid red";
                }
            } else {
                // hide the next button
                nextButton.style.display = "none";
                // show the insert button
                insertButton.style.display = "inline-block";
                // add insert button

            }
        }
    } // end else wizard
}
