const menuItems = [];
menuItems.push({item: "Home", url: "http://www.google.com", icon: "fa fa-home", target : "new",  checkpoint: "0"});
menuItems.push({item: "Reports", url: "http://www.google.com", icon: "fa fa-file", target : "new",checkpoint: "0"});
menuItems.push({item: "Clients", url: "http://www.google.com", icon: "fa fa-users",target : "new", checkpoint: "0"});
menuItems.push({item: "Quotes", url: "http://www.google.com", icon: "fa fa-file-text", target : "new",checkpoint: "0"});
menuItems.push({item: "Invoices", url: "http://www.google.com", icon: "fa fa-file-text",target : "new", checkpoint: "0"});
menuItems.push({item: "Payments", url: "http://www.google.com", icon: "fa fa-money",target : "new", checkpoint: "0"});
menuItems.push({item: "Taxes", url: "http://www.google.com", icon: "fa fa-percent",target : "new", checkpoint: "0"});
menuItems.push({item: "Settings", url: "http://www.google.com", icon: "fa fa-cog", target : "new",checkpoint: "0"});
menuItems.push({item: "About", url: "http://www.google.com", icon: "fa fa-sign-out",target : "new", checkpoint: "0"});


function createMenuComponent(type) {
    // Logic to create the menu
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
    console.log(mainDiv);
    rendenderMenuComponent(type, mainDiv);
    return mainDiv;
}

function editMenuComponent(type, element, content) {
    // Logic to edit the menu, for example adding/removing items
    const items = JSON.parse(element.getAttribute("items"));
    // generate input
    // Clear the content area to prevent duplicates
    const div = document.createElement("div");
    div.style.width = "150px";
    div.style.height = "100%";
    div.style.border = "1px solid #ccc";
    div.style.borderRadius = "5px";
    div.style.padding = "10px";
    // Button to save all variables as cookies
    const saveButton = document.createElement("button");
    saveButton.textContent = "Update";
    saveButton.onclick = () => saveMenuItems(element);
    saveButton.style.width = "100%";
    div.appendChild(saveButton);
    // Create a container div for the variables
    const itemdiv = document.createElement("div");
    itemdiv.id = "menu-items";
    itemdiv.draggable = true;   
    div.appendChild(itemdiv);

    // Button to add new variables
    const addButton = document.createElement("button");
    addButton.textContent = "Add Item";
    addButton.onclick = () => addmenuItems(element, itemdiv,{});
    addButton.style.width = "100%";

    
    // Append the Add and Save buttons to the property bar
    div.appendChild(addButton);
    content.appendChild(div);

    
    // Add input fields for each variable
    items.forEach(item => {
        addmenuItems(element, itemdiv, item);
    });
}

function addmenuItems(element, itemdiv, itemObj) {
    const internalDiv = document.createElement('div');
    internalDiv.style.display = "block";
    internalDiv.style.justifyContent = "space-between";
    internalDiv.style.alignItems = "center";
    internalDiv.style.marginBottom = "5px";
    internalDiv.style.border = "1px solid #ccc";
    internalDiv.style.borderRadius = "5px";
    internalDiv.style.padding = "5px";
    
    const item = document.createElement("input");
    item.type = "text";
    item.style.width = "100%";
    item.style.marginBottom = "5px";
    item.placeholder = "Item Name";
    item.title = "Item Name";
    if (itemObj.item) {
        item.value = itemObj.item;
    }
    internalDiv.appendChild(item);

    const url = document.createElement("input");
    url.type = "text";
    url.style.width = "100%";
    url.style.marginBottom = "5px";
    url.placeholder = "URL";
    url.title = "URL";
    if (itemObj.url) {
        url.value = itemObj.url;
    }
    internalDiv.appendChild(url);

    const icon= document.createElement("input");
    icon.type = "text";
    icon.style.width = "100%";
    icon.style.marginBottom = "5px";
    icon.placeholder = "Icon";
    icon.title = "Icon";
    if (itemObj.icon) {
        icon.value = itemObj.icon;
    }

    internalDiv.appendChild(icon);

   

    const target = document.createElement("input");
    target.type = "text";
    target.style.width = "100%";
    target.style.marginBottom = "5px";
    target.placeholder = "Target";
    target.title = "Target";
    if (itemObj.target) {
        target.value = itemObj.target;
    }
    internalDiv.appendChild(target);

    const checkpoint = document.createElement("input");
    checkpoint.type = "text";
    checkpoint.style.width = "100%";
    checkpoint.style.marginBottom = "5px";
    checkpoint.placeholder = "Checkpoint";
    checkpoint.title = "Checkpoint";
    if (itemObj.checkpoint) {
        checkpoint.value = itemObj.checkpoint;
    }
    internalDiv.appendChild(checkpoint);
    
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.width = "100px";
    deleteButton.onclick = () => itemdiv.removeChild(internalDiv);
    internalDiv.appendChild(deleteButton);

    itemdiv.appendChild(internalDiv);
}

function saveMenuItems(element) {
    const items = [];
    const itemdiv = document.getElementById("menu-items");
    const children = itemdiv.children;
    for (let i = 0; i < children.length; i++) {
        const item = children[i].children[0].value;
        const url = children[i].children[1].value;
        const icon = children[i].children[2].value;
        const target = children[i].children[3].value;
        const checkpoint = children[i].children[4].value;
        items.push({item, url, icon, target, checkpoint});
    }
    element.setAttribute("items", JSON.stringify(items));
    rendenderMenuComponent(element.getAttribute("tagName"), element);
}

function rendenderMenuComponent(type, content) {
    // Logic to render the menu
    const items = JSON.parse(content.getAttribute("items"));
    const menu = content.querySelector('ul');
    menu.innerHTML = "";
    items.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        const i = document.createElement('i');
        a.href = item.url;
        a.textContent = item.item;
        a.target = item.target;
        i.className = item.icon;
        li.appendChild(i);
        // adding space between icon and text
        const text = document.createTextNode(" "+item.item);
        li.appendChild(text);
        // check if item.url start with http or https or / to determine if it is an external or internal link
        if (item.url.startsWith("http") || item.url.startsWith("/")) {
            li.setAttribute('onclick', `window.location.href='${item.url}'; window.target='${item.target}'`);
        } else {
           li.setAttribute('onclick', `loadFormData('${item.url}',document.getElementById('${item.target}'))`);
        }
       
     
        menu.appendChild(li);
    });
}
