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
    const tabsHeader = document.createElement('div');
    tabsHeader.classList.add('ctab_tabs-header');
    element.appendChild(tabsHeader);
    const tabsContent = document.createElement('div');
    tabsContent.classList.add('ctab_tabs');
    element.appendChild(tabsContent);


    createTabContent(tabsHeader, tabsContent);

    return element;
}

function editElementTab(type, element, content) {

    //get all the tabs
    const tabsHeader = element.querySelectorAll('.ctab_HeaderButton');

    const tabsContent = element.querySelectorAll('.ctab_ContentDiv');

    const div = document.createElement('div');
    div.id = 'TabList';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.padding = '5px';
    div.style.minHeight = '100px';
    div.style.border = '1px solid #ccc';
    // rounded corners
    div.style.borderRadius = '5px';

    div.style.className = 'multi-select';
    div.style.overflow = 'auto';
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
            tabH.remove();
            tabC.remove();
        });
        editTab.appendChild(removeButton);
        div.appendChild(editTab);
    };
    content.appendChild(div);
}

function createTabContent(tabsHeader, tabsContent) {
    let tabs = tabsHeader.querySelectorAll('.ctab_HeaderButton');
    let tabcount = 0;
    if (tabs != null || tabs != undefined) {
        tabcount = tabs.length;
    }

    const tabId = `ctab_tab-${tabcount}`;

    // Create tab header
    const tabHeader = document.createElement('div');

    tabHeader.dataset.tab = tabId;
    tabHeader.innerText = (tabcount === 1) ? "Edit" : `Tab-${tabcount}`;
    tabHeader.className = 'ctab_HeaderButton';
    tabsHeader.appendChild(tabHeader);

    // Create tab content
    const tabContent = document.createElement('div');
    tabContent.id = tabId;
    // tabContent.textContent = `Content for ${title}`;
    tabsContent.appendChild(tabContent);
    tabContent.style.display = 'none';
    tabContent.className = 'ctab_ContentDiv';

    // Activate the new tab
    // fire tabHeader click event

    tabHeader.setAttribute('onclick', 'activateTab(event,this,document.getElementById("' + tabId + '"))');

    activateTab(event, tabHeader, tabContent);


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
    console.log("Activate tab")
    if (event) {
        event.preventDefault();
    }
    // 🔁 Default behavior for regular tabs
    // Hide all tab contents
    tabContent.parentElement.querySelectorAll('.ctab_ContentDiv').forEach((el) => el.style.display = 'none');

    // Unset 'active' on all tab headers
    tabHeader.parentElement.querySelectorAll('.ctab_HeaderButton').forEach((el) => el.classList.remove('active'));

    // Activate current tab
    tabHeader.classList.add('active');
    tabContent.style.display = 'block';

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
