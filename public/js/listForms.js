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

function loadForms() {
    console.log('Loading forms...');
    fetch('/list-forms')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(forms => {
            console.log(forms);
            const list = document.getElementById('componentsListBody');

            list.innerHTML = ''; // Clear the list

            forms.forEach(form => {
                const container = document.createElement('tr'); // Create a new container for the forms

                container.className = 'portal-container';
                container.setAttribute('data-form-id', form.objectId); // Set the form ID as a data attribute
                container.setAttribute('title', `double click to view form`);
                const ItemID = document.createElement('td'); // Create a new list item for each form
                ItemID.innerHTML = `<b>${form.objectId}</b>`; // Adjust according to your form object structure
                container.appendChild(ItemID); // Append the list item to the container
                const ItemName = document.createElement('td');
                ItemName.innerHTML = `<b>${form.objectName}</b>`; // Adjust according to your form object structure


                container.appendChild(ItemName); // Append the list item to the container
                const ItemSlug = document.createElement('td');
                ItemSlug.innerHTML = `<i>${form.objectSlug}</i>`; // Adjust according to your form object structure
                container.appendChild(ItemSlug); // Append the list item to the container
                const ItemUser = document.createElement('td');
                ItemUser.innerHTML = `<i>${form.userCreated}</i>`; // Adjust according to your form object structure
                container.appendChild(ItemUser); // Append the list item to the container
                const ItemModified = document.createElement('td');
                ItemModified.innerHTML = `<i>${form.userModified}</i>`; // Adjust according to your form object structure
                container.appendChild(ItemModified); // Append the list item to the container
                const ItemDate = document.createElement('td');
                ItemDate.innerHTML = `<i>${form.modificationDate}</i>`; // Adjust according to your form object structure
                container.appendChild(ItemDate); // Append the list item to the container

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fa fa-trash" style="margin-left:-5px"></i>'
                deleteButton.className = 'portal-delete-button';
                deleteButton.onclick = function (event) {
                    event.preventDefault();
                    deleteForm(form.objectId, container);
                }; // delete button functionality

                // create edit button
                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fa fa-edit" style="margin-left:-5px"></i>'
                editButton.className = 'portal-edit-button';
                editButton.onclick = function (event) {
                    //document.getElementById('renderContainer').innerHTML = ''; // Clear the render container
                    //loadFormData(form.objectId, document.getElementById('formContainer'), false, "");
                    helperLoadContainer(event, form.objectId); // Load the form data into the form container
                    const showTab = document.querySelector('.nav-tabs a[href="#editForm"]');
                    activeForm = form;
                    if (showTab) {
                        showTab.click(); // Simulate click
                    }// if (showTab) {

                }; // edit button functionality
                // create show button
                const showButton = document.createElement('button');
                showButton.innerHTML = '<i class="fa fa-eye" style="margin-left:-5px"></i>'
                showButton.className = 'portal-show-button';
                showButton.onclick = function (event) {
                    //document.getElementById('formContainer').innerHTML = ''; // Clear the form container
                    //loadFormData(form.objectId, document.getElementById('renderContainer'), true, "");
                    helperLoadContainer(event, form.objectId); // Load the form data into the form container
                    const showTab = document.querySelector('.nav-tabs a[href="#renderForm"]');
                    activeForm = form;
                    if (showTab) {
                        showTab.click(); // Simulate click
                    }// if (showTab) {
                }; // show button functionality
                const itemActions = document.createElement('td');
                container.appendChild(itemActions); // Append the actions cell to the container
                //append the delete button to the list item

                itemActions.appendChild(showButton);
                itemActions.appendChild(editButton);
                itemActions.appendChild(deleteButton);
                container.addEventListener('dblclick', function (event) {
                    //document.getElementById('formContainer').innerHTML = ''; // Clear the render container
                    //loadFormData(form.objectId, document.getElementById('renderContainer'), true, "render");
                    helperLoadContainer(event, form.objectId);
                    const showTab = document.querySelector('.nav-tabs a[href="#renderForm"]');
                    activeForm = form;
                    if (showTab) {
                        showTab.click(); // Simulate click
                    }// if (showTab) {
                }); // Add a double-click event listener to the list item

                container.addEventListener('click', function (e) {
                    e.preventDefault();
                    // check if the event is a click on the delete,show or edit button
                    if (e.target.className === 'portal-list-item') {

                        showHint(`ID:${form.objectId}<br>User:${form.userCreated}<br>Last mod:${form.modificationDate}`, 5000, event);
                    }
                }
                ); // ListItem.addEventListener 


                list.appendChild(container); // Append the container to the list
                // Add the container to the list
            }); // forEach
            // Check if there are no forms
            if (forms.length === 0) {
                const noFormsMessage = document.createElement('div');
                noFormsMessage.className = 'portal-no-forms';
                noFormsMessage.textContent = 'No forms available.';
                container.appendChild(noFormsMessage);
            }

            // Manually trigger the search functions
            const searchIdInput = document.getElementById('searchFormInput');
            if (searchIdInput && searchIdInput.value) {
                searchFormbyID({ target: searchIdInput, preventDefault: () => { } });
            }

            // Manually trigger the search functions
            const searchNameInput = document.getElementById('searchNameInput');
            if (searchNameInput && searchNameInput.value) {
                searchFormbyName({ target: searchNameInput, preventDefault: () => { } });
            }

            // Manually trigger the search functions
            const searchSlugInput = document.getElementById('searchSlugInput');
            if (searchSlugInput && searchSlugInput.value) {
                searchFormbySlug({ target: searchSlugInput, preventDefault: () => { } });
            }


        })// Handle the response
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });


}

