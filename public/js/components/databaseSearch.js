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
    main.className = 'dataSetContainer';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;


    const list = document.getElementById('ContentTableList');
    const detailsDiv = document.getElementById('tableDetails');
    fetchTablesList(list,detailsDiv,"");
    showModalDbStrc(main,type);
    
    return main;

    
}

function editDatabaseSearch(type,element,content)
{
    // Create and append the elements
    content.appendChild(createInputItem("ID Table Name", "dataset-id-table-name", "dataset-id-table-name",element.getAttribute('dataset-id-table-name'),"text",true));
    content.appendChild(createInputItem("ID Field Name", "dataset-id-field-name", "dataset-id-field-name",element.getAttribute('dataset-id-field-name'),"text",true));
    content.appendChild(createInputItem("ID Field Type", "dataset-id-field-type", "dataset-id-field-type",element.getAttribute('dataset-id-field-type'),"text",true));
    content.appendChild(createInputItem("Value Field Name", "dataset-values-field-name", "dataset-value-field-name",element.getAttribute('dataset-value-field-name'),"text",true));
    content.appendChild(createInputItem("Value Field Type", "dataset-values-field-type", "dataset-value-field-type",element.getAttribute('dataset-value-field-type'),"text",true));
    content.appendChild(createInputItem("Dest Table Name", "dataset-dest-table-name", "dataset-dest-table-name",element.getAttribute('dataset-dest-table-name'),"text",true));
    content.appendChild(createInputItem("Dest Field Name", "dataset-dest-field-name", "dataset-dest-field-name",element.getAttribute('dataset-dest-field-name'),"text",true));
  
   

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

    const tableName = document.getElementById('TableDetails_TableName').getAttribute('table-name');
    
 
    const formContainer = document.getElementById(modal.getAttribute('data-main-id'));
    
    fieldsList=document.querySelectorAll('#tableDetails table input[name="fieldItem"]:checked')
    
    fieldsList.forEach(field => {

            var element = document.createElement('div');
             element.className =  'form-container';
             element.style.width="300px";
             element.id="search_"+tableName+ Date.now(); // Unique ID for each new element
            // create serach form with input and button and autocomplete
            var div = document.createElement('div');
            div.className = 'search';
            div.id=element.id+field.getAttribute("dataset-field-name");
            div.tagName="searchDiv";
            div.style.display="infline-block";
          
            element.appendChild(div);
            var label=document.createElement('label');
            label.innerHTML=field.getAttribute("dataset-field-name");
            label.id=element.id+"Label";
            label.tagName="label";
            div.appendChild(label);

            // create search input div
            var searchDiv = document.createElement('div');
            searchDiv.className = 'search';
            searchDiv.id=element.id+"_searchDiv";
            searchDiv.tagName="searchDiv";
            element.appendChild(searchDiv);
            var searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.id=element.id+"_input";
            searchInput.tagName="search";    
            searchInput.setAttribute("list", "searchList");
            searchInput.setAttribute("autocomplete", "off");
            searchInput.setAttribute("oninput", "searchAutoComplete(event,this)");
            
            searchInput.setAttribute("data-id-table-name",tableName);
            searchInput.setAttribute("data-id-field-name",field.getAttribute("dataset-field-name"));
            searchInput.setAttribute("data-id-field-type",field.getAttribute("dataset-field-type"));
            searchInput.setAttribute("data-value-field-name",field.getAttribute("dataset-field-name"));
            searchInput.setAttribute("data-value-field-type",field.getAttribute("dataset-field-type"));
            searchInput.setAttribute("onclick", "this.parentElement.querySelector('.autocomplete-results').style.display='none'");
            const autocomplete = document.createElement('div');
            autocomplete.id = element.id+'_autocomplete';
            autocomplete.className = 'autocomplete-results';
            
            searchInput.placeholder="Search";
            const searchButton = document.createElement('button');
            searchDiv.appendChild(searchInput)
            searchButton.type = 'button';    
            searchButton.innerHTML = '<i class="search-icon">&#128269;</i> ';
            searchButton.setAttribute("onclick", "gridSearch(event,'"+searchInput.id+"')");
            searchDiv.appendChild(searchButton);
            searchDiv.appendChild(autocomplete);    
            formContainer.appendChild(element);
    });
    
    return element;
}

function gridSearch(event,id)
{
    console.log("gridSearch");
    element = document.getElementById(id);
    const filedName = element.getAttribute("data-dest-field-name");
    const searchValue = filedName+"|"+element.id;
   
    searchGrid(searchValue);
}
// searchAutoComplete that call the search function "/select-distinct/:tableName/:fieldName" and display the result in the autocomplete div
function searchAutoComplete(event,element)
{
    event.preventDefault();
    const tableName = element.getAttribute("data-id-table-name");
    const fieldName = element.getAttribute("data-value-field-name");
    const fieldType = element.getAttribute("data-value-field-type");
    const fieldId   = element.getAttribute("data-id-field-name");
    const autocomplete = element.parentElement.querySelector('.autocomplete-results');
    const searchValue = element.value.trim();
    
        var url = "/select-distinct-idvalue/"+tableName+"/"+fieldName+"?id="+fieldId;
        // generate filter from searchValue if fieldType is text with openedge syntax
        if (searchValue.length>3)
            {
                switch (fieldType) {
                    case "character":
                        url=url+"&filter="+fieldName+" like '%"+searchValue+"%'";
                        break;
                    case "integer":
                        url=url+"&filter="+fieldName+"="+searchValue;
                        break;
                    case "date":
                        url=url+"&filter="+fieldName+"="+searchValue;
                        break;
                    case "logical":
                        url=url+"&filter="+fieldName+"="+searchValue;
                        break;
                    default:
                        url=url+"&filter="+fieldName+" like '%"+searchValue+"%'";;
                }
            }
        fetch(url)
        .then(response => response.json())
        .then(data => {
            autocomplete.innerHTML="";
            autocomplete.setAttribute("style","display:block;top:"+ 
                (parseInt( getAbsoluteOffset(element).top) + 
                 parseInt(element.offsetHeight))+
                 'px;width:'+element.offsetWidth+'px;');
            data.forEach(row => {
                
                var rowDiv = document.createElement('div');
                rowDiv.className = 'autocomplete-row';
                rowDiv.setAttribute("rowid",row.rowid);
                rowDiv.setAttribute("data-id-table-name",tableName);
                rowDiv.setAttribute("data-value-field-name",fieldName);
                rowDiv.setAttribute("data-value-field-type",fieldType);
                rowDiv.setAttribute("data-id-field-name",fieldId);
                rowDiv.setAttribute("data-id-search-value",searchValue);
                rowDiv.addEventListener("click", function(event) {
                    event.preventDefault();
                    element.id=row[fieldId];
                    element.value=row[fieldName];
                    autocomplete.style.display="none";
                  });
                var i=0;
                rowDiv.innerHTML=row[fieldName];
                autocomplete.appendChild(rowDiv);
                console.log(row);
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function getAbsoluteOffset(element) {
    let top = 0, left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);
    return { top,left };
}
