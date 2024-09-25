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

async function loadBusinessComponent() {
  console.log("Loading Business component.......");
  try {
    const response = await fetch("/list-business-component");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

// function deleteForm(formId, listItem) {
//   fetch(`/delete-form/${formId}`, { method: "DELETE" })
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       return response.json();
//     })
//     .then((data) => {
//       console.log(data.message);
//       listItem.remove(); // Remove the list item from the DOM
//     })
//     .catch((error) => {
//       console.error("There was a problem with the delete operation:", error);
//     });
// }

// function loadFormData(
//   formId,
//   renderContainer = document.getElementById("renderForm")
// ) {
//   fetch(`/get-form/${formId}`)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       return response.json();
//     })
//     .then((form) => {
//       // set the header
//       var formId = document.getElementById("formId");
//       var formName = document.getElementById("formName");
//       var formPath = document.getElementById("formPath");
//       var userCreated = document.getElementById("userCreated");
//       var userModified = document.getElementById("userModified");
//       // Handle the form data here
//       console.log("Form Data:", form);
//       // For example, display the form data in an alert or populate a form for editing
//       formId.value = form.formId;
//       console.log(formId);
//       formName.value = form.formName;
//       formPath.value = form.formPath;
//       userCreated.value = form.userCreated;

//       renderContainer.innerHTML = "";

//       // Convert JSON back to DOM and append
//       var domContent = jsonToDom(form.formData, renderContainer);

//       console.log(domContent);
//     })
//     .catch((error) => {
//       showToast("Error!" + error, 5000); // Show toast for 5 seconds
//       console.error("There was a problem with the fetch operation:", error);
//     });
// }
