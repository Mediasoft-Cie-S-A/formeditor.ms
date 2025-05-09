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
    const items = JSON.parse(element.getAttribute("items"));
    const div = document.createElement("div");
    div.style.width = "150px";
    div.style.padding = "10px";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Update";
    saveButton.onclick = () => saveMenuItemsHorizontal(element);
    saveButton.style.width = "100%";
    div.appendChild(saveButton);

    const itemdiv = document.createElement("div");
    itemdiv.id = "menu-items";
    itemdiv.draggable = true;
    div.appendChild(itemdiv);

    const addButton = document.createElement("button");
    addButton.textContent = "Add Item";
    addButton.onclick = () => addMenuItemsHorizontal(element, itemdiv, {});
    addButton.style.width = "100%";
    div.appendChild(addButton);

    content.appendChild(div);

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

    itemdiv.appendChild(internalDiv);

    if (itemObj.children) {
        const subMenuDiv = document.createElement('div');
        subMenuDiv.style.marginLeft = "20px";
        itemObj.children.forEach(subItem => {
            addMenuItemsHorizontal(element, subMenuDiv, subItem);
        });
        internalDiv.appendChild(subMenuDiv);
    }
}

function saveMenuItemsHorizontal(element) {
    const parseMenuItems = (container) => {
        const items = [];
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            const item = children[i].querySelector("input:nth-child(1)").value;
            const url = children[i].querySelector("input:nth-child(2)").value;
            const icon = children[i].querySelector("input:nth-child(3)").value;
            const target = children[i].querySelector("input:nth-child(4)").value;
            const checkpoint = children[i].querySelector("input:nth-child(5)").value;

            const subMenuDiv = children[i].querySelector("div");
            const childrenItems = subMenuDiv ? parseMenuItems(subMenuDiv) : [];
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
    const menu = content.querySelector('ul');
    menu.innerHTML = "";

    const createMenuItem = (item) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const i = document.createElement('i');

        i.className = item.icon;
        a.textContent = item.item;

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
            if (item.url.startsWith("http") || item.url.startsWith("/")) {
                li.setAttribute('onclick', `window.location.href='${item.url}'; window.target='${item.target}'`);
            } else {
                li.setAttribute('onclick', `loadFormData('${item.url}',document.getElementById('${item.target}'))`);
            }
        }

        return li;
    };

    items.forEach(item => {
        menu.appendChild(createMenuItem(item));
    });
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
