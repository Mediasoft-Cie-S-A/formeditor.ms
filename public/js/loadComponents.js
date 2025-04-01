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

var currentElement = null;
var elementsData = [];
// create the sidebar menu
// Load the JSON data

function replaceNameWithDescription(data) {
  return data?.map((item) => {
    const { formName, ...rest } = item;
    return {
      ...rest,
      description: formName,
      icon: "fa fa-briefcase",
      dataComponent: JSON.stringify(item.formData),
    };
  });
}

async function createSidebarSection(elementsData) {
  let components = [];
  try {
    components = await loadBusinessComponent();
  } catch (error) {
    console.error("Failed to load business components:", error);
    components = [];
  }
  const data = replaceNameWithDescription(components);
  createSidebar(elementsData, data);
}

loadJson("/elementsConfig")
  .then((data) => {
    elementsData = data;
    createSidebarSection(elementsData);
  })
  .catch((err) => {
    console.error(err);
  });

// load css
function loadCssIfNotLoaded(cssUrl, csslist) {
  // Check if the css is already loaded
  if (csslist.indexOf(cssUrl) === -1) {
    // The css is not loaded, check if it exists and load it
    fetch(cssUrl).then((response) => {
      if (response.ok) {
        // The css exists, load it
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = cssUrl;
        document.head.appendChild(link);
        csslist.push(cssUrl);
      } else {
        console.log("CSS not found: " + cssUrl);
      }
    });
  }
}

// js script
function loadScriptIfNotLoaded(scriptUrl, scriptslist) {
  // Check if the script is already loaded

  // The script is not loaded, check if it exists and load it
  try {
    return fetch(scriptUrl).then((response) => {
      if (response.ok) {
        // The script exists, load it
        var script = document.createElement("script");
        script.src = scriptUrl;
        document.body.appendChild(script);
        scriptslist.push(scriptUrl);
      } else {
        console.log("Script not found: " + scriptUrl);
      }
    });
  } catch (err) {
    console.log("Script not found: " + scriptUrl);
  }
}
// Create the sidebar
function createSidebar(elementsData, components) {
  const sidebar = document.getElementById("componentsSidebar");
  const categories = {};
  var scriptslist = [];
  var csslist = [];

  // Group elements by category
  for (const elementId in elementsData) {
    const elementData = elementsData[elementId];
    if (!categories[elementData.category]) {
      categories[elementData.category] = [];
    }
    categories[elementData.category].push(elementData);
  }

  if (components && components?.length > 0) {
    for (const component of components) {
      const category = component.category || "Business Components";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(component);
    }
  }

  // Create sidebar items
  for (const category in categories) {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category";
    const button = document.createElement("div");
    button.textContent = category;
    button.className = "category-button";
   
    button.style.backgroundColor = "#fff";
    button.style.borderRight = "3px solid green";
    button.style.justifyContent = "center";
    button.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
   
    categoryDiv.appendChild(button);
    const divContainer = document.createElement("div");
    divContainer.style.display = "none";
    divContainer.style.flexWrap = "wrap";
    divContainer.style.justifyContent = "center";
    divContainer.style.flexDirection = "row";
    divContainer.style.width = "100%";
    categoryDiv.appendChild(divContainer);

    button.addEventListener("click", function () {
     
      if (divContainer.style.display === "none") {
        divContainer.style.display = "flex";
      } else {
        divContainer.style.display = "none";
      }
    });

    const elements = categories[category];

    for (const elementData of elements) {
      const itemDiv = document.createElement("div");
      itemDiv.className = "draggable";

      itemDiv.draggable = true;
      itemDiv.innerHTML = "<i class='" + elementData.icon + "'></i> ";
      itemDiv.id = elementData.type;
      itemDiv.setAttribute("elementData", elementData.dataComponent);
      itemDiv.style.height = "40px";
      itemDiv.style.width = "40px";
      itemDiv.style.alignContent = "center";
      if (elementData.type === "grid") {
        itemDiv.style.marginBottom = "10px";
      }

      // itemDiv.addEventListener("dragstart", function (event) {
      //   const element = event.target;
      //   const id = element.id;
      //   const type = id; // If type is the same as id, use it as is or adjust as needed
      //   const formData = element.getAttribute("elementData") || "";

      //   const data = {
      //     id,
      //     type,
      //     data: formData,
      //   };

      //   event.dataTransfer.setData("text/plain", JSON.stringify(data));
      //   event.dataTransfer.setData("text", id); // Optionally, set the ID separately
      // });
      itemDiv.addEventListener("dragstart", function (event) {
        const data = {
          id: this.id,
          type: this.id,
          data: this.getAttribute("elementData"),
        };
        event.dataTransfer.setData("text/plain", JSON.stringify(data));
      });
      itemDiv.addEventListener("dblclick", doubleclick);
      itemDiv.title = elementData.description;
     
      divContainer.appendChild(itemDiv);

      // Check if the css exists
      var cssUrl = "/css/components/" + elementData.styles;
      console.log("cssUrl:" + cssUrl);
      var existingCss = csslist.find((css) => css === cssUrl);
      if (!existingCss) {
        console.log("cssUrl in:" + cssUrl);
        loadCssIfNotLoaded(cssUrl, csslist);
        csslist.push(cssUrl);
      }

      // Check if the script exists
      // Use the function
      var scriptUrl = "/js/components/" + elementData.scriptName;
      //  scriptslist.forEach(script => console.log(script));
      var existingScript = scriptslist.find((script) => script === scriptUrl);

      if (!existingScript) {
        console.log("scriptUrl:" + scriptUrl);
        loadScriptIfNotLoaded(scriptUrl).catch((error) => {
          console.log("Error loading script:", error);
        });
        scriptslist.push(scriptUrl);
      }
    }
    sidebar.appendChild(categoryDiv);
  }
}

