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
 * - items: JSON array describing horizontal menu entries with nested children.
 * - tagName: plain string retained for serialization of the component type.
 */
function createMenuComponentHorizontal(type) {
    const wrapper = document.createElement('div');
    wrapper.id = 'menuGlobale';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'space-between';
    wrapper.style.alignItems = 'flex-start';
    wrapper.style.gap = '20px';
    wrapper.style.padding = '10px 20px';
    wrapper.style.backgroundColor = '#fafafa';
    wrapper.style.borderBottom = '1px solid #ccc';

    const menuZone = document.createElement('div');
    menuZone.id = 'menuZone';
    menuZone.style.flex = '1';

    const menuComponent = document.createElement('div');
    menuComponent.setAttribute("tagName", type);
    menuComponent.className = "form-element menu-horizontal-wrapper";
    menuComponent.id = `menuComponentHorizontal-${Date.now()}`;
    menuComponent.setAttribute("items", JSON.stringify(menuItems));

    menuZone.appendChild(menuComponent);

    const rightSideMenu = document.createElement('div');
    rightSideMenu.id = 'rightSideMenu';
    rightSideMenu.style.minWidth = '80px';

    wrapper.appendChild(menuZone);
    wrapper.appendChild(rightSideMenu);

    setTimeout(() => {
        const items = menuComponent.getAttribute("items");
        if (items) {
            renderMenuComponentHorizontal(menuComponent);
        } else {
            console.warn("⚠️ Tentative de render, mais 'items' est toujours null.");
        }
    }, 0);


    return wrapper;
}

function renderMenuComponentHorizontal(content) {
    const itemsAttr = content.getAttribute("items");
    console.log("🖁 Rendering menuComponent with items :", itemsAttr);

    if (!itemsAttr) {
        console.warn("⛔ Aucun attribut 'items' trouvé ou vide sur le composant menu. Annulation du rendu.");
        return;
    }

    let items;
    try {
        items = JSON.parse(itemsAttr);
        if (!Array.isArray(items)) throw new Error("items n'est pas un tableau");
    } catch (err) {
        console.error("❌ Erreur lors du parsing de 'items' :", err);
        return;
    }

    content.innerHTML = "";

    const menu = document.createElement('ul');
    menu.className = 'horizontal-menu';

    const createMenuItem = (item) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const i = document.createElement('i');

        i.className = item.icon;
        a.textContent = item.item;
        a.style.fontFamily = "'Segoe UI', 'Roboto', 'Open Sans', sans-serif";
        a.style.fontSize = "14px";
        a.style.fontWeight = "500";
        a.style.textDecoration = "none";
        a.style.color = "#333";
        a.style.padding = "8px 16px";
        a.style.display = "inline-block";

        li.appendChild(i);
        li.appendChild(a);

        if (item.children && item.children.length > 0) {
            const subMenu = document.createElement('ul');
            subMenu.className = "horizontal-submenu";
            subMenu.style.display = "none";

            item.children.forEach(subItem => {
                subMenu.appendChild(createMenuItem(subItem));
            });

            li.appendChild(subMenu);
            li.setAttribute('onmouseenter', 'toggleSubMenuOpen(event, this)');
            li.setAttribute('onmouseleave', 'toggleSubMenuClose(event, this)');
        } else {
            li.setAttribute('onclick', `loadFormData('${item.url}', document.getElementById('${item.target}'))`);
        }

        return li;
    };

    if (items.length > 1) {
        const lastItem = items.pop();
        items.unshift(lastItem);
    }

    items.forEach(item => {
        menu.appendChild(createMenuItem(item));
    });

    content.appendChild(menu);

    const rightSide = document.getElementById("rightSideMenu");
    if (rightSide) {
        rightSide.innerHTML = "";

        const savedState = localStorage.getItem("menuState");
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (state.rightSide) {
                    state.rightSide.forEach(component => {
                        const el = document.createElement(component.tag || "div");
                        if (component.id) el.id = component.id;
                        if (component.class) el.className = component.class;
                        if (component.text && !['input', 'textarea'].includes(component.tag)) {
                            el.textContent = component.text;
                        }
                        if (component.type) el.setAttribute("type", component.type);
                        if (component.value) el.value = component.value;
                        if (component.innerHTML && component.tag === "div") {
                            el.innerHTML = component.innerHTML;
                        }

                        el.draggable = !!component.draggable;
                        if (component.onclick) {
                            try {
                                el.onclick = () => {
                                    console.log("➡️ Bouton cliqué, exécution onclick :", component.onclick);
                                    eval(component.onclick);
                                };
                            } catch (e) {
                                console.error("❌ Erreur lors de l’exécution du onclick avec eval :", e);
                            }
                        }


                        rightSide.appendChild(el);
                        if (state.rightSide) {
                            console.log("📦 Nombre d’éléments posés dans le rightSide :", state.rightSide.length);
                        }

                    });
                }
            } catch (e) {
                console.error("❌ Erreur restauration rightSide :", e);
            }
        }

        const translateWrapper = document.createElement("div");
        translateWrapper.className = "translate-container";

        const floatButton = document.createElement('div');
        floatButton.textContent = '🌐';
        floatButton.title = 'Select Language';
        floatButton.onclick = () => {
            selector.style.display = selector.style.display === 'none' ? 'block' : 'none';
        };

        const selector = document.createElement('select');
        selector.style.display = 'none';
        selector.style.marginLeft = '8px';

        Object.keys(translationDictionary).forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang;
            selector.appendChild(option);
        });

        selector.onchange = (e) => translatePage('', e.target.value);

        translateWrapper.appendChild(floatButton);
        translateWrapper.appendChild(selector);

        rightSide.appendChild(document.createElement("hr"));
        rightSide.appendChild(translateWrapper);
    }

    console.log("✅ Menu horizontal rendu avec", items.length, "éléments.");
}

