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

/*This function createElementButton creates a new HTML element of a given type,
sets its text content to the type, adds two event listeners to it, and returns the created element. 
The double-click event listener calls the editElement function with the element and its type as arguments,
 and the click event listener calls the selectElement function with the element as an argument.
*/
function createCookieStorage(type) {
    const main = document.createElement("div");
    main.className = "form-element";
    main.id = `cookieStorage-${Date.now()}`;
    main.setAttribute("tagName", type);
    main.draggable = true;
    main.dataset.type = type;

    // Display message when no variables are set
    main.textContent = "No variables set yet.";
    
    return main;
}

function editCookieStorage(type, element, content) {
    // Clear the content area to prevent duplicates
    const div = document.createElement("div");
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "5px";
    div.style.padding = "10px";
    // Button to save all variables as cookies
    const saveButton = document.createElement("button");
    saveButton.textContent = "Update";
    saveButton.onclick = () => saveAllCookies(element,content);
    saveButton.style.width = "100%";
    div.appendChild(saveButton);
    // Create a container div for the variables
    const vardiv = document.createElement("div");
    vardiv.id = "cookieStorage";
    vardiv.draggable = true;   
    div.appendChild(vardiv);

    // Button to add new variables
    const addButton = document.createElement("button");
    addButton.textContent = "Add Var";
    addButton.onclick = () => addVariableInput(element, vardiv);
    addButton.style.width = "100%";

    
    // Append the Add and Save buttons to the property bar
    div.appendChild(addButton);
    content.appendChild(div);

    // Display existing variables if any
    const variables = JSON.parse(element.dataset.cookies || "[]");

    // Add input fields for each variable
    variables.forEach(({ name }) => {
        addVariableInput(element, vardiv, name);
    });
}

function renderCookieStorage(main) {
    // Clear previous content
    main.innerHTML = "";
    main.border= "none";    
    //get main.dataset.cookies
    variables = JSON.parse(main.getAttribute("data-cookies"));
    // Retrieve or initialize the variables from cookies
    // Render each variable as a <select> element with the stored cookie value
    variables.forEach(({ name,description, type, value , DBName }) => {
        // Create a container for each variable
        const varContainer = document.createElement("div");
        varContainer.className = "variable-container";
       
        varContainer.style.padding = "5px";
    
        let label = document.createElement("label");
        if (description) {
            label.textContent = `${description}: `;
        } else {
        label.textContent = `${name}: `;
        }
        varContainer.appendChild(label);
        var cookieValue = getCookie(name);  
        switch (type) {
            case "Value":
                // write variable value
                let val = document.createElement("span");
                val.textContent = cookieValue;
                val.style.width = "150px";
                val.title = cookieValue;

                varContainer.appendChild(val);
                break;
            case "Array":
                // slice the value to get the array
                let array = value.split(",");
                // write array values in select
                select = document.createElement("select");
                select.setAttribute("var_name", name);  
                select.style.width = "150px";
                select.title = cookieValue;
                array.forEach((val) => {
                    
                    let option = document.createElement("option");
                    // check if in val there is a |
                    if (val.includes("|")) {
                        // split the val to get the value and the text
                        let splitVal = val.split("|");
                        option.textContent = splitVal[1];   
                        option.value = splitVal[0];
                    } else {
                    option.textContent = val;
                    option.value = val;
                    }
                    // set the value of the variable to the selected value
                    select.appendChild(option);
                    // set the value of the variable to the selected value
                    if (val === cookieValue) {
                        console.log(cookieValue);
                        select.value = cookieValue;
                    }
                }
                );
                // excute the search when the select changes
                updateDataObjects(name,select,DBName);
                // change the value of the variable when the select changes
                select.onchange = () => {
                    console.log("select onchange",name,select,DBName);
                    updateDataObjects(name,select,DBName);
                };

                varContainer.appendChild(select);
            break;
            case "Query":
                // execute the query and write the result in select
                let SQL = value;
                
                select = document.createElement("select");
                select.setAttribute("var_name", name);  
                select.style.width = "150px";
                select.title = cookieValue;
                const url = `/query-data/${DBName}/${SQL}`;
                fetch(url)
                .then(response => response.json())
                .then(data => {
                    data.forEach((val) => {
                        let option = document.createElement("option");
                        // convert the val json in array
                        val = Object.values(val);
                        // check if in val there is a , 
                        if (val.length > 1) {
                            
                            option.textContent = val[1];
                            option.value = val[0]; 
                        } else {
                        option.textContent = val[0];
                        option.value = val[0];
                        }
                        // set the value of the variable to the selected value
                        select.appendChild(option);
                        // set the value of the variable to the selected value
                        if (val === cookieValue) {
                            console.log(cookieValue);
                            select.value = cookieValue;
                        }
                    });
                });
               // excute the search when the select changes
               updateDataObjects(name,select,DBName);
               // change the value of the variable when the select changes
               select.onchange = () => {
                   updateDataObjects(name,select,DBName);
               };

               varContainer.appendChild(select);
            break;
        }
                

        // Add the variable container to the main display
        main.appendChild(varContainer);
    });
}

