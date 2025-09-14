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



function createElementTab(type) {
    const element = document.createElement('div');
    element.id = 'Tab' + Date.now(); // Unique ID for each new element
    element.tagName = type;
    element.classList.add('ctab_tabs-container');
    element.style.width = '100%';
    // generate tab html code with 3 tabs
    const tabsHeader = document.createElement('ul');
    tabsHeader.classList.add('ctab_tabs-header', 'nav-tabs');
    element.appendChild(tabsHeader);
    const tabsContent = document.createElement('div');
    tabsContent.classList.add('ctab_tabs', 'tab-content');
    element.appendChild(tabsContent);


    createTabContent(tabsHeader, tabsContent);

    return element;
}

function editElementTab(type, element, content) {
    // get all the tabs
    const tabsHeader = element.querySelectorAll('.ctab_HeaderButton');
    const tabsContent = element.querySelectorAll('.ctab_ContentDiv');

    const div = document.createElement('div');
    div.id = 'TabList';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.padding = '5px';
    div.style.minHeight = '100px';
    div.style.border = '1px solid #ccc';
    div.style.borderRadius = '5px';
    div.style.overflow = 'auto';

    /* === NEW: Tabs Type selector (orientation + floating) === */
    const typeBlock = document.createElement('div');
    typeBlock.style.display = 'flex';
    typeBlock.style.alignItems = 'center';
    typeBlock.style.gap = '8px';
    typeBlock.style.marginBottom = '8px';

    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Tabs type:';

    const typeSelect = document.createElement('select');
    typeSelect.innerHTML = `
    <option value="horizontal">Horizontal</option>
    <option value="vertical">Vertical (left)</option>
    <option value="float:tl">Floating — Top Left</option>
    <option value="float:tr">Floating — Top Right</option>
    <option value="float:bl">Floating — Bottom Left</option>
    <option value="float:br">Floating — Bottom Right</option>
  `;

    // Init from element dataset / classes
    const currentOrientation =
        element.dataset.ctabOrientation ||
        (element.classList.contains('ctab--vertical') ? 'vertical' : 'horizontal');

    const currentFloat =
        element.dataset.ctabFloat ||
        (element.classList.contains('ctab--float-tl') ? 'tl' :
            element.classList.contains('ctab--float-tr') ? 'tr' :
                element.classList.contains('ctab--float-bl') ? 'bl' :
                    element.classList.contains('ctab--float-br') ? 'br' : '');

    typeSelect.value = currentFloat ? `float:${currentFloat}` : currentOrientation;

    typeSelect.addEventListener('change', function () {
        const v = typeSelect.value;
        if (v.startsWith('float:')) {
            const anchor = v.split(':')[1]; // tl|tr|bl|br
            // default floating is horizontal header; keep currentOrientation if you prefer
            setTabsLayout(element, { orientation: 'horizontal', float: anchor });
        } else {
            setTabsLayout(element, { orientation: v, float: null });
        }
    });

    typeBlock.appendChild(typeLabel);
    typeBlock.appendChild(typeSelect);
    div.appendChild(typeBlock);
    /* === /NEW === */

    // add the add button
    const addButton = document.createElement('button');
    addButton.id = 'addTab';
    addButton.style.width = '30px';
    addButton.innerText = '+';
    addButton.style.itemAlign = 'center';
    addButton.style.float = 'right';
    addButton.addEventListener('click', function () {
        createTabContent(element.querySelector('.ctab_tabs-header'), element.querySelector('.ctab_tabs'));
    });
    div.appendChild(addButton);

    // add remove button in current div
    for (var i = 0; i < tabsHeader.length; i++) {
        const tabH = tabsHeader[i];
        const tabC = tabsContent[i];
        const editTab = document.createElement('div');
        editTab.id = 'editTab';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = tabH.innerText;
        input.addEventListener('change', function () {
            tabH.innerText = input.value;
        });
        editTab.appendChild(input);
        const removeButton = document.createElement('button');
        removeButton.id = 'removeTab';
        removeButton.innerText = '-';
        removeButton.addEventListener('click', function () {
            if (tabH.parentElement) {
                tabH.parentElement.remove();
            } else {
                tabH.remove();
            }
            tabC.remove();
        });
        editTab.appendChild(removeButton);
        div.appendChild(editTab);
    }
    content.appendChild(div);
}


