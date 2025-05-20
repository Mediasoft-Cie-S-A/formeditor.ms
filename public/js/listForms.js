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


function loadForms(){
    console.log('Loading forms...');
    fetch('/list-forms')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(forms => {
            const list = document.getElementById('formsList');
            list.innerHTML = ''; // Clear the list
            const container = document.createElement('div');
            list.appendChild(container);
            container.className = 'portal-container';
// generate the list of path
   var pathList = forms.map(form => form.formPath);
// remove duplicates
    pathList = pathList.filter((value, index, self) => self.indexOf(value) === index);
    // create the div container for each path with the id
    pathList.forEach(path => {
        const pathContainer = document.createElement('div');
        pathContainer.className = 'portal-path-container';
        pathContainer.innerHTML = `<span style="float:left;position:absolute;margin-top:-10px"><b>${path}</b></span>`;
        pathContainer.setAttribute('data-path', path); // Set the path as a data attribute
        pathContainer.id = path;
        container.appendChild(pathContainer);
        // create the div container for each form with the id
    });

            forms.forEach(form => {
                const listItem = document.createElement('div');                
                listItem.innerHTML = `<b>${form.formName}</b>`; // Adjust according to your form object structure
                listItem.className = 'portal-list-item';                
                listItem.setAttribute('data-form-id', form.formId); // Set the form ID as a data attribute
                listItem.setAttribute('title', `double click to view form`);
                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML='<i class="fa fa-trash" style="margin-left:-5px"></i>'
                deleteButton.className = 'portal-delete-button';        
                deleteButton.onclick = function() {
                    deleteForm(form.formId, listItem);
                };

                // create edit button
                const editButton = document.createElement('button');
                editButton.innerHTML='<i class="fa fa-edit" style="margin-left:-5px"></i>'
                editButton.className = 'portal-edit-button';
                editButton.onclick = function() {
                    event.preventDefault();
                    loadFormData(form.formId,document.getElementById('formContainer'));
                    const editTab = document.querySelector('.nav-tabs a[href="#editForm"]');
                    if (editTab) {
                        editTab.click(); // Simulate click
                    }
                   
                };
                // create show button
                const showButton = document.createElement('button');
                showButton.innerHTML='<i class="fa fa-eye" style="margin-left:-5px"></i>'
                showButton.className = 'portal-show-button';
                showButton.onclick = function(event) {
                    event.preventDefault();
                    loadFormData(form.formId,document.getElementById('renderContainer'));
                    const showTab = document.querySelector('.nav-tabs a[href="#renderForm"]');
                    if (showTab) {
                        showTab.click(); // Simulate click
                    }
                   
                };

                //append the delete button to the list item
                listItem.appendChild(deleteButton);
                listItem.appendChild(showButton);                
                listItem.appendChild(editButton);
                listItem.addEventListener('dblclick', function(event) {
                    event.preventDefault();
                    loadFormData(form.formId,document.getElementById('renderContainer'));
                    const showTab = document.querySelector('.nav-tabs a[href="#renderForm"]');
                    if (showTab) {
                        showTab.click(); // Simulate click
                    }
                });
                listItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    // check if the event is a click on the delete,show or edit button
                    if (e.target.className === 'portal-list-item'){
                        
                    showHint(`ID:${form.formId}<br>User:${form.userCreated}<br>Last mod:${form.modificationDate}`, 5000, event);
                    }
                });

                // get the path container
                const pathContainer = document.getElementById(form.formPath);
                pathContainer.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function deleteForm(formId, listItem) {
    fetch(`/delete-form/${formId}`, { method: 'DELETE' })
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



function loadFormData(formId,renderContainer)
 {
    console.log("🔍 loadFormData called for:", formId, "into:", renderContainer.id || renderContainer.className);

    fetch(`/get-form/${formId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(form => {
            // set the header
            var formId = document.getElementById('formId');
            var formName = document.getElementById('formName');
            var formPath = document.getElementById('formPath');
            var userCreated = document.getElementById('userCreated');
            var userModified = document.getElementById('userModified');
            // Handle the form data here
            console.log('Form Data:', form);
            // For example, display the form data in an alert or populate a form for editing
            formId.value=form.formId;
            console.log(formId);
            formName.value=form.formName;
            formPath.value=form.formPath;
            userCreated.value=form.userCreated;
            console.log(renderContainer);
           
            // Clear the render container

                renderContainer.innerHTML = '';


            // Convert JSON back to DOM and append
            var domContent = jsonToDom(form.formData,renderContainer);
            renderElements(renderContainer);
            console.log(domContent);
           
        })
        .catch(error => {
            showToast('Error!'+error, 5000); // Show toast for 5 seconds
            console.error('There was a problem with the fetch operation:', error);
        });
}
const formCache = {};

function loadFormDataInModal(formId, container) {
    // ✅ Si le formulaire est déjà en cache, l'afficher
    if (formCache[formId]) {
        container.innerHTML = ''; // Vider le container actuel
        container.appendChild(formCache[formId].cloneNode(true)); // Cloner pour éviter les effets de bord
        return;
    }

    // ❌ Sinon, faire le fetch
    fetch(`/get-form/${formId}`)
        .then(response => {
            if (!response.ok) throw new Error('Network error');
            return response.json();
        })
        .then(form => {
            container.innerHTML = '';

            const domContent = jsonToDom(form.formData, container);
            renderElements(container);

            // ✅ Stocker une copie *clonée* pour réutilisation plus tard
            formCache[formId] = container.cloneNode(true);
        })
        .catch(error => {
            showToast('Erreur modal : ' + error, 5000);
            console.error('Modal load error:', error);
        });
}
