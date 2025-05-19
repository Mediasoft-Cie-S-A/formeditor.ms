/*
 * Horizontal Menu Component
 * Corrected to match CSS class names
 */

function createMenuComponentHorizontal(type) {
    const mainDiv = document.createElement('div');
    mainDiv.setAttribute("tagName", type);
    mainDiv.className = "form-element menu-horizontal-wrapper";
    mainDiv.id = `menuComponentHorizontal-${Date.now()}`;

    const internalDiv = document.createElement('div');
    const menu = document.createElement('ul');
    menu.className = 'horizontal-menu';

    internalDiv.appendChild(menu);
    mainDiv.appendChild(internalDiv);
    mainDiv.setAttribute("items", JSON.stringify(menuItems));

    renderMenuComponentHorizontal(mainDiv);

    return mainDiv;
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

function saveMenuItemsHorizontal(element) {
    const parseMenuItems = (container) => {
        const items = [];
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            const inputs = children[i].querySelectorAll("input");
            if (inputs.length < 5) continue; // S'assurer qu'il y a suffisamment d'inputs

            const item = inputs[0].value;
            const url = inputs[1].value;
            const icon = inputs[2].value;
            const target = inputs[3].value;
            const checkpoint = inputs[4].value;

            // Rechercher tous les divs enfants pour capturer les sous-menus
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
    element.setAttribute("items", JSON.stringify(items));
    renderMenuComponentHorizontal(element);
}


function renderMenuComponentHorizontal(content) {
    const items = JSON.parse(content.getAttribute("items"));

    // Clear the container
    content.innerHTML = "";

    // Create a wrapper to align menu and translate side by side
    const wrapper = document.createElement("div");
    wrapper.className = "menu-bar-wrapper"; // Flex container

    const menu = document.createElement('ul');
    menu.className = 'horizontal-menu';

    // --- Translate button + selector ---
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

    // --- Menu items rendering ---
    const createMenuItem = (item) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const i = document.createElement('i');

        i.className = item.icon;
        a.textContent = item.item;

        li.appendChild(i);
        li.appendChild(a);
        // Add submenu indicator only if item has children
        if (item.children && item.children.length > 0) {
            const arrow = document.createElement("span");
            arrow.textContent = " ▼"; // you can use ▾ or ▶ if preferred
            arrow.style.fontSize = "0.75em";
            arrow.style.marginLeft = "4px";
            a.appendChild(arrow);
        }
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
            li.onclick = () => {
                console.log("Open modal with title:", item.item);
                openModalWithContent(item.url, item.target,item.item);
            };
        }

        return li;
    };

    items.forEach(item => {
        menu.appendChild(createMenuItem(item));
    });

    wrapper.appendChild(menu);
    wrapper.appendChild(translateWrapper);
    content.appendChild(wrapper);
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

function openModalWithContent(url, targetId, title = '') {
    // Crée ou récupère le modal container principal
    let modalContainer = document.getElementById("custom-modal-container");
    if (!modalContainer) {
        modalContainer = document.createElement("div");
        modalContainer.id = "custom-modal-container";
        modalContainer.style.position = "fixed";
        modalContainer.style.top = "0";
        modalContainer.style.left = "0";
        modalContainer.style.width = "100vw";
        modalContainer.style.height = "100vh";
        modalContainer.style.backgroundColor = "rgba(0,0,0,0.6)";
        modalContainer.style.display = "flex";
        modalContainer.style.justifyContent = "center";
        modalContainer.style.alignItems = "center";
        modalContainer.style.zIndex = "1000";

        // Modal principal (blanc)
        const modal = document.createElement("div");
        modal.id = "custom-modal";
        modal.style.backgroundColor = "#fff";
        modal.style.padding = "20px";
        modal.style.borderRadius = "8px";
        modal.style.width = "80%";
        modal.style.height = "80%";
        modal.style.overflow = "auto";
        modal.style.display = "flex";
        modal.style.flexDirection = "column";
        modal.style.position = "relative";

        // Div titre séparée
        const titleDiv = document.createElement("div");
        titleDiv.id = "modal-title-container";
        titleDiv.style.marginBottom = "20px";
        titleDiv.style.textAlign = "center";
        titleDiv.style.fontSize = "1.5em";
        titleDiv.style.fontWeight = "bold";
        modal.appendChild(titleDiv);

        // Contenu principal dans une div à part
        const content = document.createElement("div");
        content.id = "modal-content";
        content.style.flex = "1";   // pour prendre tout l'espace restant
        content.style.overflow = "auto";
        modal.appendChild(content);

        // Bouton fermeture
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "X";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "10px";
        closeBtn.style.right = "10px";
        closeBtn.onclick = () => modalContainer.remove();
        modal.appendChild(closeBtn);

        modalContainer.appendChild(modal);
        document.body.appendChild(modalContainer);
    }

    // Charger le contenu dans le modal
    const contentElement = modalContainer.querySelector("#modal-content");
    if (contentElement) {
        loadFormData(url, contentElement);  // ta fonction actuelle pour charger le contenu
    }

    // Mettre à jour le titre dans la div titre
    const titleDiv = modalContainer.querySelector("#modal-title-container");
    if (titleDiv) {
        titleDiv.textContent = title;
    }

    modalContainer.style.display = "flex";
}
