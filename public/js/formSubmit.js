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

// store form data in mongoDB

document
  .getElementById("formDataForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("submit");

    var formId = document.getElementById("formId").value;
    var formName = document.getElementById("formName").value;
    var formPath = document.getElementById("formPath").value;
    var userCreated = document.getElementById("userCreated").value;
    var userModified = document.getElementById("userModified").value;
    var type = document.getElementById("type").value;

    var formContainer = document.getElementById("formContainer");
    var jsonData = domToJson(formContainer);
    console.log(jsonData);

    if (type == "form") {
      const formData = {
        formId: formId,
        formName: formName,
        formPath: formPath,
        userCreated: userCreated,
        userModified: userModified,
        modificationDate: new Date(),
        creationDate: new Date(),
        formData: jsonData, // Assuming formDataJson is a valid JSON string
      };

      // Check if form exists
      fetch(`/get-form/${formId}`)
        .then((response) => {
          console.log("response");
          console.log(response);
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Form does not exist");
          }
        })
        .then((existingForm) => {
          console.log("existingForm");
          console.log(existingForm);
          // If form exists, update it
          return fetch(`/update-form/${formId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
        })
        .catch((error) => {
          console.log("error");
          console.log(error);
          // If form does not exist, store it
          return fetch("/store-json", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
        })
        .then((response) => response.json())
        .then((data) => {
          showToast("Success!", 5000); // Show toast for 5 seconds
          console.log("Success:", data);
        })
        .catch((error) => {
          showToast("Error! " + error, 5000); // Show toast for 5 seconds
          console.error("Error:", error);
        });
    }
  });

function showToast(message, duration = 5000,type = 'info') {
   console.log("showToast");
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    // Create the toast container if it doesn't exist
    const container = document.createElement("div");
    container.id = "toast-container";
    container.style.position = "fixed";
    container.style.zIndex = 1000;
    container.style.pointerEvents = "none";    
    container.style.display = "flex";
    container.style.flexDirection = "column";
    document.body.appendChild(container);

    toastContainer = container;
  }
  toastContainer.style.display = "flex";
  toastContainer.style.flexDirection = "column";
  const toast = document.createElement("div");

  toast.innerHTML = `
  <span>${message}</span>
  <button class="toast-close">&times;</button>`;


  toast.classList.add("toast-message", `toast-${type}`);

  // Add the toast to the container
  toastContainer.appendChild(toast); 


  // Add styling and interactivity
  toast.querySelector(".toast-close").onclick = () => {
    toast.style.opacity = 0;
    toast.addEventListener("transitionend", () => toast.remove());
  };

  toastContainer.appendChild(toast);

  // Fade in
  setTimeout(() => toast.style.opacity = 1, 50);

  // Auto-dismiss
  setTimeout(() => {
    toast.style.opacity = 0;
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}

// show hint like a toastmessage wiht absolute position, based on the mouse position
function showHint(message, duration = 1000, event) {
  const hintContainer = document.getElementById("hint-container");
  hintContainer.style.top = 10 + event.clientY + "px";
  hintContainer.style.left = 10 + event.clientX + "px";
  const hint = document.createElement("div");
  hint.classList.add("hint-message");
  hint.innerHTML = message;

  hintContainer.innerHTML = "";

  // Add the toast to the container
  hintContainer.appendChild(hint);

  // Make the toast visible
  setTimeout(() => {
    hint.style.opacity = 1;
  }, 100);

  // Hide and remove the toast after 'duration'
  setTimeout(() => {
    hint.style.opacity = 0;
    hint.addEventListener("transitionend", () => hint.remove());
  }, duration);
}

loadForms();
