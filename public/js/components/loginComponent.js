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

/**
 * Creates a login component container.
 */
function createElementLogin(type) {
    const main = document.createElement("div");
    main.className = "login-container";
    main.id = type + Date.now();
    main.draggable = true;
    main.tagName = type;
    return main;
}

/**
 * Adds editable properties for the login component.
 * Allows the user to change the endpoint used for authentication.
 */
function editElementLogin(type, element, content) {
    const propertiesBar = document.getElementById("propertiesBar");

    const endpointInput = document.createElement("input");
    endpointInput.type = "text";
    endpointInput.tagName = "endpoint";
    endpointInput.value = element.getAttribute("endpoint") || "/login";
    endpointInput.style.marginRight = "10px";
    endpointInput.style.width = "200px";

    const endpointLabel = document.createElement("label");
    endpointLabel.textContent = "Endpoint";
    endpointLabel.style.fontWeight = "bold";
    endpointLabel.style.fontSize = "16px";
    endpointLabel.appendChild(endpointInput);

    propertiesBar.appendChild(endpointLabel);

    endpointInput.onchange = function () {
        element.setAttribute("endpoint", endpointInput.value);
        renderLoginComponent(element);
    };
}

/**
 * Renders the login form inside the component and posts credentials to the
 * configured endpoint.
 */
function renderLoginComponent(element) {
    const endpoint = element.getAttribute("endpoint") || "/login";
    element.innerHTML = "";

    const form = document.createElement("form");
    form.className = "login-form";
    form.onsubmit = async function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        try {
            await fetch(endpoint, { method: "POST", body: formData });
        } catch (err) {
            console.error("Login failed", err);
        }
    };

    const userField = document.createElement("div");
    userField.className = "login-field";
    const userLabel = document.createElement("label");
    userLabel.textContent = "Username";
    const userInput = document.createElement("input");
    userInput.type = "text";
    userInput.name = "username";
    userField.appendChild(userLabel);
    userField.appendChild(userInput);

    const passField = document.createElement("div");
    passField.className = "login-field";
    const passLabel = document.createElement("label");
    passLabel.textContent = "Password";
    const passInput = document.createElement("input");
    passInput.type = "password";
    passInput.name = "password";
    passField.appendChild(passLabel);
    passField.appendChild(passInput);

    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.className = "login-btn";
    submitButton.textContent = "Login";

    form.appendChild(userField);
    form.appendChild(passField);
    form.appendChild(submitButton);
    element.appendChild(form);
}