function createTabContent(tabsHeader, tabsContent) {
    let tabs = tabsHeader.querySelectorAll('.ctab_HeaderButton');
    let tabcount = 0;
    if (tabs != null || tabs != undefined) {
        tabcount = tabs.length;
    }

    const tabId = `ctab_tab-${tabcount}`;

    // Create tab header using <li><a>
    const li = document.createElement('li');
    const tabHeader = document.createElement('a');
    tabHeader.href = '#';
    tabHeader.dataset.tab = tabId;
    tabHeader.innerText = (tabcount === 1) ? "Edit" : `Tab-${tabcount}`;
    tabHeader.className = 'ctab_HeaderButton';
    li.appendChild(tabHeader);
    tabsHeader.appendChild(li);

    // Create tab content
    const tabContent = document.createElement('div');
    tabContent.id = tabId;
    tabsContent.appendChild(tabContent);
    tabContent.className = 'ctab_ContentDiv tab-pane fade';

    // Activate the new tab
    tabHeader.addEventListener('click', function (e) {
        activateTab(e, tabHeader, tabContent);
    });

    activateTab(null, tabHeader, tabContent);

};

function createEditModal() {
    // Prevent duplicate modals
    if (document.getElementById("editModal")) return;

    const modal = document.createElement("div");
    modal.id = "editModal";
    modal.className = "modal";
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.zIndex = "999";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.style.backgroundColor = "white";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "6px";
    modalContent.style.minWidth = "300px";
    modalContent.style.minHeight = "200px";
    modalContent.style.position = "relative";

    const closeButton = document.createElement("span");
    closeButton.className = "close-button";
    closeButton.innerHTML = "&times;";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "15px";
    closeButton.style.cursor = "pointer";
    closeButton.style.fontSize = "20px";

    // 🧠 Move tab content back when modal is closed
    closeButton.addEventListener("click", function () {
        modal.style.display = "none";

        const editTabContent = document.getElementById("editModalContent").firstElementChild;
        if (editTabContent && editTabContent._originalParent) {
            if (editTabContent._originalNextSibling) {
                editTabContent._originalParent.insertBefore(editTabContent, editTabContent._originalNextSibling);
            } else {
                editTabContent._originalParent.appendChild(editTabContent);
            }
            editTabContent.style.display = "none";

            // Nettoyer après usage
            delete editTabContent._originalParent;
            delete editTabContent._originalNextSibling;
        }


    });

    const modalContentContainer = document.createElement("div");
    modalContentContainer.id = "editModalContent";

    modalContent.appendChild(closeButton);
    modalContent.appendChild(modalContentContainer);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
}

function createEditBigModal() {
    if (document.getElementById("editBigModal")) return;

    const modal = document.createElement("div");
    modal.id = "editBigModal";
    modal.className = "modal";
    modal.style.display = "none";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.zIndex = "999";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";

    const modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalContent.style.backgroundColor = "white";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "6px";
    modalContent.style.minWidth = "300px";
    modalContent.style.minHeight = "200px";
    modalContent.style.position = "relative";

    const modalContentContainer = document.createElement("div");
    modalContentContainer.id = "editModalContent";

    modalContent.appendChild(modalContentContainer);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

}