function helperLoadContainer(event, objectId) {
    event.preventDefault();
    //document.getElementById('renderContainer').innerHTML = '';
    //document.getElementById('formContainer').innerHTML = '';
    loadFormData(objectId, document.getElementById('renderContainer'), true, "render");
    loadFormData(objectId, document.getElementById('formContainer'), false, "");
}

function deleteForm(objectId, listItem) {
    fetch(`/delete-form/${objectId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data.message);
            listItem.remove(); // Remove the list item from the DOM
        })
        .catch(error => {
            console.error('There was a problem with the delete operation:', error);
        });
}

function searchFormbyID(event) {
    event.preventDefault(); // Prevent the default form submission
    const searchInput = event.target;
    const list = document.getElementById('componentsListBody');
    const searchTerm = searchInput.value.trim().toLowerCase(); // Get the search term and convert to lowercase
    console.log('Searching for form with ID:', searchTerm);
    // get the all the rows in the list
    const rows = list.querySelectorAll('tr'); // Select all rows with the class 'portal-container'
    let found = false; // Flag to check if any form is found
    rows.forEach(row => {
        const formId = row.getAttribute('data-form-id'); // Get the form ID from the data attribute
        if (formId && formId.toLowerCase().includes(searchTerm)) { // Check if the form ID includes the search term
            row.style.display = ''; // Show the row if it matches
            found = true; // Set the flag to true if a match is found
        } else {
            row.style.display = 'none'; // Hide the row if it doesn't match
        }
    });
    if (!found) {
        showToast('No forms found with ID: ' + searchTerm, 5000); // Show a toast message if no forms are found
    }
    console.log('Search completed.');
}

function searchFormbyName(event) {
    event.preventDefault(); // Prevent the default form submission  
    const searchInput = event.target;
    const list = document.getElementById('componentsListBody');
    const searchTerm = searchInput.value.trim().toLowerCase(); // Get the search term and convert to lowercase
    console.log('Searching for form with Name:', searchTerm);
    // get the all the rows in the list
    const rows = list.querySelectorAll('tr'); // Select all rows with the class 'portal-container'
    let found = false; // Flag to check if any form is found
    rows.forEach(row => {
        const formName = row.querySelector('td:nth-child(2)').textContent; // Get the form name from the second cell
        if (formName && formName.toLowerCase().includes(searchTerm)) { // Check if the form name includes the search term
            row.style.display = ''; // Show the row if it matches
            found = true; // Set the flag to true if a match is found
        } else {
            row.style.display = 'none'; // Hide the row if it doesn't match
        }
    });
    if (!found) {
        showToast('No forms found with Name: ' + searchTerm, 5000); // Show a toast message if no forms are found
    }
    console.log('Search completed.');
}

function searchFormbySlug(event) {
    event.preventDefault(); // Prevent the default form submission
    const searchInput = event.target;
    const list = document.getElementById('componentsListBody');
    const searchTerm = searchInput.value.trim().toLowerCase(); // Get the search term and convert to lowercase
    console.log('Searching for form with Slug:', searchTerm);
    // get the all the rows in the list
    const rows = list.querySelectorAll('tr'); // Select all rows with the class 'portal-container'
    let found = false; // Flag to check if any form is found
    rows.forEach(row => {
        const formSlug = row.querySelector('td:nth-child(3)').textContent; // Get the form slug from the third cell
        if (formSlug && formSlug.toLowerCase().includes(searchTerm)) { // Check if the form slug includes the search term
            row.style.display = ''; // Show the row if it matches
            found = true; // Set the flag to true if a match is found
        } else {
            row.style.display = 'none'; // Hide the row if it doesn't match
        }
    });
    if (!found) {
        showToast('No forms found with Slug: ' + searchTerm, 5000); // Show a toast message if no forms are found
    }
    console.log('Search completed.');
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
    fetch(`/get-form/${objectId}`)
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
    fetch(`/get-form/${objectId}`)
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
    const defaultFormData = {
        tag: "div",
        attributes: {
            id: "Tab" + Date.now(), // unique ID
            class: "form-element",
            tagname: "Tab",
            draggable: "true",
        },
        children: [
            {
                tag: "div",
                attributes: { class: "ctab_tabs-header" },
                children: [
                    {
                        tag: "div",
                        attributes: {
                            "data-tab": "ctab_tab-0",
                            class: "ctab_HeaderButton active",
                            onclick: `activateTab(event,this,document.getElementById("ctab_tab-0"))`,
                            id: "element_" + Date.now(),
                        },
                        text: "Table",
                    },
                    {
                        tag: "div",
                        attributes: {
                            "data-tab": "ctab_tab-1",
                            class: "ctab_HeaderButton",
                            onclick: `activateTab(event,this,document.getElementById("ctab_tab-1"))`,
                            id: "element_" + (Date.now() + 1),
                        },
                        text: "Edit",
                    },
                ],
            },
            {
                tag: "div",
                attributes: { class: "ctab_tabs" },
                children: [
                    {
                        tag: "div",
                        attributes: {
                            id: "ctab_tab-0",
                            class: "ctab_ContentDiv",
                            style: "display: block;",
                        },
                        children: [
                            {
                                tag: "div",
                                attributes: {
                                    class: "form-element gjs-selection",
                                    id: "dataGrid" + Date.now(),
                                    draggable: "true",
                                    style: "min-height: 450px; display: flex;",
                                    tagname: "dataGrid"
                                },
                                children: []
                            }
                        ]
                    },
                    {
                        tag: "div",
                        attributes: {
                            id: "ctab_tab-1",
                            class: "ctab_ContentDiv",
                            style: "display: none;",
                        },
                        children: [
                            {
                                tag: "div",
                                attributes: {
                                    class: "form-element gjs-selection",
                                    id: "dataSet" + Date.now(),
                                    draggable: "true",
                                    tagname: "dataSet"
                                },
                                children: []
                            },
                            {
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
                                        attributes: {
                                            id: "navigationBar_" + Date.now(),
                                            style: "display: block;"
                                        },
                                        children: [
                                            {
                                                tag: "div",
                                                attributes: {
                                                    class: "gjs-selection",
                                                    id: "element_" + Date.now()
                                                },
                                                children: [
                                                    {
                                                        tag: "button",
                                                        attributes: {
                                                            id: "btnPrevious",
                                                            name: "PreviousDSBtn",
                                                            title: "Previous",
                                                            onclick: "navbar_movePrev()",
                                                            style: "width:150px;",
                                                            class: ""
                                                        },
                                                        children: [
                                                            { tag: "p", text: "Previous" },
                                                            { tag: "i", attributes: { class: "fa fa-chevron-left", style: "color:#4d61fc;margin-left:-6px" } }
                                                        ]
                                                    },
                                                    {
                                                        tag: "button",
                                                        attributes: {
                                                            name: "NextDSBtn",
                                                            title: "Next",
                                                            onclick: "navbar_moveNext()",
                                                            style: "width:150px;",
                                                            class: ""
                                                        },
                                                        children: [
                                                            { tag: "p", text: "Next" },
                                                            { tag: "i", attributes: { class: "fa fa-chevron-right", style: "color:#4d61fc;margin-left:-6px" } }
                                                        ]
                                                    },
                                                    {
                                                        tag: "button",
                                                        attributes: {
                                                            name: "EditDSBtn",
                                                            title: "Edit Record",
                                                            onclick: "navbar_EditRecord(false)",
                                                            style: "width:150px;",
                                                            class: ""
                                                        },
                                                        children: [
                                                            { tag: "p", text: "Edit" },
                                                            { tag: "i", attributes: { class: "fa fa-pencil-square-o", style: "color:#4d61fc;margin-left:-6px" } }
                                                        ]
                                                    },
                                                    {
                                                        tag: "button",
                                                        attributes: {
                                                            name: "InsertDSBtn",
                                                            title: "New Record",
                                                            onclick: "navbar_InsertRecord()",
                                                            style: "width:150px;",
                                                            class: ""
                                                        },
                                                        children: [
                                                            { tag: "p", text: "New Record" },
                                                            { tag: "i", attributes: { class: "fa fa-plus", style: "color:green;margin-left:-6px" } }
                                                        ]
                                                    },
                                                    {
                                                        tag: "button",
                                                        attributes: {
                                                            name: "CopyDSBtn",
                                                            title: "Copy",
                                                            onclick: "navbar_CopyRecord()",
                                                            style: "width:150px;",
                                                            class: ""
                                                        },
                                                        children: [
                                                            { tag: "p", text: "Copy" },
                                                            { tag: "i", attributes: { class: "fa fa-files-o", style: "color:#4d61fc;margin-left:-6px" } }
                                                        ]
                                                    },
                                                    {
                                                        tag: "button",
                                                        attributes: {
                                                            name: "DeleteDSBtn",
                                                            title: "Delete",
                                                            onclick: "navbar_DeleteRecord()",
                                                            style: "width:150px;",
                                                            class: ""
                                                        },
                                                        children: [
                                                            { tag: "p", text: "Delete" },
                                                            { tag: "i", attributes: { class: "fa fa-trash", style: "color:#e74c3c;margin-left:-6px" } }
                                                        ]
                                                    },
                                                    {
                                                        tag: "button",
                                                        attributes: {
                                                            name: "SaveDSBtn",
                                                            title: "Save Record",
                                                            onclick: "navbar_SaveRecord()",
                                                            style: "width:150px;",
                                                            disabled: "",
                                                            class: "disabled"
                                                        },
                                                        children: [
                                                            { tag: "p", text: "Save" },
                                                            { tag: "i", attributes: { class: "fa fa-floppy-o", style: "color:red;margin-left:-6px" } }
                                                        ]
                                                    },
                                                    {
                                                        tag: "button",
                                                        attributes: {
                                                            name: "CancelDSBtn",
                                                            title: "Cancel",
                                                            onclick: "navbar_CancelEdit()",
                                                            style: "width:150px;",
                                                            disabled: "",
                                                            class: "disabled"
                                                        },
                                                        children: [
                                                            { tag: "p", text: "Cancel" },
                                                            { tag: "i", attributes: { class: "fa fa-ban", style: "color:#4d61fc;margin-left:-6px" } }
                                                        ]
                                                    },
                                                    {
                                                        tag: "button",
                                                        attributes: {
                                                            name: "SaveAllDSBtn",
                                                            title: "Save All and Exit",
                                                            onclick: "handleSaveAllAndExit()",
                                                            style: "width:150px;",
                                                            disabled: "",
                                                            class: "disabled"
                                                        },
                                                        children: [
                                                            { tag: "p", text: "Save All" },
                                                            { tag: "i", attributes: { class: "fa fa-check-circle", style: "color:green;margin-left:-6px" } }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
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
                                                attributes: {
                                                    id: "chat-container"
                                                },
                                                children: [
                                                    {
                                                        tag: "textarea",
                                                        attributes: {
                                                            id: "PromptText",
                                                            placeholder: "Type your message...",
                                                            class: "gjs-selection"
                                                        }
                                                    },
                                                    {
                                                        tag: "div",
                                                        attributes: {
                                                            class: "actions"
                                                        },
                                                        children: [
                                                            {
                                                                tag: "div",
                                                                attributes: {
                                                                    style: "display: none; gap: 10px;"
                                                                },
                                                                children: [
                                                                    {
                                                                        tag: "label",
                                                                        attributes: { for: "file-upload" },
                                                                        children: [
                                                                            { tag: "text", text: "📎 Upload" },
                                                                            { tag: "input", attributes: { type: "file", id: "file-upload" } }
                                                                        ]
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                tag: "button",
                                                                attributes: {
                                                                    onclick: "handleBigDocument(event)",
                                                                    title: "Upload File"
                                                                },
                                                                text: "📎"
                                                            },
                                                            {
                                                                tag: "button",
                                                                attributes: {
                                                                    onclick: "handleFill(event)",
                                                                    title: "Fill"
                                                                },
                                                                text: "✨"
                                                            },
                                                            {
                                                                tag: "button",
                                                                attributes: {
                                                                    onmousedown: "startVoice()",
                                                                    onmouseup: "stopVoice()",
                                                                    onmouseleave: "stopVoice()",
                                                                    title: "Voice: Hold to Speak"
                                                                },
                                                                text: "🎤"
                                                            },
                                                            {
                                                                tag: "button",
                                                                attributes: {
                                                                    onclick: "handleAiButton(event)",
                                                                    title: "Send to AI"
                                                                },
                                                                text: "🤖"
                                                            },
                                                            {
                                                                tag: "img",
                                                                attributes: {
                                                                    src: "img/loader.gif",
                                                                    id: "loader",
                                                                    style: "display: none; width: 80px; height: 40px;",
                                                                    alt: "Loading..."
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
    };

    console.log("Create new form");

    const formPayload = {
        objectId: "ad_" + Date.now(), // dynamic unique id
        objectName: "New Form with Tabs",
        objectSlug: "new-form",
        formData: defaultFormData,
        userCreated: "masspe",
    };

    try {
        const response = await fetch("/create-form", {
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
