

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
    div.style.width = "150px";
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
   
    //get main.dataset.cookies
    variables = JSON.parse(main.getAttribute("data-cookies"));
    // Retrieve or initialize the variables from cookies
    // Render each variable as a <select> element with the stored cookie value
    variables.forEach(({ name,description, type, value  }) => {
        // Create a container for each variable
        const varContainer = document.createElement("div");
        varContainer.className = "variable-container";
        varContainer.style.border = "1px solid #ccc";   
        varContainer.style.padding = "10px";
        varContainer.style.borderRadius = "5px";
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
                    option.textContent = val;
                    option.value = val;
                    select.appendChild(option);
                    // set the value of the variable to the selected value
                    if (val === cookieValue) {
                        console.log(cookieValue);
                        select.value = cookieValue;
                    }
                }
                );
                // excute the search when the select changes
                updateGrid(name,select);
                // change the value of the variable when the select changes
                select.onchange = () => {
                    updateGrid(name,select);
                };

                varContainer.appendChild(select);
            break;
            case "Query":
                // execute the query and write the result in select
                let SQL = value.split("|")[1];
                let DBName = value.split("|")[0];
                select = document.createElement("select");
                select.setAttribute("var_name", name);  
                select.style.width = "150px";
                select.title = cookieValue;
                const url = `/query-data/${DBName}/${SQL}`;
                fetch(url)
                .then(response => response.json())
                .then(data => {
                    data.forEach((idx,val) => {
                        let option = document.createElement("option");
                        option.textContent = val;
                        option.value = val;
                        select.appendChild(option);
                        // set the value of the variable to the selected value
                        if (val === cookieValue) {
                            console.log(cookieValue);
                            select.value = cookieValue;
                        }
                    });
                });
               // excute the search when the select changes
               updateGrid(name,select);
               // change the value of the variable when the select changes
               select.onchange = () => {
                   updateGrid(name,select);
               };

               varContainer.appendChild(select);
            break;
        }
                

        // Add the variable container to the main display
        main.appendChild(varContainer);
    });
}

function updateGrid(name,select){
    cookieValue = select.value;
                    setCookie(name, cookieValue, 1);
                    //let test = getDataGridObject();
                    let idObject = getDataGridObject();
                    // getIdObject();
                    console.log(idObject);
                    if (idObject?.dataGrid) {
                      const gridDiv = document.getElementById(idObject.dataGrid);
                      const datasetgrid =JSON.parse( gridDiv.getAttribute("datasetgrid"));
                      const var_name = select.getAttribute("var_name");
                     // find DBName based on the field name = var_name
                      const DBName = datasetgrid.find((field) => field.fieldName === var_name).DBName;
                      
                      console.log(DBName);
                      searchGrid(DBName, var_name, "=", cookieValue, idObject.dataGrid);
                    }
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
            value: container.querySelector("[tag=var_value]").value
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
