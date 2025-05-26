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

    if (type == "business_component") {
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
      fetch(`/store-business-json/${formId}`)
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
          return fetch(`/update-business-component/${formId}`, {
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
          return fetch("/store-business-json", {
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



loadForms();
