
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

function createBooleanSearch(type) {
    element = document.createElement("div");
    element.textContent = "";
    element.id=type+ Date.now(); // Unique ID for each new element
    element.tagName=type;
    element.className = 'container';
    // create label
    var label = document.createElement('label');
    label.textContent = 'label';
    
    label.tagName=type;
    // create select
    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.tagName=type;
    checkbox.setAttribute('onclik', 'filterDataBooleanSearch(this)');
    checkbox.className = 'apple-switch';
    // create options
    element.appendChild(label);
    element.appendChild(checkbox);
    // create the select


    return element;
}



function editBooleanSearch(type,element,content)
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
     // create the input for the label
   content.appendChild(createInputItem("Label", "label", "label",element.getAttribute('label'),"text",true));
   // create the checkbox for set the default value
    content.appendChild(createInputItem("Default", "default", "default",element.getAttribute('default'),"checkbox",true));

   
   content.appendChild(createMultiSelectItem("Data", "data", "data"));
   content.appendChild(createMultiSelectItem("Link", "link", "link")); 

   // assign the label to the checkbox
   if (element.getAttribute('label')!=null)
    {
         var target=content.querySelector('#label input[type="text"]');
         target.value=element.getAttribute('label');
    }
    // assign the default value to the checkbox
    if (element.getAttribute('default')!=null)
     {
            var target=content.querySelector('#default input[type="checkbox"]');
            target.checked=element.getAttribute('default');
     }
   
   // load the data
   // check if jsonData is not empty
   if (element.getAttribute('datasearch')!=null)
   {
       var target=content.querySelector('#Data');
       var jsonData=JSON.parse(element.getAttribute('datasearch'));
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
    // get the label
    var label=content.querySelector('#label input[type="text"]').value;
    /// get the value of the default checkbox
    var defaultValue=content.querySelector('#default input[type="checkbox"]').checked;
    // set the label
    main.setAttribute("label",label);
    // set the default value
    main.setAttribute("default",defaultValue);
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

    refreshBooleanSearch(main);
}

function refreshBooleanSearch(element) {
  
  // get datasearch
    var data=JSON.parse( element.getAttribute("datasearch"));
    // get the label
    var label=element.querySelector('label');
    // get the checkbox
    var checkbox=element.querySelector('input[type="checkbox"]');
    // set the label
    label.textContent=data.fieldLabel;
    // set the checkbox
    checkbox.setAttribute('data-field',JSON.stringify(data));
    // set the checkbox value
    checkbox.value=data.fieldValue;
    

}

function filterDataBooleanSearch(element) {
    // get the main div
    var data=element.getAttribute("dataSearch");
    // parse the json
    var jsonData=JSON.parse(data);
    console.log(jsonData);
    // get the main div
    var main=element.parentNode;
    // get the data from the element
    var data=main.getAttribute("dataSearch");
    // parse the json
    var jsonData=JSON.parse(data);
    console.log(jsonData);
}