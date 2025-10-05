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
 * Data storage
 * - endpoint: plain string pointing to the authentication endpoint.
 * - encrypt: boolean persisted as "true"/"false" enabling payload encryption.
 * - google-endpoint / microsoft-endpoint: plain strings for OAuth provider URLs.
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

    const encryptCheckbox = document.createElement("input");
    encryptCheckbox.type = "checkbox";
    encryptCheckbox.tagName = "encrypt";
    encryptCheckbox.checked = element.getAttribute("encrypt") === "true";
    encryptCheckbox.style.marginLeft = "10px";

    const encryptLabel = document.createElement("label");
    encryptLabel.textContent = "Encrypt password";
    encryptLabel.style.fontWeight = "bold";
    encryptLabel.style.fontSize = "16px";
    encryptLabel.style.marginLeft = "10px";
    encryptLabel.appendChild(encryptCheckbox);

    const googleInput = document.createElement("input");
    googleInput.type = "text";
    googleInput.tagName = "google-endpoint";
    googleInput.value = element.getAttribute("google-endpoint") || "";
    googleInput.style.marginRight = "10px";
    googleInput.style.width = "200px";

    const googleLabel = document.createElement("label");
    googleLabel.textContent = "Google Endpoint";
    googleLabel.style.fontWeight = "bold";
    googleLabel.style.fontSize = "16px";
    googleLabel.appendChild(googleInput);

    const microsoftInput = document.createElement("input");
    microsoftInput.type = "text";
    microsoftInput.tagName = "microsoft-endpoint";
    microsoftInput.value = element.getAttribute("microsoft-endpoint") || "";
    microsoftInput.style.marginRight = "10px";
    microsoftInput.style.width = "200px";

    const microsoftLabel = document.createElement("label");
    microsoftLabel.textContent = "Microsoft Endpoint";
    microsoftLabel.style.fontWeight = "bold";
    microsoftLabel.style.fontSize = "16px";
    microsoftLabel.appendChild(microsoftInput);

    propertiesBar.appendChild(endpointLabel);
    propertiesBar.appendChild(encryptLabel);
    propertiesBar.appendChild(googleLabel);
    propertiesBar.appendChild(microsoftLabel);

    endpointInput.onchange = function () {
        element.setAttribute("endpoint", endpointInput.value);
        renderLoginComponent(element);
    };
    encryptCheckbox.onchange = function () {
        element.setAttribute("encrypt", encryptCheckbox.checked ? "true" : "false");
        renderLoginComponent(element);
    };
    googleInput.onchange = function () {
        element.setAttribute("google-endpoint", googleInput.value);
        renderLoginComponent(element);
    };
    microsoftInput.onchange = function () {
        element.setAttribute("microsoft-endpoint", microsoftInput.value);
        renderLoginComponent(element);
    };
}

/**
 * Renders the login form inside the component and posts credentials to the
 * configured endpoint.
 */
function renderLoginComponent(element) {
    const endpoint = element.getAttribute("endpoint") || "/login";
    const encrypt = element.getAttribute("encrypt") === "true";
    const googleEndpoint = element.getAttribute("google-endpoint");
    const microsoftEndpoint = element.getAttribute("microsoft-endpoint");

    element.innerHTML = "";

    const form = document.createElement("form");
    form.className = "login-form";
    form.onsubmit = async function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        try {
            if (encrypt) {
                const password = formData.get("password");
                const msgUint8 = new TextEncoder().encode(password);
                const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
                formData.set("password", hashHex);
            }
            await apiFetch(endpoint, { method: "POST", body: formData });
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

    if (googleEndpoint) {
        const googleButton = document.createElement("button");
        googleButton.type = "button";
        googleButton.className = "login-btn google";
        googleButton.textContent = "Login with Google";
        googleButton.onclick = () => { window.location.href = googleEndpoint; };
        element.appendChild(googleButton);
    }
    if (microsoftEndpoint) {
        const msButton = document.createElement("button");
        msButton.type = "button";
        msButton.className = "login-btn microsoft";
        msButton.textContent = "Login with Microsoft";
        msButton.onclick = () => { window.location.href = microsoftEndpoint; };
        element.appendChild(msButton);
    }
}

