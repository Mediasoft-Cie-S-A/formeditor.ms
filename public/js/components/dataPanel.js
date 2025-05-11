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


// This function creates a new HTML element of a given type, sets its ID and tag name, and makes it draggable.
function createDataPanel(type) {
    var main = document.createElement("div");
    main.className = "form-container";
    main.id = type + Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName = type;
    const list = document.getElementById("ContentTableList");
    const detailsDiv = document.getElementById("tableDetails");
  
    return main;
  }
  
  function editDataPanel(type, element, content) {
    const button = document.createElement("button");
    button.textContent = "update";
    button.style.width = "100%";
    button.onclick = function (event) {
        event.preventDefault();
        // get the target element
        var target = document.getElementById("propertiesBar");
     
      var dbinput = target.querySelector("[tagname='dbname']");
        var select = target.querySelector("[tagname='select']");

      const dataDiv= target.querySelector("[objecttype='Data']");
      // check if select is empty
      if (select.value == "") {
        let select = "";
        // for each div in dataDiv.children
        const dataDivChildren = dataDiv.querySelectorAll("div");
        dataDivChildren.forEach((child) => {
          // check if the child is selected
          // get the <span> element
          const span = child.querySelector("span");
          const datafield=JSON.parse( span.getAttribute("data-field"));
          // get the description
          const description = child.querySelector("input[type='text']").value;
          // check if the span is selected
          const functionName = child.querySelector("select").value;
          // genetate the select and store in element with datafield.fieldName,description and function name
          if (select == "") {
            switch (functionName) {
              case "count":
                select = "select count(*) \"" + description + "\" from PUB." + datafield.tableName;
                break;
              case "sum":
                select = "select sum(" + datafield.fieldName + ") \"" + description + "\" from PUB." + datafield.tableName;
                break;
              case "avg":
                select = "select avg(" + datafield.fieldName + ") \"" + description + "\" from PUB." + datafield.tableName;
                break;
              case "min":
                select = "select min(" + datafield.fieldName + ") \"" + description + "\" from PUB." + datafield.tableName;
                break;
              case "max":
                select = "select max(" + datafield.fieldName + ") \"" + description + "\" from PUB." + datafield.tableName;
                break;
              default:
                select = "select * from PUB." + datafield.tableName;
            }
          }
          element.setAttribute("data", JSON.stringify(datafield));
          element.setAttribute("description", description);
          element.setAttribute("function", functionName);
       
          var jsonData = {
        DBName: datafield.DBName,
        select: select   
          }
           // set the sql attribute
        if (jsonData != null) {
            element.setAttribute("sql", JSON.stringify(jsonData));
            }

          
       });
      }else {
      // generate the json data
      var jsonData = {
        DBName: dbinput.value,
        select: select.value,
      };
        // set the sql attribute
        if (jsonData != null) {
            element.setAttribute("sql", JSON.stringify(jsonData));
            }

          }
      renderDataPanel(element);
    };
    content.appendChild(button);
  
   
    content.appendChild(createSQLBox("SQL", "sql", "sql"));
  
    const data = createMultiSelectItem("Data", "data", "data", element.getAttribute('data'), "text", true);
    content.appendChild(data);
    
    if (element.getAttribute("data") != null) {
      const field= addFieldToPropertiesBar(data, config,true);
      // find input and put the description in it
      const input = field.querySelector("input[type='text']");
      input.value = element.getAttribute("description");
      // find select and put the function in it
      const select = field.querySelector("select");
      select.value = element.getAttribute("function");
      // find span and put the data-field in it
      
    }
      // sql
      if (element.getAttribute("sql") != null) {
        var target = content.querySelector("#SQL");
        var jsonData = JSON.parse(element.getAttribute("sql"));
      
        // add the db name
        if (jsonData.DBName != null) {
          var dbinput = target.querySelector("[tagname='dbname']");
          dbinput.value = jsonData.DBName;
        }
        // add the select
        if (jsonData.select != null) {
          var select = target.querySelector("[tagname='select']");
          select.value = jsonData.select;
        }
        // add the update
      
      
    } // end if sql
  
  
   
  }
  

  
  function renderDataPanel(main) {
    main.innerHTML = ""; // Clear the content of the main element
    main.className = "DataPanel";
     // get the sql attribute    
    const sqljson = JSON.parse(main.getAttribute("sql"));
    // check if the sql is not null
    if (sqljson == null) {
      return;
    }

    const dbName = sqljson.DBName;
    let select = sqljson.select;
    // get the json filter 
    const jsonFilter = JSON.parse(main.getAttribute("filter"));
    // check if the json filter is not null
    if (jsonFilter != null) {

         // check if there is a where clause (upper case or lower case)
       if (select.toLowerCase().includes("where")) {
        // add the filter to the sql
        select +=  " and " + Object.keys(jsonFilter)[0] + " = '" + Object.values(jsonFilter)[0] + "'";
        } else {
        // add the filter to the sql
        select +=  " where " + Object.keys(jsonFilter)[0] + " = '" + Object.values(jsonFilter)[0] + "'";
       }
    }
        // execute the sql
       // get the data with query select "/table-data-sql/:database/:page/:pageSize"?sqlQuery=select * from table
    const url = "/table-data-sql/" + dbName + "/1/10?sqlQuery=" + select;
       const response =  fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        // handle the data here
        console.log(data);
        //generate the panel with the data
        const dataPanel = document.createElement("div");
        dataPanel.className = "DataPanel-result-header";
        // create the title
        const title = document.createElement("h3");
        //get the key of the first element of the data
        const titleText = Object.keys(data[0]);
     
        title.textContent = titleText;
        dataPanel.appendChild(title);
        // create the valule with H1
        const value = document.createElement("h1");
        //get the first element of the data
        const valueText =Object.values(data[0]);
        value.textContent = valueText;
        dataPanel.appendChild(value);
        main.appendChild(dataPanel);
      }).catch((error) => {
            console.error("Error:", error);
        });
  }
  