function activateTab(event, tabHeader, tabContent) {
    if (event) {
        event.preventDefault();
    }

    const headerContainer = tabHeader.closest('.ctab_tabs-header');
    const tabHeaderButtons = headerContainer.querySelectorAll('.ctab_HeaderButton');
    tabHeaderButtons.forEach(btn => btn.classList.remove('active'));

    const contentContainer = headerContainer.parentElement.querySelectorAll('.ctab_ContentDiv');
    contentContainer.forEach(c => c.classList.remove('active'));

    tabHeader.classList.add('active');
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

function activateEditTabIn(targetElement) {
    const editHeader = Array.from(targetElement.querySelectorAll('.ctab_HeaderButton'))
        .find(el => el.innerText.toLowerCase().includes('edit'));

    if (editHeader) {
        const tabId = editHeader.dataset.tab;
        const editContent = targetElement.querySelector(`#${tabId}`);
        if (editContent) {
            activateTab(null, editHeader, editContent);
        }
    }
}



/* === NEW: layout helpers (orientation + floating) === */
function setTabsLayout(container, { orientation = 'horizontal', float = null } = {}) {
    if (!container) return;

    // Remove previous classes
    container.classList.remove(
        'ctab--horizontal', 'ctab--vertical', 'ctab--floating',
        'ctab--float-tl', 'ctab--float-tr', 'ctab--float-bl', 'ctab--float-br'
    );

    // Orientation
    if (orientation === 'vertical') {
        container.classList.add('ctab--vertical');
    } else {
        container.classList.add('ctab--horizontal');
    }

    // Floating
    if (float) {
        container.classList.add('ctab--floating', `ctab--float-${float}`);
        // compute padding to avoid overlap
        requestAnimationFrame(() => updateFloatingPadding(container));
        if (!container._ctabResizeHandler) {
            container._ctabResizeHandler = () => updateFloatingPadding(container);
            window.addEventListener('resize', container._ctabResizeHandler);
        }
    } else {
        const content = container.querySelector('.ctab_tabs');
        if (content) {
            content.style.setProperty('--ctab-pad-top', '0px');
            content.style.setProperty('--ctab-pad-bottom', '0px');
            content.style.setProperty('--ctab-pad-left', '0px');
            content.style.setProperty('--ctab-pad-right', '0px');
        }
        if (container._ctabResizeHandler) {
            window.removeEventListener('resize', container._ctabResizeHandler);
            delete container._ctabResizeHandler;
        }
    }

    // Persist on element (so renderer can re-apply)
    container.dataset.ctabOrientation = orientation;
    container.dataset.ctabFloat = float ? String(float) : '';
}

/* === NEW: compute dynamic paddings for floating header === */
function updateFloatingPadding(container) {
    const header = container.querySelector('.ctab_tabs-header');
    const content = container.querySelector('.ctab_tabs');
    if (!header || !content) return;

    // reset
    content.style.setProperty('--ctab-pad-top', '0px');
    content.style.setProperty('--ctab-pad-bottom', '0px');
    content.style.setProperty('--ctab-pad-left', '0px');
    content.style.setProperty('--ctab-pad-right', '0px');

    const r = header.getBoundingClientRect();

    if (container.classList.contains('ctab--float-tl') || container.classList.contains('ctab--float-tr')) {
        content.style.setProperty('--ctab-pad-top', `${r.height + 12}px`);
    }
    if (container.classList.contains('ctab--float-bl') || container.classList.contains('ctab--float-br')) {
        content.style.setProperty('--ctab-pad-bottom', `${r.height + 12}px`);
    }
    if (container.classList.contains('ctab--vertical')) {
        if (container.classList.contains('ctab--float-tl') || container.classList.contains('ctab--float-bl')) {
            content.style.setProperty('--ctab-pad-left', `${r.width + 12}px`);
        }
        if (container.classList.contains('ctab--float-tr') || container.classList.contains('ctab--float-br')) {
            content.style.setProperty('--ctab-pad-right', `${r.width + 12}px`);
        }
    }
}

/* === NEW: rendering function (apply persisted type) === */
function renderTabComponent(container) {
    if (!container) return;
    const orientation = container.dataset.ctabOrientation || 'horizontal';
    const float = container.dataset.ctabFloat || ''; // '', 'tl','tr','bl','br'
    setTabsLayout(container, { orientation, float: float || null });

    const headers = container.querySelectorAll('.ctab_HeaderButton');
    headers.forEach(header => {
        const tabId = header.dataset.tab;
        const content = container.querySelector(`#${tabId}`);
        header.addEventListener('click', e => activateTab(e, header, content));
    });

    let activeHeader = Array.from(headers).find(h => h.classList.contains('active'));
    if (!activeHeader && headers.length > 0) {
        activeHeader = headers[0];
    }
    if (activeHeader) {
        const content = container.querySelector(`#${activeHeader.dataset.tab}`);
        activateTab(null, activeHeader, content);
    }
}
