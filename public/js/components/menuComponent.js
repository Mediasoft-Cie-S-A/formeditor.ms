const menuItems = [];
menuItems.push({
    item: "Tableau de bord", 
    url: "#", 
    icon: "fa fa-home", 
    target: "new",  
    checkpoint: "0",
    children: [
        { item: "Apercu", url: "#", icon: "fa fa-eye", target: "_self", checkpoint: "0" },
        { item: "Analyse", url: "#", icon: "fa fa-chart-line", target: "_self", checkpoint: "0" }

    ]
});
menuItems.push({
    item: "Comptabilité",
    url: "#",
    icon: "fa fa-calculator",
    target: "new",
    checkpoint: "0",
    children: [
        { item: "Clients", url: "#", icon: "fa fa-users", target: "_self", checkpoint: "0" },
        { item: "Fournisseurs", url: "#", icon: "fa fa-truck", target: "_self", checkpoint: "0" },
        { item: "Produits", url: "#", icon: "fa fa-box", target: "_self", checkpoint: "0" },
        { item: "Stocks", url: "#", icon: "fa fa-cubes", target: "_self", checkpoint: "0" },
        { item: "Commandes", url: "#", icon: "fa fa-shopping-cart", target: "_self", checkpoint: "0" },              
        { item: "Factures", url: "#", icon: "fa fa-file-invoice", target: "_self", checkpoint: "0" },
        { item: "Paiements", url: "#", icon: "fa fa-money-bill-wave", target: "_self", checkpoint: "0" },
        { item: "Banques", url: "#", icon: "fa fa-university", target: "_self", checkpoint: "0" },

    ]
});
menuItems.push({
    item: "Reports", 
    url: "#", 
    icon: "fa fa-file", 
    target: "new", 
    checkpoint: "0",
    children: [
        { item: "Daily Report", url: "#", icon: "fa fa-calendar", target: "_self", checkpoint: "0" },
        { item: "Monthly Report", url: "#", icon: "fa fa-calendar-alt", target: "_self", checkpoint: "0" }
    ]
});

function createMenuComponent(type) {
    const mainDiv = document.createElement('div');
    mainDiv.setAttribute("tagName", type);
    mainDiv.className = "form-element";
    mainDiv.id = `menuComponent-${Date.now()}`;
    const internalDiv = document.createElement('div');  
    const menu = document.createElement('ul');
    menu.className = 'menu-component';
    internalDiv.appendChild(menu);
    mainDiv.appendChild(internalDiv);
    mainDiv.setAttribute("items", JSON.stringify(menuItems));
    rendenderMenuComponent(type, mainDiv);
    return mainDiv;
}

function editMenuComponent(type, element, content) {
    const items = JSON.parse(element.getAttribute("items"));
    const div = document.createElement("div");
    div.style.width = "150px";
    div.style.padding = "10px";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Update";
    saveButton.onclick = () => saveMenuItems(element);
    saveButton.style.width = "100%";
    div.appendChild(saveButton);

    const itemdiv = document.createElement("div");
    itemdiv.id = "menu-items";
    itemdiv.draggable = true;
    div.appendChild(itemdiv);

    const addButton = document.createElement("button");
    addButton.textContent = "Add Item";
    addButton.onclick = () => addmenuItems(element, itemdiv, {});
    addButton.style.width = "100%";
    div.appendChild(addButton);
    content.appendChild(div);

    items.forEach(item => {
        addmenuItems(element, itemdiv, item);
    });
}

function addmenuItems(element, itemdiv, itemObj) {
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
        addmenuItems(element, subMenuDiv, { item: "", url: "", icon: "", target: "", checkpoint: "0" });
        internalDiv.appendChild(subMenuDiv);
    };
    internalDiv.appendChild(subMenuButton);

    itemdiv.appendChild(internalDiv);

    if (itemObj.children) {
        const subMenuDiv = document.createElement('div');
        subMenuDiv.style.marginLeft = "20px";
        itemObj.children.forEach(subItem => {
            addmenuItems(element, subMenuDiv, subItem);
        });
        internalDiv.appendChild(subMenuDiv);
    }
}

function saveMenuItems(element) {
    const parseMenuItems = (container) => {
        const items = [];
        const children = container.children;
        for (let i = 0; i < children.length; i++) {
            const item = children[i].querySelector("input:nth-child(1)").value;
            const url = children[i].querySelector("input:nth-child(2)").value;

            const subMenuDiv = children[i].querySelector("div");
            const childrenItems = subMenuDiv ? parseMenuItems(subMenuDiv) : [];
            items.push({ item, url, children: childrenItems });
        }
        return items;
    };
    const itemdiv = document.getElementById("menu-items");
    const items = parseMenuItems(itemdiv);
    element.setAttribute("items", JSON.stringify(items));
    rendenderMenuComponent(element.getAttribute("tagName"), element);
}

function rendenderMenuComponent(type, content) {
    const items = JSON.parse(content.getAttribute("items"));
    const menu = content.querySelector('ul');
    menu.innerHTML = "";

    const createMenuItem = (item) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const i = document.createElement('i');

        a.href = item.url;
        a.textContent = item.item;
        a.target = item.target;
        i.className = item.icon;
        li.appendChild(i);
        if (item.children!=null) 
        {
            li.appendChild(a);
        }
        li.appendChild(document.createTextNode(" " + item.item));
        
        // Create sub-menu if there are children
        if (item.children && item.children.length > 0) {
          
            const subMenu = document.createElement('ul');
            subMenu.className = "sub-menu";
            subMenu.style.display = "none"; // Initially hidden

            item.children.forEach(subItem => {
                subMenu.appendChild(createMenuItem(subItem));
            });
           
            
            
            li.appendChild(subMenu);

            li.setAttribute('onclick', `toggleSubMenu(event, this)`);
           
        }
        else
        {
            
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

function toggleSubMenu(event, element) {
    const subMenu = element.querySelector('.sub-menu');
    subMenu.style.display = subMenu.style.display === 'none' ? 'block' : 'none';
}