function allowDrop(event) {
  event.preventDefault();
}

// function drag(event) {
//   event.dataTransfer.setData("text", event.target.id);
// }
function drag(event) {
  const element = event.target;
  const formData = element.getAttribute("elementData");
  if (!formData) {
    event.dataTransfer.setData("text", event.target.id);
  } else {
    event.dataTransfer.setData("text", element.id); // Set the ID of the element
    event.dataTransfer.setData("text/plain", formData || ""); // Set the form data directly
  }
}
// function drop(event) {
//   event.preventDefault();

//   var elementId = event.dataTransfer.getData("text");
//   console.log("elementId:" + elementId);
//   var newElement = createFormElement(elementId);
//   if (event.target.childElementCount) {
//     newElement.setAttribute("position", event.target.childElementCount);
//   }
//   if (newElement) {
//     event.target.appendChild(newElement);
//   }
// }

function drop(event) {
  event.preventDefault();

  const elementId = event.dataTransfer.getData("text");
  const formDataString = event.dataTransfer.getData("text/plain");

  let formData = {};
  let parsedData = {};

  try {
    if (formDataString && formDataString !== "undefined") {
      formData = JSON.parse(formDataString);
    }
  } catch (e) {
    console.error("Error parsing formData:", e);
  }
  if (!formData || formData?.data == "undefined") {
    createAndAppendElement(event);
  } else {
    try {
      parsedData = JSON.parse(formData.data);
      const parentContainer = document.getElementById("formContainer");

      if (parentContainer) {
        jsonToDom(parsedData, parentContainer);
      } else {
        console.error("Container with ID 'formContainer' not found.");
      }
    } catch (e) {
      console.error("Error parsing formData.data:", e);
    }
  }
}

function createAndAppendElement(event) {
  var elementId = event.dataTransfer.getData("text");
  let parsedObject = JSON.parse(elementId);
  var newElement = createFormElement(parsedObject.id);
  if (event.target.childElementCount) {
    newElement.setAttribute("position", event.target.childElementCount);
  }
  if (newElement) {
    event.target.appendChild(newElement);
  }
}

function doubleclick(event) {
  var elementId = event.target.id;
  var newElement = createFormElement(elementId);

  /** Check if element is other that grid (created via dedicated modal) **/
  if (event.target.id !== "grid") {
    newElement.setAttribute("position", event.target.childElementCount);
  }

  if (newElement) {
    document.getElementById("formContainer").appendChild(newElement);
  }
}

// Assuming you're in a browser environment
async function loadJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

function createFormElement(elementId) {
  var element = null;

  console.log(elementId);

  console.log(elementsData[elementId]);
  // Execute the function
  var functionName = elementsData[elementId].createFunction;
  console.log("functionName:" + functionName);
  if (typeof window[functionName] === "function") {
    console.log("functionName:" + functionName);
    element = window[functionName](elementId);
  }

  if (element) {
    element.setAttribute("tagName", elementId);
    element.className = "form-element";
    element.draggable = true;
    element.ondragstart = drag;
  }
  return element;
}
