

function createMenuComponent(type) {
    // Logic to create the menu
    const mainDiv = document.createElement('div');

    const menu = document.createElement('ul');
    menu.className = 'menu-component';

    const menuItems = ['Home', 'About', 'Services', 'Contact'];  // Example items, could be dynamic
    menuItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        menu.appendChild(li);
    });

    mainDiv.appendChild(menu);

    return mainDiv;
}

function editMenuComponent(type, element, content) {
    // Logic to edit the menu, for example adding/removing items
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    content.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        element.appendChild(li);
    });
}

