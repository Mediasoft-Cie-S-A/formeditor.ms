
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

function createElementCombox(type) {
    element = document.createElement(div);
            element.textContent = type;
    element.id=type+ Date.now(); // Unique ID for each new element
    element.tagName=type;
    element.className = 'container';
    // create label
    var label = document.createElement('label');
    label.textContent = 'label';
    
    label.tagName=type;
    // create select
    var select = document.createElement('select');
    select.textContent = 'select';
    select.tagName=type;
    select.setAttribute('onclik', 'refreshCombox(this)');
    // create options
    // insert options
    element.appendChild(label);
    element.appendChild(select);

    return element;
}



function editElementCombox(type,element,content)
{
   // adding tableName property to the element
  
}


function refreshCombox(element) {
    const tableName = element.getAttribute("data-table-name");
    const fieldName = element.getAttribute("data-field-name");
   
    // qeurry the database
    fetch('/get-distinct-data/?tableName=' + tableName)
        .then(response => {
            if (!response.ok) {
                showToast('Error: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // create the options
            var select = element.getElementsByTagName('select')[0];
            select.innerHTML = '';
            data.forEach(function (item) {
                var option = document.createElement('option');
                option.value = item[fieldName];
                option.text = item[fieldName];
                select.appendChild(option);
            });
        })
        .catch(error => {
           showToast('Error: ' + error);
        });

}