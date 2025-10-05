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

//Use to read database after insert and delete in dataSetComponentNavigate.js
let activeForm = null;
let formsData = [];
let formsViewMode = 'grid';

function loadForms() {
    console.log('Loading forms...');
    apiFetch('/list-forms')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(forms => {
            formsData = Array.isArray(forms) ? forms : [];
            renderForms();
        })// Handle the response
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function renderForms() {
    const list = document.getElementById('componentsListBody');
    const panel = document.getElementById('formsPanelContainer');
    const emptyState = document.getElementById('formsEmptyState');

    if (!list || !panel) {
        return;
    }

    list.innerHTML = '';
    panel.innerHTML = '';

    const filters = getFormFilters();
    const filteredForms = formsData.filter(form => matchesFormFilters(form, filters));

    filteredForms.forEach(form => {
        list.appendChild(buildFormRow(form));
        panel.appendChild(buildFormCard(form));
    });

    const hasResults = filteredForms.length > 0;
    if (emptyState) {
        emptyState.classList.toggle('d-none', hasResults);
        emptyState.textContent = formsData.length === 0 ? 'No forms available.' : 'No forms match the current filters.';
    }

    updateFormsView();
}

function buildFormRow(form) {
    const container = document.createElement('tr');
    container.className = 'portal-container';
    container.setAttribute('data-form-id', form.objectId);
    container.setAttribute('title', 'double click to view form');

    const itemId = document.createElement('td');
    itemId.innerHTML = `<b>${form.objectId}</b>`;
    container.appendChild(itemId);

    const itemName = document.createElement('td');
    itemName.innerHTML = `<b>${form.objectName}</b>`;
    container.appendChild(itemName);

    const itemSlug = document.createElement('td');
    itemSlug.innerHTML = `<i>${form.objectSlug}</i>`;
    container.appendChild(itemSlug);

    const itemUser = document.createElement('td');
    itemUser.innerHTML = `<i>${form.userCreated}</i>`;
    container.appendChild(itemUser);

    const itemModified = document.createElement('td');
    itemModified.innerHTML = `<i>${form.userModified}</i>`;
    container.appendChild(itemModified);

    const itemDate = document.createElement('td');
    itemDate.innerHTML = `<i>${form.modificationDate}</i>`;
    container.appendChild(itemDate);

    const itemActions = document.createElement('td');
    const { showButton, editButton, deleteButton } = createFormActionButtons(form);
    itemActions.appendChild(showButton);
    itemActions.appendChild(editButton);
    itemActions.appendChild(deleteButton);
    container.appendChild(itemActions);

    container.addEventListener('dblclick', event => {
        helperLoadContainer(event, form.objectId);
        const showTab = document.querySelector('.nav-tabs a[href="#renderForm"]');
        activeForm = form;
        if (showTab) {
            showTab.click();
        }
    });

    container.addEventListener('click', function (e) {
        e.preventDefault();
        if (e.target.className === 'portal-list-item') {
            showHint(`ID:${form.objectId}<br>User:${form.userCreated}<br>Last mod:${form.modificationDate}`, 5000, e);
        }
    });

    return container;
}

function buildFormCard(form) {
    const column = document.createElement('div');
    column.className = 'col-12 col-md-6 col-xl-4';

    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm';
    card.setAttribute('data-form-id', form.objectId);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.innerHTML = `
        <h5 class="card-title mb-2">${form.objectName}</h5>
        <h6 class="card-subtitle text-muted mb-3">${form.objectSlug}</h6>
        <dl class="row mb-0 small">
            <dt class="col-5">ID</dt>
            <dd class="col-7 text-end">${form.objectId}</dd>
            <dt class="col-5">Created by</dt>
            <dd class="col-7 text-end">${form.userCreated || '-'}</dd>
            <dt class="col-5">Modified by</dt>
            <dd class="col-7 text-end">${form.userModified || '-'}</dd>
            <dt class="col-5">Modified on</dt>
            <dd class="col-7 text-end">${form.modificationDate || '-'}</dd>
        </dl>
    `;

    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer bg-transparent border-0 pt-0 d-flex gap-2 flex-wrap';
    const { showButton, editButton, deleteButton } = createFormActionButtons(form);
    cardFooter.appendChild(showButton);
    cardFooter.appendChild(editButton);
    cardFooter.appendChild(deleteButton);

    card.appendChild(cardBody);
    card.appendChild(cardFooter);

    card.addEventListener('dblclick', event => {
        helperLoadContainer(event, form.objectId);
        const showTab = document.querySelector('.nav-tabs a[href="#renderForm"]');
        activeForm = form;
        if (showTab) {
            showTab.click();
        }
    });

    column.appendChild(card);
    return column;
}

function createFormActionButtons(form) {
    const showButton = document.createElement('button');
    showButton.innerHTML = '<i class="fa fa-eye" style="margin-left:-5px"></i>';
    showButton.className = 'portal-show-button';
    showButton.onclick = function (event) {
        helperLoadContainer(event, form.objectId);
        const showTab = document.querySelector('.nav-tabs a[href="#renderForm"]');
        activeForm = form;
        if (showTab) {
            showTab.click();
        }
    };

    const editButton = document.createElement('button');
    editButton.innerHTML = '<i class="fa fa-edit" style="margin-left:-5px"></i>';
    editButton.className = 'portal-edit-button';
    editButton.onclick = function (event) {
        helperLoadContainer(event, form.objectId);
        const showTab = document.querySelector('.nav-tabs a[href="#editForm"]');
        activeForm = form;
        if (showTab) {
            showTab.click();
        }
    };

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa fa-trash" style="margin-left:-5px"></i>';
    deleteButton.className = 'portal-delete-button';
    deleteButton.onclick = function (event) {
        event.preventDefault();
        deleteForm(form.objectId);
    };

    return { showButton, editButton, deleteButton };
}

function updateFormsView() {
    const gridWrapper = document.getElementById('formsGridWrapper');
    const panelWrapper = document.getElementById('formsPanelWrapper');
    const gridButton = document.getElementById('formsGridViewBtn');
    const panelButton = document.getElementById('formsPanelViewBtn');

    if (gridWrapper && panelWrapper) {
        gridWrapper.classList.toggle('d-none', formsViewMode !== 'grid');
        panelWrapper.classList.toggle('d-none', formsViewMode !== 'panel');
    }

    if (gridButton && panelButton) {
        if (formsViewMode === 'grid') {
            gridButton.classList.add('btn-primary');
            gridButton.classList.remove('btn-outline-secondary');
            panelButton.classList.add('btn-outline-secondary');
            panelButton.classList.remove('btn-primary');
        } else {
            panelButton.classList.add('btn-primary');
            panelButton.classList.remove('btn-outline-secondary');
            gridButton.classList.add('btn-outline-secondary');
            gridButton.classList.remove('btn-primary');
        }
    }
}

function toggleFormsView(mode) {
    if (formsViewMode === mode) {
        return;
    }
    formsViewMode = mode;
    updateFormsView();
}

function getFormFilters() {
    const idInput = document.getElementById('searchFormInput');
    const nameInput = document.getElementById('searchNameInput');
    const slugInput = document.getElementById('searchSlugInput');

    return {
        id: idInput ? idInput.value.trim().toLowerCase() : '',
        name: nameInput ? nameInput.value.trim().toLowerCase() : '',
        slug: slugInput ? slugInput.value.trim().toLowerCase() : ''
    };
}

function matchesFormFilters(form, filters) {
    const idMatch = !filters.id || String(form.objectId).toLowerCase().includes(filters.id);
    const nameMatch = !filters.name || (form.objectName || '').toLowerCase().includes(filters.name);
    const slugMatch = !filters.slug || (form.objectSlug || '').toLowerCase().includes(filters.slug);
    return idMatch && nameMatch && slugMatch;
}

function helperLoadContainer(event, objectId) {
    event.preventDefault();
    //document.getElementById('renderContainer').innerHTML = '';
    //document.getElementById('formContainer').innerHTML = '';
    loadFormData(objectId, document.getElementById('renderContainer'), true, "render");
    loadFormData(objectId, document.getElementById('formContainer'), false, "");
}

function deleteForm(objectId) {
    apiFetch(`/delete-form/${objectId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            formsData = formsData.filter(form => form.objectId !== objectId);
            renderForms();
        })
        .catch(error => {
            console.error('There was a problem with the delete operation:', error);
        });
}

function searchFormbyID(event) {
    event.preventDefault();
    renderForms();
}

function searchFormbyName(event) {
    event.preventDefault();
    renderForms();
}

function searchFormbySlug(event) {
    event.preventDefault();
    renderForms();
}

function updateAllIdsInJson(jsonObj, prefix) {
    if (prefix === "") {
        return jsonObj;
    }
    if (Array.isArray(jsonObj)) {
        return jsonObj.map(item => updateAllIdsInJson(item, prefix));
    } else if (jsonObj && typeof jsonObj === "object") {
        const updatedObj = {};

        for (let key in jsonObj) {
            let value = jsonObj[key];

            // If this is an "id" key, update it
            if (key === "id" && typeof value === "string" && value.trim() !== "") {
                updatedObj[key] = `${prefix}_${value}`;
            }
            // If this is a label's "for" attribute
            else if (key === "for" && typeof value === "string" && value.trim() !== "") {
                updatedObj[key] = `${prefix}_${value}`;
            }
            else {
                //console.log("Call update All with value : ", value)
                updatedObj[key] = updateAllIdsInJson(value, prefix);
            }
        }
        return updatedObj;
    }

    return jsonObj; // Primitive value, return as is
}


function loadFormData(objectId, renderContainer, renderElem, prefix) {
    console.log("Load form data : " + objectId);
    apiFetch(`/get-form/${objectId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(form => {
            // Clear the render container

            renderContainer.innerHTML = '';

            //const updatedFormData = form.formData;
            const updatedFormData = updateAllIdsInJson(form.formData, prefix);

            // Convert JSON back to DOM and append
            var domContent = jsonToDom(updatedFormData, renderContainer);

            if (renderElem) {
                renderElements(renderContainer);
            }

            rebuildComponents(renderContainer);

            // set the header
            var objectId = document.getElementById('objectId');
            var objectName = document.getElementById('objectName');
            var objectSlug = document.getElementById('objectSlug');
            var userCreated = document.getElementById('userCreated');
            var userModified = document.getElementById('userModified');
            var objectType = document.getElementById('objectType');
            // select in the objecttype the value form
            objectType.value = 'form';
            // set the values in the header

            // Handle the form data here
            console.log('Form Data:', form);
            // For example, display the form data in an alert or populate a form for editing
            objectId.value = form.objectId;
            console.log(objectId);
            objectName.value = form.objectName;
            objectSlug.value = form.objectSlug;
            userCreated.value = form.userCreated;


        })
        .catch(error => {
            showToast('Error!' + error, 5000); // Show toast for 5 seconds
            console.error('There was a problem with the fetch operation:', error);
        });
}

function rebuildComponents(container) {
    const elements = container.querySelectorAll("[tagName]");
    elements.forEach(el => {
        const type = el.getAttribute("tagName");
        switch (type) {
            case "menuComponentHorizontal":
                renderMenuComponentHorizontal(el);
                break;
            case "button":
                renderElementButton(el);
                break;
            // ajoute ici les autres composants si besoin
            default:
                console.warn("⚠️ Composant inconnu :", type);
        }
    });
}

const formCache = {};

function loadFormDataInModal(objectId, container) {
    console.log("Load Form Data in modal");
    // ✅ Si le formulaire est déjà en cache, l'afficher
    if (formCache[objectId]) {
        container.innerHTML = ''; // Vider le container actuel
        container.appendChild(formCache[objectId].cloneNode(true)); // Cloner pour éviter les effets de bord
        return;
    }

    // ❌ Sinon, faire le fetch
    apiFetch(`/get-form/${objectId}`)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(form => {
            container.innerHTML = '';

            const domContent = jsonToDom(form.formData, container);
            renderElements(container);

            // ✅ Stocker une copie *clonée* pour réutilisation plus tard
            formCache[objectId] = container.cloneNode(true);
        })
        .catch(error => {
            showToast('Erreur modal : ' + error, 5000);
            console.error('Modal load error:', error);
        });
}

function showToast(message, duration = 3000) {
    let toastContainer = document.getElementById("toast-container");
    if (toastContainer === null || toastContainer === undefined) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";

    }
    const toast = document.createElement("div");
    toast.classList.add("toast-message");
    toast.textContent = message;

    // Add the toast to the container
    toastContainer.appendChild(toast);

    // Make the toast visible
    setTimeout(() => {
        toast.style.opacity = 1;
    }, 100);

    // Hide and remove the toast after 'duration'
    setTimeout(() => {
        toast.style.opacity = 0;
        toast.addEventListener("transitionend", () => toast.remove());
    }, duration);
}

// show hint like a toastmessage wiht absolute position, based on the mouse position
function showHint(message, duration = 1000, event) {
    let hintContainer = document.getElementById("hint-container");
    if (hintContainer === null || hintContainer === undefined) {
        hintContainer = document.createElement("div");
        hintContainer.id = "toast-container";

    }
    hintContainer.style.top = 10 + event.clientY + "px";
    hintContainer.style.left = 10 + event.clientX + "px";
    const hint = document.createElement("div");
    hint.classList.add("hint-message");
    hint.innerHTML = message;

    hintContainer.innerHTML = "";

    // Add the toast to the container
    hintContainer.appendChild(hint);

    // Make the toast visible
    setTimeout(() => {
        hint.style.opacity = 1;
    }, 100);

    // Hide and remove the toast after 'duration'
    setTimeout(() => {
        hint.style.opacity = 0;
        hint.addEventListener("transitionend", () => hint.remove());
    }, duration);
}

async function newForm() {
    // -------- Tab Header Buttons --------
    const tabHeaderButtonTable = {
        tag: "div",
        attributes: {
            "data-tab": "ctab_tab-0",
            class: "ctab_HeaderButton active",
            onclick: `activateTab(event,this,document.getElementById("ctab_tab-0"))`,
            id: "element_" + Date.now(),
        },
        text: "Table",
    };

    const tabHeaderButtonEdit = {
        tag: "div",
        attributes: {
            "data-tab": "ctab_tab-1",
            class: "ctab_HeaderButton",
            onclick: `activateTab(event,this,document.getElementById("ctab_tab-1"))`,
            id: "element_" + (Date.now() + 1),
        },
        text: "Edit",
    };

    // -------- Tab Header --------
    const tabHeader = {
        tag: "div",
        attributes: { class: "ctab_tabs-header" },
        children: [tabHeaderButtonTable, tabHeaderButtonEdit],
    };

    // -------- Data Grid --------
    const dataGrid = {
        tag: "div",
        attributes: {
            class: "form-element gjs-selection",
            id: "dataGrid" + Date.now(),
            draggable: "true",
            style: "min-height: 450px; display: flex;",
            tagname: "dataGrid",
        },
        children: [],
    };

    // -------- Data Set --------
    const dataSet = {
        tag: "div",
        attributes: {
            class: "form-element gjs-selection",
            id: "dataSet" + Date.now(),
            draggable: "true",
            tagname: "dataSet",
        },
        children: [],
    };

    // -------- Data Set Navigation Buttons --------
    const createNavButton = (name, title, onclick, text, iconClass, iconStyle) => ({
        tag: "button",
        attributes: { name, title, onclick, style: "width:150px;", class: "" },
        children: [
            { tag: "p", text },
            { tag: "i", attributes: { class: iconClass, style: iconStyle } }
        ]
    });

    const dataSetNavigationButtons = [
        createNavButton("PreviousDSBtn", "Previous", "navbar_movePrev()", "Previous", "fa fa-chevron-left", "color:#4d61fc;margin-left:-6px"),
        createNavButton("NextDSBtn", "Next", "navbar_moveNext()", "Next", "fa fa-chevron-right", "color:#4d61fc;margin-left:-6px"),
        createNavButton("EditDSBtn", "Edit Record", "navbar_EditRecord(false)", "Edit", "fa fa-pencil-square-o", "color:#4d61fc;margin-left:-6px"),
        createNavButton("InsertDSBtn", "New Record", "navbar_InsertRecord()", "New Record", "fa fa-plus", "color:green;margin-left:-6px"),
        createNavButton("CopyDSBtn", "Copy", "navbar_CopyRecord()", "Copy", "fa fa-files-o", "color:#4d61fc;margin-left:-6px"),
        createNavButton("DeleteDSBtn", "Delete", "navbar_DeleteRecord()", "Delete", "fa fa-trash", "color:#e74c3c;margin-left:-6px"),
        createNavButton("SaveDSBtn", "Save Record", "navbar_SaveRecord()", "Save", "fa fa-floppy-o", "color:red;margin-left:-6px"),
        createNavButton("CancelDSBtn", "Cancel", "navbar_CancelEdit()", "Cancel", "fa fa-ban", "color:#4d61fc;margin-left:-6px"),
        createNavButton("SaveAllDSBtn", "Save All and Exit", "handleSaveAllAndExit()", "Save All", "fa fa-check-circle", "color:green;margin-left:-6px")
    ];

    // -------- Data Set Navigation --------
    const dataSetNavigation = {
        tag: "div",
        attributes: {
            class: "form-element",
            id: "dataSetNavigation" + Date.now(),
            draggable: "true",
            tagname: "dataSetNavigation",
            position: "1"
        },
        children: [
            {
                tag: "div",
                attributes: { id: "navigationBar_" + Date.now(), style: "display: block;" },
                children: [
                    { tag: "div", attributes: { class: "gjs-selection", id: "element_" + Date.now() }, children: dataSetNavigationButtons }
                ]
            }
        ]
    };

    // -------- Prompt Element --------
    const promptElement = {
        tag: "div",
        attributes: {
            class: "form-element",
            id: "prompt" + Date.now(),
            draggable: "true",
            prompttext: "Please enter your question",
            promptplaceholder: "Type your question here...",
            promptbuttontext: "Submit",
            promptresponse: "",
            tagname: "prompt",
            position: "2"
        },
        children: [
            {
                tag: "div",
                attributes: { id: "chat-container" },
                children: [
                    { tag: "textarea", attributes: { id: "PromptText", placeholder: "Type your message...", class: "gjs-selection" } },
                    {
                        tag: "div",
                        attributes: { class: "actions" },
                        children: [
                            {
                                tag: "div",
                                attributes: { style: "display: none; gap: 10px;" },
                                children: [
                                    {
                                        tag: "label", attributes: { for: "file-upload" }, children: [
                                            { tag: "text", text: "📎 Upload" },
                                            { tag: "input", attributes: { type: "file", id: "file-upload" } }
                                        ]
                                    }
                                ]
                            },
                            { tag: "button", attributes: { onclick: "handleBigDocument(event)", title: "Upload File" }, text: "📎" },
                            { tag: "button", attributes: { onclick: "handleFill(event)", title: "Fill" }, text: "✨" },
                            { tag: "button", attributes: { onmousedown: "startVoice()", onmouseup: "stopVoice()", onmouseleave: "stopVoice()", title: "Voice: Hold to Speak" }, text: "🎤" },
                            { tag: "button", attributes: { onclick: "handleAiButton(event)", title: "Send to AI" }, text: "🤖" },
                            { tag: "img", attributes: { src: "img/loader.gif", id: "loader", style: "display: none; width: 80px; height: 40px;", alt: "Loading..." } }
                        ]
                    }
                ]
            }
        ]
    };

    // -------- Tab Content Divs --------
    const tab0Content = {
        tag: "div",
        attributes: { id: "ctab_tab-0", class: "ctab_ContentDiv", style: "display: block;" },
        children: [dataGrid]
    };

    const tab1Content = {
        tag: "div",
        attributes: { id: "ctab_tab-1", class: "ctab_ContentDiv", style: "display: none;" },
        children: [dataSet, dataSetNavigation, promptElement]
    };

    // -------- Tabs Container --------
    const tabsContainer = {
        tag: "div",
        attributes: { class: "ctab_tabs" },
        children: [tab0Content, tab1Content]
    };

    // -------- Final Default Form Data --------
    const defaultFormData = {
        tag: "div",
        attributes: {
            id: "Tab" + Date.now(),
            class: "form-element",
            tagname: "Tab",
            draggable: "true"
        },
        children: [tabHeader, tabsContainer]
    };

    const formPayload = {
        objectId: "ad_" + Date.now(), // dynamic unique id
        objectName: "New Form with Tabs",
        objectSlug: "new-form",
        formData: defaultFormData,
        userCreated: "masspe",
    };

    try {
        const response = await apiFetch("/create-form", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formPayload),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const result = await response.json();
        console.log("✅ Form created:", result);

        alert(`Form "${result.form.objectName}" created successfully!`);
    } catch (err) {
        console.error("❌ Error creating form:", err);
        alert("Failed to create form: " + err.message);
    }
}