function updateDataObjects(name,select,DBName){
    console.log("updateDataObjects",name,select,DBName);
    cookieValue = select.value;
                    setCookie(name, cookieValue, 1);
                    //let test = getDataGridObject();
                      // get all the grid div with attribute tagname=dataGrid
                     let idObjects = document.querySelectorAll("div[tagname='dataGrid']");
                                       
                    idObjects.forEach((idObject) => {{
                      console.log(idObject.id);
                      // get data from 
                   
                      const var_name = select.getAttribute("var_name");
                        searchGrid(DBName, var_name, "=", cookieValue, idObject.id);
                    
                        }
                     });
                     // get dataPanel div with attribute tagname=dataPanel
                     let idObjects2 = document.querySelectorAll("div[tagname='DataPanel']");
                        idObjects2.forEach((idObject) => {{
                        console.log(idObject.id);
                        // get data from 
                    
                        const var_name = select.getAttribute("var_name");
                        // set filter in dataPanel
                        idObject.setAttribute("filter", JSON.stringify({ [var_name]: cookieValue }));
                        // search in dataPanel
                        renderDataPanel(idObject);  
                        
                            }
                        });
}
// Helper function to get a cookie by name
function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookiesArray = document.cookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i].trim();
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
    }
    return null;
}

// Helper function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}


// Adds a variable input section in the property bar
function addVariableInput(element, content, name = "") {
    console.log("Adding variable input");
     datacookies = JSON.parse(element.getAttribute("data-cookies"));
     if (datacookies === null) {
        datacookies = [];
        }
    currentVariables = datacookies.find(({ name: n }) => n === name);
    console.log(currentVariables);
    // Container for the variable input fields
    const varContainer = document.createElement("div");
    varContainer.className = "variable-container";
    
    const description = document.createElement("input");
    description.type = "text";
    description.placeholder = "Description";
    description.value = currentVariables?.description!=undefined?currentVariables?.description:"";
    description.setAttribute("tag", "var_description");
    
    // Input for the variable name
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Variable Name";
    nameInput.value = name!=undefined?name:"";
    nameInput.setAttribute("tag", "var_name");
    
    // Predefined options for the select dropdown¨
    // Select dropdown for the variable value
    const valueSelect = document.createElement("select");
    valueSelect.className = "cookie-storage-container-select";
    valueSelect.setAttribute("ondragover", "allowDrop(event)");
    // div.setAttribute("ondrop", "dropInput(event,'${id}')");
    valueSelect.setAttribute("tag", "var_type");
    const options = ["Value", "Array", "Query"];
    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        valueSelect.appendChild(option);
        if (currentVariables?.type === opt) {
            valueSelect.value = opt;
        }
    });    
    valueSelect.addEventListener("drop", function (event) {
        // drop input
      });
    
    const valueDB = document.createElement("input");
    valueDB.type = "text";
    valueDB.placeholder = "Database Name";
    valueDB.value = currentVariables?.DBName!=undefined?currentVariables?.DBName:"msdb";
    valueDB.setAttribute("tag", "db_name");


    
    valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.placeholder = "Variable Value";
    valueInput.value = currentVariables?.value!=undefined?currentVariables?.value:"";
    valueInput.setAttribute("tag", "var_value");

    // Predefined options for the select dropdown

    // Button to remove this variable entry
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.style.width = "100%";
    removeButton.onclick = () => {
        varContainer.remove();
        updateStoredVariables(element,content);
    };

    
    // Append inputs and remove button to the container
    varContainer.appendChild(nameInput);
    varContainer.appendChild(description);   
    varContainer.appendChild(valueSelect);
    varContainer.appendChild(valueInput);
    varContainer.appendChild(valueDB);
    varContainer.appendChild(removeButton);

    // Add the container to the property bar
    content.appendChild(varContainer);
    updateStoredVariables(element,content);
}

// Save all defined variables as cookies
function saveAllCookies(element,content) {
   // generate the variables from the div cookieStorage
    console.log("Saving all cookies");
    updateStoredVariables(element,content);
    const cookieStorage = content.querySelector("#cookieStorage");
    const variables = Array.from(cookieStorage.querySelectorAll(".variable-container")).map(container => {
        return {
            name: container.querySelector("[tag=var_name]").value,
            type: container.querySelector("[tag=var_type]").value,
            value: container.querySelector("[tag=var_value]").value
            
        };
    });
    // set the cookie for each variable
    variables.forEach(({ name, type, value }) => setCookie(name, value, 1));
    renderCookieStorage(element); // Refresh component display
}

// Update the stored variables in the component's dataset
function updateStoredVariables(element,content) {
    // generate the variables from the div cookieStorage
    const variables = Array.from(content.querySelectorAll(".variable-container")).map(container => {
        return {
            name: container.querySelector("[tag=var_name]").value,
            type: container.querySelector("[tag=var_type]").value,
            description: container.querySelector("[tag=var_description]").value,
            value: container.querySelector("[tag=var_value]").value,
            DBName: container.querySelector("[tag=db_name]").value
        };
    });

    console.log(variables);
    element.setAttribute("data-cookies", JSON.stringify(variables));
    
}

// Helper function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

// Helper function to get a cookie by name
function getCookie(name) {
    const nameEQ = `${name}=`;
    const cookiesArray = document.cookie.split(';');
    for (let i = 0; i < cookiesArray.length; i++) {
        let cookie = cookiesArray[i].trim();
        if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
    }
    return null;
}
