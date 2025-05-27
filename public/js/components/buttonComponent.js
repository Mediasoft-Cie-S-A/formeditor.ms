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
    const element = document.createElement("button");
    element.textContent = type;
    element.id = `elementButton-${Date.now()}`;
    element.setAttribute("tagName", "elementButton");
    element.className = 'button';

    element.style.margin = "8px";
    element.style.padding = "10px 15px";

    const config = {
        label: type,
        url: "",
        target: ""
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

    element.onclick = null;
    element.ondblclick = null;

    element.onclick = () => {
        console.log("🖱️ Bouton cliqué :", element.id);
    
        const freshConfig = JSON.parse(element.getAttribute("config") || "{}");
        console.log("📦 Config actuelle :", freshConfig);
    
        if (freshConfig.url && freshConfig.target) {
            const targetDiv = document.getElementById(freshConfig.target);
            if (targetDiv) {
                console.log(`🔁 Chargement de l’écran '${freshConfig.url}' dans '${freshConfig.target}'`);
                loadFormData(freshConfig.url, targetDiv);
            } else {
                console.warn(`❌ Div cible '${freshConfig.target}' introuvable`);
            }
        } else {
            console.warn("⚠️ Clic ignoré : URL ou Target manquant.");
        }
    };
    
}



document.addEventListener("click", (e) => {
    const btn = e.target.closest('button[tagName="button"]');
    if (!btn) return;

    const config = JSON.parse(btn.getAttribute("config") || "{}");
    if (!config.url || !config.target) {
        console.warn("⚠️ Bouton ignoré (URL ou Target manquant)");
        return;
    }

    const targetDiv = document.getElementById(config.target);
    if (!targetDiv) {
        console.warn(`❌ Div cible '${config.target}' introuvable`);
        return;
    }

    console.log(`🔁 Chargement de l’écran '${config.url}' dans '${config.target}'`);
    loadFormData(config.url, targetDiv);
});
