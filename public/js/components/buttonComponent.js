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

/*This function createElementButton creates a new HTML element of a given type,
sets its text content to the type, adds two event listeners to it, and returns the created element. 
The double-click event listener calls the editElement function with the element and its type as arguments,
 and the click event listener calls the selectElement function with the element as an argument.
*/
function createElementButton(type) {
    const element = document.createElement("button"); // toujours un bouton HTML valide
    element.textContent = type;
    element.id = type + Date.now();
    element.setAttribute("tagName", type); // stocke le type comme "métadonnée"
    element.className = 'button';

    const config = {
        label: type,
        url: "",     // <-- ID de l'écran à afficher
        target: ""   // <-- ID de la div dans laquelle on va afficher
    };
    
    element.setAttribute("config", JSON.stringify(config));
    renderElementButton(element);

    return element;
}


function editElementButton(type, element, content) {
    const config = JSON.parse(element.getAttribute("config") || "{}");

    const container = document.createElement("div");
    container.className = "button-editor";

    // Label
    const labelGroup = document.createElement("div");
    labelGroup.style.marginBottom = "8px";
    const label = document.createElement("label");
    label.textContent = "Texte du bouton :";
    const input = document.createElement("input");
    input.type = "text";
    input.value = config.label || "";
    input.style.marginLeft = "10px";
    labelGroup.appendChild(label);
    labelGroup.appendChild(input);

    // URL (ID de l'écran)
    const urlGroup = document.createElement("div");
    urlGroup.style.marginBottom = "8px";
    const urlLabel = document.createElement("label");
    urlLabel.textContent = "ID de l’écran à charger (URL) :";
    const urlInput = document.createElement("input");
    urlInput.type = "text";
    urlInput.value = config.url || "";
    urlInput.style.marginLeft = "10px";
    urlGroup.appendChild(urlLabel);
    urlGroup.appendChild(urlInput);

    // Target (div cible)
    const targetGroup = document.createElement("div");
    targetGroup.style.marginBottom = "8px";
    const targetLabel = document.createElement("label");
    targetLabel.textContent = "ID de la div cible (Target) :";
    const targetInput = document.createElement("input");
    targetInput.type = "text";
    targetInput.value = config.target || "";
    targetInput.style.marginLeft = "10px";
    targetGroup.appendChild(targetLabel);
    targetGroup.appendChild(targetInput);

    // Bouton Update
    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Update";
    updateBtn.onclick = () => {
        config.label = input.value.trim();
        config.url = urlInput.value.trim();
        config.target = targetInput.value.trim();
        console.log("💾 Nouvelle config sauvegardée :", config);

        element.setAttribute("config", JSON.stringify(config));
        renderElementButton(element);
    };

    container.appendChild(labelGroup);
    container.appendChild(urlGroup);
    container.appendChild(targetGroup);
    container.appendChild(updateBtn);

    content.innerHTML = "";
    content.appendChild(container);
}


function renderElementButton(element) {
    console.log("🔧 Appel de renderElementButton");
    const config = JSON.parse(element.getAttribute("config") || "{}");
    element.textContent = config.label || "Button";
    element.style.color = config.color || "#000";
    element.style.backgroundColor = config.background || "#fff";

    element.onclick = () => {
        if (config.url && config.target) {
            const targetDiv = document.getElementById(config.target);
            if (targetDiv) {
                console.log(`🔁 Chargement de l’écran '${config.url}' dans '${config.target}'`);
                loadFormData(config.url, targetDiv);
            } else {
                console.warn(`❌ Div cible '${config.target}' introuvable`);
            }
        }
    };
}
