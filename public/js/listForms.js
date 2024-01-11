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

document.addEventListener('DOMContentLoaded', function() {
    fetch('/list-forms')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(forms => {
            const list = document.getElementById('formsList');
            forms.forEach(form => {
                const listItem = document.createElement('li');
                listItem.classList.add('form-item');
                listItem.textContent = `Form ID: ${form.formId}, Name: ${form.name}`; // Adjust according to your form object structure
                listItem.setAttribute('data-form-id', form.formId); // Set the form ID as a data attribute

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('button ');
               
                deleteButton.onclick = function() {
                    deleteForm(form.formId, listItem);
                };

                listItem.appendChild(deleteButton);

                // Click event listener for each list item
                listItem.addEventListener('click', function(event) {
                    if (event.target !== deleteButton) {
                        const editTab = document.querySelector('.nav-tabs a[href="#editForm"]');
                        if (editTab) {
                            editTab.click(); // Simulate click
                        }
                        loadFormData(this.getAttribute('data-form-id'));
                    }
                });

                list.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
});

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



function loadFormData(formId) {
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
            

            var renderContainer = document.getElementById('formContainer');
            renderContainer.innerHTML = '';

            // Convert JSON back to DOM and append
            var domContent = jsonToDom(form.formData,renderContainer);
        
            console.log(domContent);
           
        })
        .catch(error => {
            showToast('Error!'+error, 5000); // Show toast for 5 seconds
            console.error('There was a problem with the fetch operation:', error);
        });
}
