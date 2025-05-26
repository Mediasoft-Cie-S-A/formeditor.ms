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
        a.style.fontFamily = "'Segoe UI', 'Roboto', 'Open Sans', sans-serif";
        // a.style.backgroundColor = "gray";
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
        const lastItem = items[items.length - 1];     // copie du dernier
        items.splice(items.length - 1, 1);            // supprime le dernier
        items.unshift(lastItem);                      // insère au début
    }
    
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
