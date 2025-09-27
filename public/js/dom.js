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

function renderElements(parent) {
  /*  var planningElements = parent.querySelectorAll('div[tagname="planning"]');
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

  var menuElements = parent.querySelectorAll('div[tagname="menuComponent"]');
  for (var i = 0; i < menuElements.length; i++) {
    console.log("menuComponent:" + menuElements[i]);
    rendenderMenuComponent(menuElements[i].getAttribute("tagName"), menuElements[i]);
  } */
  // load the config in the element.json
  loadJson("/elementsConfig")
    .then((data) => {
      console.log("elementsConfig loaded");
      console.log(data);


      // Loop through each element in the data
      for (const elementId in data) {

        const element = data[elementId];

        // Check if the element has a tagname attribute
        if (element.type) {
          // Find all elements with the specified tagname
          var elements = parent.querySelectorAll('div[tagname="' + element.type + '"]');
          // Loop through each found element and apply the configuration
          for (var j = 0; j < elements.length; j++) {
            var el = elements[j];
            console.log("el:" + el);
            // Apply the configuration to the element
            // get the render function from the config
            var renderFunction = element.renderFunction;
            if (renderFunction) {
              console.log("renderFunction:", renderFunction);

              // ⚠️ Sécurité spécifique pour renderMenuComponentHorizontal
              if (
                renderFunction === "renderMenuComponentHorizontal" &&
                (!el.getAttribute("items") || el.getAttribute("items") === "null")
              ) {
                console.warn("⛔ Menu ignoré temporairement car 'items' est vide.");
                continue; // Skip this element
              }

              window[renderFunction](el);
            } else {
              console.log("No render function found for tagname: " + element.type);
              /*
              */
            }

          }
        }
      }
    })
    .catch((err) => {
      console.error(err);
    });

}
// Function to create DOM element from JSON
function createDomElement(json, parent) {
  console.log("Creating DOM element from JSON:", json);

  if (json.tag) {
    // Create element for tag
    var element = document.createElement(json.tag);

    // Set attributes
    if (json.attributes) {

      for (var attr in json.attributes) {


        try {
          element.setAttribute(attr, json.attributes[attr]);
        }
        catch {
          console.log("error: " + attr);
        }
      }
    }

    if (json.text || json.innerText || json.textContent) {
      element.textContent = json.text || json.innerText || json.textContent;
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
  var objectId = document.getElementById("objectId").value;
  var jsonData = domToJson(formContainer);
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(jsonData));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", objectId + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function promptCreateForm() {


  loadJson("/elementsConfig")
    .then(async (data) => {


      const minimalData = Object.entries(data).map(([key, comp]) => ({
        name: key,
        type: comp.type,
        description: comp.description,
        category: comp.category,
        props: comp.props ? Object.keys(comp.props) : []
      }));


      console.log("Minimal Data:", minimalData);

      const userInput = prompt("Describe the form you want to create:");

      if (!userInput) {
        return; // User cancelled or input is empty
      }

      let aiPrompt = `
        You are a form generation assistant.

        Based on the user's request, generate a form structure in JSON or HTML format.

        Request:
        "${userInput}"
      `.trim();

      aiPrompt = `
        You are a form generation assistant.

        You have access to a predefined list of UI components. Based on the user's request, generate the corresponding form element(s) using the JSON structure provided below.

        Only use components from the following list, and match their properties:

        === Component Definitions ===
        ${JSON.stringify(minimalData, null, 2)}
        =============================

        User Request:
        "${userInput}"

        Respond ONLY with valid JSON that matches the structure of one or more components from the list above.

        Do not explain, comment, or include any other text — just return JSON.
      `.trim();


      console.log("AI Prompt:", aiPrompt);


      try {
        const response = await askAi(aiPrompt);
        console.log("AI Response:", response);

        // Handle single or multiple components
        let components = JSON.parse(response);
        components = Array.isArray(components) ? components : [components];

        // Load full component definitions
        const fullComponentDefs = data; // this is your elementsConfig

        const formContainer = document.getElementById("formContainer");

        components.forEach((comp) => {
          try {
            const enriched = enrichComponent(comp, fullComponentDefs);
            console.log("Enriched Component:", enriched);
            console.log("Form Container:", formContainer);
            //createDomElement(enriched, formContainer);
            const newElement = createFormElement(enriched.type);

            if (newElement) {
              formContainer.appendChild(newElement);
            }

          } catch (e) {
            console.error("Component error:", e);
          }
        });

        // You can display or inject the result here
        // alert("AI Response:\n" + response);
      } catch (err) {
        console.error("Error communicating with AI:", err);
        alert("An error occurred while generating the form.");
      }
    })
    .catch((err) => {
      console.error("Error loading elementsConfig:", err);
      alert("Failed to load form components.");
    });
}

function enrichComponent(aiJson, fullComponentDefs) {
  const type = aiJson.type;
  const baseDef = fullComponentDefs[type] || Object.values(fullComponentDefs).find(def => def.type === type);

  console.log("type:", type);
  console.log("Base Definition:", baseDef);
  console.log("AI JSON:", aiJson);
  console.log("Available types:", Object.keys(fullComponentDefs)); // See if "inputField" is really there

  if (!baseDef) {
    throw new Error(`Unknown component type: ${type}`);
  }

  // Fix invalid props from AI
  if (!aiJson.props || typeof aiJson.props !== "object" || Array.isArray(aiJson.props)) {
    aiJson.props = {};
  }

  // Merge AI-provided properties with the defaults
  const merged = {
    ...baseDef,
    props: {
      ...baseDef.props,
      ...aiJson.props // AI may provide overrides
    }
  };

  return merged;
}




// Function to handle tab switch
function onTabSwitch(event) {
  var target = event.target.getAttribute("href");
  console.log(target);
  removeSelection();
  hideEditMenu();

  switch (target) {
    case "#pageList":
      console.log("PageList");
      // Load pages
      loadPages();
      break;

    case "#formsList":
      console.log("formsList");
      // Load forms
      loadForms();

      break;

    case "#editForm":
      console.log("editForm");
      // Load forms
      drageDroptableTableList(document.getElementById("drageDroptablesList"));
      dragDropApiList(document.getElementById("dragDropApiList"));
      break;

    case "#renderForm":
      console.log("renderForm");
      break;

    case "#DatabaseForm":
      console.log("DatabaseForm");
      const list = document.getElementById("ContentTableListBar");
      const detailsDiv = document.getElementById("mtableDetails");
      createEditableTableList(list, detailsDiv);
      break;
  }


}

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

// Add event listeners to tab links
var tabLinks = document.querySelectorAll(".nav-tabs a");
tabLinks.forEach(function (link) {
  link.addEventListener("click", onTabSwitch);
  // set the first tab as active


});

// Set the first tab as active
if (tabLinks.length > 0) {
  // simulate a click on the first tab
  tabLinks[0].click();
}