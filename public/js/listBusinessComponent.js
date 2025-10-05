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
    const response = await apiFetch("/list-business-component");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

// function deleteForm(objectId, listItem) {
//   apiFetch(`/delete-form/${objectId}`, { method: "DELETE" })
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
//   objectId,
//   renderContainer = document.getElementById("renderForm")
// ) {
//   apiFetch(`/get-form/${objectId}`)
//     .then((response) => {
//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }
//       return response.json();
//     })
//     .then((form) => {
//       // set the header
//       var objectId = document.getElementById("objectId");
//       var objectName = document.getElementById("objectName");
//       var objectSlug = document.getElementById("objectSlug");
//       var userCreated = document.getElementById("userCreated");
//       var userModified = document.getElementById("userModified");
//       // Handle the form data here
//       console.log("Form Data:", form);
//       // For example, display the form data in an alert or populate a form for editing
//       objectId.value = form.objectId;
//       console.log(objectId);
//       objectName.value = form.objectName;
//       objectSlug.value = form.objectSlug;
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
