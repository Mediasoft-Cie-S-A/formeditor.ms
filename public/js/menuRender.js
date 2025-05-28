
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