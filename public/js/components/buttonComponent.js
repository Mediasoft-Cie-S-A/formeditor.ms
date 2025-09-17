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
 * - config: JSON object persisted on each button describing label, url, target and UI state.
 * - items: JSON array of menu item definitions (label, url, target, children).
 * - data-fullstate: JSON object capturing the full menu builder state for reconstruction.
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

        saveGlobalState(); // 👈 Important !

    };

    container.appendChild(labelGroup);
    container.appendChild(urlGroup);
    container.appendChild(targetGroup);
    container.appendChild(updateBtn);

    content.innerHTML = "";
    content.appendChild(container);
}

function saveMenuItemsHorizontal(element) {
    const parseMenuItems = (container) => {
        const items = [];
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            const inputs = children[i].querySelectorAll("input");
            if (inputs.length < 5) continue;

            const item = inputs[0].value;
            const url = inputs[1].value;
            const icon = inputs[2].value;
            const target = inputs[3].value;
            const checkpoint = inputs[4].value;

            const subMenuDivs = children[i].querySelectorAll(":scope > div");
            let childrenItems = [];
            subMenuDivs.forEach(subDiv => {
                childrenItems = childrenItems.concat(parseMenuItems(subDiv));
            });

            items.push({
                item: item,
                url: url,
                icon: icon,
                target: target,
                checkpoint: checkpoint,
                children: childrenItems.length > 0 ? childrenItems : null
            });
        }
        return items;
    };

    const itemdiv = document.getElementById("menu-items");
    const items = parseMenuItems(itemdiv);

    // Mise à jour des items dans menuComponentHorizontal
    element.setAttribute("items", JSON.stringify(items));

    // Recherche du menuGlobale pour stocker l'état complet
    const menuGlobale = document.getElementById("menuGlobale");
    if (menuGlobale) {
        const rightSide = document.getElementById("rightSideMenu");
        const rightSideData = [];

        if (rightSide) {
            const tagged = rightSide.querySelectorAll("[tagName]");
            tagged.forEach(el => {
                rightSideData.push({
                    tagName: el.getAttribute("tagName"),
                    config: JSON.parse(el.getAttribute("config") || "{}")
                });
            });
        }

        const state = {
            menuItems: items,
            rightSide: rightSideData
        };

        menuGlobale.setAttribute("data-fullstate", JSON.stringify(state));
    }

    renderMenuComponentHorizontal(element);
    saveGlobalState(); // 👈 AJOUT ICI

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
    const btn = e.target.closest('button[tagName="button"], button[tagName="elementButton"]');
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
    console.log("targetDiv: ", targetDiv);
    loadFormData(config.url, targetDiv);
});

function saveGlobalState() {
    const menuComponent = document.querySelector('.menu-horizontal-wrapper');
    const rightSide = document.getElementById("rightSideMenu");
    const menuGlobale = document.getElementById("menuGlobale");
    if (!menuComponent || !rightSide || !menuGlobale) {
        console.warn("⛔ Structure HTML incomplète !");
        return;
    }

    // --- Récupérer menuItems ---
    const parseMenuItems = (container) => {
        const items = [];
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            const inputs = children[i].querySelectorAll("input");
            if (inputs.length < 5) continue;

            const item = inputs[0].value;
            const url = inputs[1].value;
            const icon = inputs[2].value;
            const target = inputs[3].value;
            const checkpoint = inputs[4].value;

            const subMenuDivs = children[i].querySelectorAll(":scope > div");
            let childrenItems = [];
            subMenuDivs.forEach(subDiv => {
                childrenItems = childrenItems.concat(parseMenuItems(subDiv));
            });

            items.push({
                item,
                url,
                icon,
                target,
                checkpoint,
                children: childrenItems.length > 0 ? childrenItems : null
            });
        }
        return items;
    };

    const itemDiv = document.getElementById("menu-items");
    const items = itemDiv ? parseMenuItems(itemDiv) : [];

    // --- Récupérer rightSide ---
    const rightSideData = [];
    const tagged = rightSide.querySelectorAll("[tagName]");
    tagged.forEach(el => {
        rightSideData.push({
            tagName: el.getAttribute("tagName"),
            config: JSON.parse(el.getAttribute("config") || "{}")
        });
    });

    const state = {
        menuItems: items,
        rightSide: rightSideData
    };

    menuGlobale.setAttribute("data-fullstate", JSON.stringify(state));
    console.log("💾 État global sauvegardé :", state);
}


function loadGlobalState() {
    const menuGlobale = document.getElementById("menuGlobale");
    const saved = menuGlobale?.getAttribute("data-fullstate");
    if (!saved) {
        console.warn("🔍 Aucun état sauvegardé trouvé dans #menuGlobale.");
        return;
    }

    const state = JSON.parse(saved);
    console.log("🔁 Chargement de l’état sauvegardé :", state);

    // --- Recharger le menu horizontal ---
    const menuComponent = document.querySelector(".menu-horizontal-wrapper");
    if (menuComponent && state.menuItems) {
        menuComponent.setAttribute("items", JSON.stringify(state.menuItems));
        renderMenuComponentHorizontal(menuComponent);
    }

    // --- Recharger les composants du panneau droit ---
    const rightSide = document.getElementById("rightSideMenu");
    if (rightSide && Array.isArray(state.rightSide)) {
        rightSide.innerHTML = ""; // vide l'existant avant restauration
        state.rightSide.forEach(component => {
            if (!component.tagName || !component.config) return;

            if (component.tagName === "elementButton") {
                const btn = createElementButton(component.config.label || "Button");
                btn.setAttribute("config", JSON.stringify(component.config));
                renderElementButton(btn);
                rightSide.appendChild(btn);
            }

            // Tu peux ajouter d'autres composants ici s'il y en a d'autres à gérer
        });
    }


}
window.addEventListener("DOMContentLoaded", () => {
    loadGlobalState();
});
