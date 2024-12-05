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

// Function to create json from DOM
function domToJson(element) {
  // Create an array to hold the JSON representation of the children
  var childrenJson = [];

  // Process only the children of the provided element
  Array.from(element.childNodes).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      childrenJson.push(elementToJson(child));
    } else if (
      child.nodeType === Node.TEXT_NODE &&
      child.textContent.trim() !== ""
    ) {
      childrenJson.push({ text: child.textContent });
    }
  });

  // If there's only one child, return it directly, otherwise return the array
  return childrenJson.length === 1 ? childrenJson[0] : childrenJson;
}
// Function to convert DOM to JSON
function elementToJson(element) {
  var obj = {
    tag: element.tagName.toLowerCase(),
    attributes: {},
    children: [],
  };

  Array.from(element.attributes).forEach((attr) => {
    obj.attributes[attr.name] = attr.value;
  });

  Array.from(element.childNodes).forEach((child) => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      obj.children.push(elementToJson(child));
    } else if (
      child.nodeType === Node.TEXT_NODE &&
      child.textContent.trim() !== ""
    ) {
      obj.children.push({ text: child.textContent });
    }
  });

  return obj;
}

// Function to convert JSON to DOM
function jsonToDom(json, parent) {
  if (Array.isArray(json)) {
    json.forEach((childJson) => createDomElement(childJson, parent));
  } else {
    createDomElement(json, parent);
  }
  
}
  // planning

function renderElements(parent){
  var planningElements = parent.querySelectorAll('div[tagname="planning"]');
  for (var i = 0; i < planningElements.length; i++) {
    console.log("planning:" + planningElements[i]);
    gantrender(planningElements[i]);
  }
  // grids
  var gridElements = parent.querySelectorAll('div[tagname="dataGrid"]');
  for (var i = 0; i < gridElements.length; i++) {
    console.log("grid:" + gridElements[i]);
    //  searchGrid("",gridElements[i])
    renderGrid(gridElements[i]);
  }

  var datasetElements = parent.querySelectorAll('div[tagname="dataSet"]');
  for (var i = 0; i < datasetElements.length; i++) {
    console.log("dataset:" + datasetElements[i]);
    renderDataSet(datasetElements[i]);
  }

  var cookieStorageElements = parent.querySelectorAll('div[tagname="cookieStorage"]');
  for (var i = 0; i < cookieStorageElements.length; i++) {
    console.log("cookieStorage:" + cookieStorageElements[i]);
    renderCookieStorage(cookieStorageElements[i]);    
  }
}
// Function to create DOM element from JSON
function createDomElement(json, parent) {
  if (json.tag) {
    // Create element for tag
    var element = document.createElement(json.tag);

    // Set attributes
    if (json.attributes) {
      for (var attr in json.attributes) {
        element.setAttribute(attr, json.attributes[attr]);
      }
    }

    element.classList.remove("gjs-selection");
    // onlyEditor is used to hide the element in the render view
    if (element.getAttribute("onlyEditor") === "true") {
      element.style.display = "none";
    }
    // Append to parent
    parent.appendChild(element);

    // Process children
    if (json.children) {
      json.children.forEach((child) => {
        jsonToDom(child, element);
      });
    }
  } else if (json.text) {
    // Create text node
    var textNode = document.createTextNode(json.text);
    parent.appendChild(textNode);
  }
}

// Function to export the json to file
function exportJson() {
  var formContainer = document.getElementById("formContainer");
  var formId = document.getElementById("formId").value;
  var jsonData = domToJson(formContainer);
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(jsonData));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", formId + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// Function to handle tab switch
function onTabSwitch(event) {
  var target = event.target.getAttribute("href");
  console.log(target);
  removeSelection();
  hideEditMenu();
  if (target === "#formsList") {
    console.log("formsList");
    // Load forms
    loadForms();
  }

  if (target === "#editForm") {
    console.log("editForm");
    // Load forms
    drageDroptableTableList(document.getElementById("drageDroptablesList"));
    dragDropApiList(document.getElementById("dragDropApiList"));
  }

  if (target === "#renderForm") {
    var formContainer = document.getElementById("formContainer");
    var jsonData = domToJson(formContainer);
    console.log(jsonData);
    var renderContainer = document.getElementById("renderForm");

    // Clear previous content
    renderContainer.innerHTML = "";

    // Convert JSON back to DOM and append
    var domContent = jsonToDom(jsonData, renderContainer);
  }
  if (target === "#DatabaseForm") {
    const list = document.getElementById("ContentTableListBar");
    const detailsDiv = document.getElementById("mtableDetails");
    createEditableTableList(list, detailsDiv);
  }
}

// Add event listeners to tab links
var tabLinks = document.querySelectorAll(".nav-tabs a");
tabLinks.forEach(function (link) {
  link.addEventListener("click", onTabSwitch);
});

function jsonToDomBusinessComponent(json, parent) {
  // Helper function to create an element from JSON structure
  function createDomElement(node, parentElement) {
    if (!node || !node.tag) return;

    const element = document.createElement(node.tag);

    // Add attributes to the element
    if (node.attributes) {
      Object.keys(node.attributes).forEach((attr) => {
        element.setAttribute(attr, node.attributes[attr]);
      });
    }

    // Recursively add children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((childNode) =>
        createDomElement(childNode, element)
      );
    }

    // Append the element to the parent
    parentElement.appendChild(element);
  }

  // Create DOM elements from JSON structure
  if (Array.isArray(json)) {
    json.forEach((childJson) => createDomElement(childJson, parent));
  } else {
    createDomElement(json, parent);
  }

  
  // Processing specific elements with `tagname` attribute
  // Planning
  var planningElements = parent.querySelectorAll('div[tagname="planning"]');
  for (var i = 0; i < planningElements.length; i++) {
    console.log("planning:" + planningElements[i]);
    gantrender(planningElements[i]); // Custom function to render planning elements
  }

  // Grids
  var gridElements = parent.querySelectorAll('div[tagname="dataGrid"]');
  for (var i = 0; i < gridElements.length; i++) {
    console.log("grid:" + gridElements[i]);
    renderGrid(gridElements[i]); // Custom function to render grid elements
  }

  // Datasets
  var datasetElements = parent.querySelectorAll('div[tagname="dataSet"]');
  for (var i = 0; i < datasetElements.length; i++) {
    console.log("dataset:" + datasetElements[i]);
    renderDataSet(datasetElements[i]); // Custom function to render dataset elements
  }

  // cookieStorage
  var cookieStorageElements = parent.querySelectorAll('div[tagname="cookieStorage"]');
  for (var i = 0; i < cookieStorageElements.length; i++) {
    console.log("cookieStorage:" + cookieStorageElements[i]);
    renderCookieStorage(cookieStorageElements[i]); // Custom function to render cookieStorage elements
  }
}
