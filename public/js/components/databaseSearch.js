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
function createDatabaseSearch(type) {
    
    var main= document.createElement('div');
    main.className = 'form-container';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;

    const list = document.getElementById('tablesList');
    const detailsDiv = document.getElementById('tableDetails');
    createTableList(list,detailsDiv);
    showModalDbStrc(main,type);
    return main;

    
}

function editDatabaseSearch(type,element,content)
{
    // Create and append the elements
   
   

}

function search(event)
{

}

function insertSearch()
{
    const modal = document.getElementById('tableDetailsModal');
    const overl = document.getElementById('overlayModal');
    modal.style.display = 'none';
    overl.style.display = 'none';
    console.log("dbitem");

    const tableName = document.getElementById('TableDetails_TableName');
    element = document.createElement('div');
    element.className =  'form-container';
    element.classList.add('search-box');
   // createFormElementsFromStructure(tableName.innerText,element);
    const formContainer = document.getElementById(modal.getAttribute('data-main-id'));
    
    fieldsList=document.querySelectorAll('#tableDetails table input:checked')

    // create serach form with input and button and autocomplete
    var label=document.createElement('label');
    label.innerHTML="Search";
    label.id=element.id+"Label";
    label.tagName="label";
    element.appendChild(label);
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id=element.id+"search";
    searchInput.tagName="search";
    searchInput.className="search-input";
    searchInput.setAttribute("list", "searchList");
    searchInput.setAttribute("autocomplete", "off");
    searchInput.setAttribute("oninput", "searchAutoComplete(event,this)");
    searchInput.placeholder="Search";
    const searchButton = document.createElement('button');
    element.appendChild(searchInput)
    searchButton.type = 'button';
    searchButton.className = 'search-button';
    searchButton.innerHTML = '  <i class="search-icon">&#128269;</i> ';
    element.appendChild(searchButton);
    const autocomplete = document.createElement('div');
    autocomplete.id = 'autocomplete';
    autocomplete.className = 'autocomplete-results';
    element.appendChild(autocomplete);
    
    formContainer.appendChild(element);

    /*
       const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = tableName.value;
    searchInput.className = 'form-control';
    searchInput.placeholder = 'Search';
    searchInput.autocomplete = 'off';
    searchInput.setAttribute('onkeyup','search(event)');
    element.appendChild(searchInput);
    const searchButton = document.createElement('button');
    searchButton.type = 'button';
    searchButton.className = 'btn btn-primary';
    searchButton.innerHTML = 'Search';
    element.appendChild(searchButton);
    const autocomplete = document.createElement('div');
    autocomplete.id = 'autocomplete';
    autocomplete.className = 'autocomplete-items';
    element.appendChild(autocomplete);
    */
    return element;
}