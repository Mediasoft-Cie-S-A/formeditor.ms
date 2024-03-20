
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
    element = document.createElement("div");
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
    select.setAttribute('onclik', 'filterData(this)');
    // create options
    // insert options
    element.appendChild(label);
    element.appendChild(select);

    return element;
}



function editElementCombox(type,element,content)
{
   // adding tableName property to the element
   const button = document.createElement('button');
   button.textContent = 'update';
   button.onclick = function() {
        const propertiesBar = document.getElementById('propertiesBar');
        const gridID=propertiesBar.querySelector('label').textContent;                
        const main = document.getElementById(gridID);  
        updateComboBoxData(main,content);
   };
   content.appendChild(button);
   content.appendChild(createMultiSelectItem("Data", "data", "data"));
   content.appendChild(createMultiSelectItem("Link", "link", "link")); 
   content.appendChild(createSelectItem("Filter", "filter", "filter",element.getAttribute('filter'),"text",true));  

   // load the data
   // check if jsonData is not empty
   if (element.getAttribute('datasetgrid')!=null)
   {
       var target=content.querySelector('#Data');
       var jsonData=JSON.parse(element.getAttribute('datasetgrid'));
       jsonData.forEach(fieldJson => {
           addFieldToPropertiesBar(target,fieldJson);
       });
   }

   if (element.getAttribute('datalink')!=null)
   {
       var target=content.querySelector('#Link');
       var jsonData=JSON.parse(element.getAttribute('datalink'));
       jsonData.forEach(fieldJson => {
           addFieldToPropertiesBar(target,fieldJson);
       });
   }
}

function updateComboBoxData(main,content)
{
   // get all the span elements from data 
    var data=content.querySelectorAll('#Data span[name="dataContainer"]');
    // generate the json of all the data
    var jsonData=[];
    data.forEach(span => {
        console.log(span.getAttribute("data-field"));
        // get the json data from the span
        var json=JSON.parse(span.getAttribute("data-field"));
        // add the field to the json
        jsonData.push(json);
    });
    main.setAttribute("datasearch",JSON.stringify(jsonData));

    // get all the span elements from data 
    var link=content.querySelectorAll('#Link span[name="dataContainer"]');
    // generate the json of all the data
    var jsonData=[];
    link.forEach(span => {
        console.log(span.getAttribute("data-field"));
        // get the json data from the span
        var json=JSON.parse(span.getAttribute("data-field"));
        // add the field to the json
        jsonData.push(json);
    });
    main.setAttribute("datalink",JSON.stringify(jsonData));

    refreshCombox(main);
}

function refreshCombox(element) {
  // get the data from the element
  var data=element.getAttribute("dataSearch");
  // parse the json
  var jsonData=JSON.parse(data);
  console.log(jsonData);
  // get the main div
 
  const tableName = jsonData[0].tableName;
  const fieldName = jsonData[0].fieldName;
  const fieldType = jsonData[0].fieldType;
  element.querySelector("label").innerText=fieldName;
  var url = "/select-distinct-idvalue/"+tableName+"/"+fieldName+"?id="+fieldName;
  fetch(url)
  .then(response => response.json())
  .then(data => {
      var select=element.querySelector("select");
      data.forEach(row => {          
        var option = document.createElement("option");
        option.text = row[fieldName];
        option.value = row[fieldName];
        select.add(option);          
      });
  })
  .catch(error => {
      console.error(error);
  });


}