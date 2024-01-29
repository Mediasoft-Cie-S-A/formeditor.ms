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
    fetchTablesList(list,detailsDiv,"");
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
    
   // createFormElementsFromStructure(tableName.innerText,element);
    const formContainer = document.getElementById(modal.getAttribute('data-main-id'));
    
    fieldsList=document.querySelectorAll('#tableDetails table input:checked')
    var field=fieldsList[0];
    // create serach form with input and button and autocomplete
    var label=document.createElement('label');
    label.innerHTML="Search";
    label.id=element.id+"Label";
    label.tagName="label";
    element.appendChild(label);

    // create search input div
    var searchDiv = document.createElement('div');
    searchDiv.className = 'search';
    searchDiv.id=element.id+"searchDiv";
    searchDiv.tagName="searchDiv";
    element.appendChild(searchDiv);
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id=element.id+"search";
    searchInput.tagName="search";
    
    searchInput.setAttribute("list", "searchList");
    searchInput.setAttribute("autocomplete", "off");
    searchInput.setAttribute("oninput", "searchAutoComplete(event,this)");
    searchInput.setAttribute("onfocus", "searchAutoComplete(event,this)");
    searchInput.setAttribute("data-table-name",tableName.innerText);
    searchInput.setAttribute("data-field-name",field.getAttribute("dataset-field-name"));
    searchInput.setAttribute("data-field-type",field.getAttribute("dataset-field-type"));
    searchInput.placeholder="Search";
    const searchButton = document.createElement('button');
    searchDiv.appendChild(searchInput)
    searchButton.type = 'button';
    
    searchButton.innerHTML = '<i class="search-icon">&#128269;</i> ';
    searchButton.setAttribute("onclick", "gridSearch(event,'"+searchInput.id+"')");
    searchDiv.appendChild(searchButton);
    const autocomplete = document.createElement('div');
    autocomplete.id = 'autocomplete';
    autocomplete.className = 'autocomplete-results';
    searchDiv.appendChild(autocomplete);
    
    formContainer.appendChild(element);

    
    return element;
}

function gridSearch(event,id)
{
    console.log("gridSearch");
    element = document.getElementById(id);
    const filedName = element.getAttribute("data-field-name");
    const searchValue = filedName+"|"+element.value;
   
    searchGrid(searchValue);
}
// searchAutoComplete that call the search function "/select-distinct/:tableName/:fieldName" and display the result in the autocomplete div
function searchAutoComplete(event,element)
{
    const tableName = element.getAttribute("data-table-name");
    const fieldName = element.getAttribute("data-field-name");
    const fieldType = element.getAttribute("data-field-type");
    const autocomplete = document.getElementById('autocomplete');
    const searchValue = element.value;
    
        var url = "/select-distinct/"+tableName+"/"+fieldName;
        // generate filter from searchValue if fieldType is text with openedge syntax
        if (searchValue.length>2)
            {
                switch (fieldType) {
                    case "character":
                        url=url+"?filter="+fieldName+" like '%"+searchValue+"%'";
                        break;
                    case "integer":
                        url=url+"?filter="+fieldName+"="+searchValue;
                        break;
                    case "date":
                        url=url+"?filter="+fieldName+"="+searchValue;
                        break;
                    case "logical":
                        url=url+"?filter="+fieldName+"="+searchValue;
                        break;
                    default:
                        url=url+"?filter="+fieldName+" like '%"+searchValue+"%'";;
                }
            }
        fetch(url)
        .then(response => response.json())
        .then(data => {
            autocomplete.innerHTML="";
            autocomplete.style.display="block";
            data.forEach(row => {
                console.log(row);
                var rowDiv = document.createElement('div');
                rowDiv.className = 'autocomplete-row';
                rowDiv.setAttribute("rowid",row.rowid);
                rowDiv.setAttribute("data-table-name",tableName);
                rowDiv.setAttribute("data-field-name",fieldName);
                rowDiv.setAttribute("data-field-type",fieldType);
                rowDiv.setAttribute("data-search-value",searchValue);
                rowDiv.addEventListener("click", function(event) {
                    event.preventDefault();
                    element.value=row[fieldName];
                    autocomplete.style.display="none";
                  });
                var i=0;
                rowDiv.innerHTML=row[fieldName];
                autocomplete.appendChild(rowDiv);
            });
        })
        .catch(error => {
            console.error(error);
        });
}