function toggleSubMenuOpen(event, element) {
    const subMenu = element.querySelector('.horizontal-submenu');
    if (subMenu) {
        subMenu.classList.add("show");
    }
}

function toggleSubMenuClose(event, element) {
    const subMenu = element.querySelector('.horizontal-submenu');
    if (subMenu) {
        subMenu.classList.remove("show");
    }
}
function editMenuComponentHorizontal(type, element, content) {
    // Parse the menu items from the element's "items" attribute
    const items = JSON.parse(element.getAttribute("items"));

    // Create a wrapper div for the editor panel
    const div = document.createElement("div");
    div.className = "menu-editor-container";
    div.style.width = "100%";                        // Take full width of parent
    div.style.boxSizing = "border-box";              // Include padding inside the width
    div.style.display = "flex";                      // Use flex layout
    div.style.flexDirection = "column";              // Stack children vertically
    div.style.gap = "10px";                          // Add spacing between children
    div.style.padding = "10px";                      // Add padding inside the editor

    // Create the "Update" button to save changes
    const saveButton = document.createElement("button");
    saveButton.textContent = "Update";
    saveButton.onclick = () => saveMenuItemsHorizontal(element); // Save logic
    saveButton.style.width = "100%";                 // Full-width button
    div.appendChild(saveButton);

    // Create the container that holds all menu items
    const itemdiv = document.createElement("div");
    itemdiv.id = "menu-items";
    itemdiv.draggable = true;
    itemdiv.style.width = "100%";                    // Make it take full width
    div.appendChild(itemdiv);

    // Create the "Add Item" button to insert a new menu item
    const addButton = document.createElement("button");
    addButton.textContent = "Add Item";
    addButton.onclick = () => addMenuItemsHorizontal(element, itemdiv, {}); // Add logic
    addButton.style.width = "100%";                  // Full-width button
    div.appendChild(addButton);

    // Add the editor to the provided content panel
    content.appendChild(div);

    // Render all existing menu items inside the editor panel
    items.forEach(item => {
        addMenuItemsHorizontal(element, itemdiv, item);
    });
}


function addMenuItemsHorizontal(element, itemdiv, itemObj) {
    console.log("🔍 Searching for #rightSideMenu...", document.getElementById("rightSideMenu"));

    const internalDiv = document.createElement('div');
    internalDiv.style.marginBottom = "5px";
    internalDiv.style.border = "1px solid #ccc";
    internalDiv.style.padding = "10px";

    const item = document.createElement("input");
    item.type = "text";
    item.placeholder = "Item Name";
    item.value = itemObj.item || "";
    internalDiv.appendChild(item);

    const url = document.createElement("input");
    url.type = "text";
    url.placeholder = "URL";
    url.value = itemObj.url || "";
    internalDiv.appendChild(url);

    const icon = document.createElement("input");
    icon.type = "text";
    icon.placeholder = "Icon";
    icon.value = itemObj.icon || "";
    internalDiv.appendChild(icon);

    const target = document.createElement("input");
    target.type = "text";
    target.placeholder = "Target";
    target.value = itemObj.target || "";
    internalDiv.appendChild(target);

    const checkpoint = document.createElement("input");
    checkpoint.type = "text";
    checkpoint.placeholder = "Checkpoint";
    checkpoint.value = itemObj.checkpoint || "";
    internalDiv.appendChild(checkpoint);

    const subMenuButton = document.createElement("button");
    subMenuButton.textContent = "Add Sub-menu";
    subMenuButton.onclick = () => {
        const subMenuDiv = document.createElement('div');
        subMenuDiv.style.marginLeft = "20px";
        addMenuItemsHorizontal(element, subMenuDiv, { item: "", url: "", icon: "", target: "", checkpoint: "0" });
        internalDiv.appendChild(subMenuDiv);
    };
    internalDiv.appendChild(subMenuButton);
    // ✅ Add Delete Button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.marginLeft = "10px";
    deleteButton.onclick = () => {
        itemdiv.removeChild(internalDiv); // Remove the current menu item from the editor
    };
    internalDiv.appendChild(deleteButton);

    itemdiv.appendChild(internalDiv);

    if (itemObj.children) {
        const subMenuDiv = document.createElement('div');
        subMenuDiv.style.marginLeft = "20px";
        itemObj.children.forEach(subItem => {
            addMenuItemsHorizontal(element, subMenuDiv, subItem);
        });
        internalDiv.appendChild(subMenuDiv);
    }
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => {
        if (confirm("Are you sure you want to delete this item?")) {
            internalDiv.remove();
        }
    };
    internalDiv.appendChild(deleteButton);
}


window.addEventListener("DOMContentLoaded", () => {
    console.log("📦 DOMContentLoaded triggered");

    const container = document.getElementById("menuGlobale");
    const savedState = localStorage.getItem("menuState");

    if (!container) {
        console.error("❌ Conteneur #menuGlobale non trouvé !");
        return;
    }

    if (savedState) {
        console.log("✅ État retrouvé :", savedState);
        const state = JSON.parse(savedState);
        window.menuItems = state.menuItems;

        const restoredMenu = createMenuComponentHorizontal("menuComponentHorizontal");

        container.innerHTML = '';
        container.appendChild(restoredMenu);
    } else {
        console.warn("⚠️ Aucun état sauvegardé");
    }
});
