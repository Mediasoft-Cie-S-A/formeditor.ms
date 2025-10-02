/*!
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
let pagesData = [];
let pagesViewMode = 'grid';

function loadPages() {

    fetch("/pages").then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    }).then(pages => {
        pagesData = Array.isArray(pages) ? pages : [];
        renderPages();
    }).catch(error => {
        console.error("Error fetching pages:", error);
        const emptyState = document.getElementById("pagesEmptyState");
        if (emptyState) {
            emptyState.textContent = "Error loading pages.";
            emptyState.classList.remove('d-none');
        }
    });
}

function renderPages() {
    const tableBody = document.getElementById("pageListContainerBody");
    const panelContainer = document.getElementById('pagesPanelContainer');
    const emptyState = document.getElementById("pagesEmptyState");

    if (!tableBody || !panelContainer) {
        return;
    }

    tableBody.innerHTML = "";
    panelContainer.innerHTML = "";

    const filters = getPageFilters();
    const filteredPages = pagesData.filter(page => matchesPageFilters(page, filters));

    filteredPages.forEach(page => {
        tableBody.appendChild(buildPageRow(page));
        panelContainer.appendChild(buildPageCard(page));
    });

    const hasResults = filteredPages.length > 0;
    if (emptyState) {
        emptyState.classList.toggle('d-none', hasResults);
        emptyState.textContent = pagesData.length === 0 ? 'No pages available.' : 'No pages match the current filters.';
    }

    updatePagesView();
}

function buildPageRow(page) {
    const container = document.createElement("tr");

    const metaInfo = normalisePageMeta(page.meta);

    const idCell = document.createElement('td');
    idCell.textContent = page.objectId;
    container.appendChild(idCell);

    const slugCell = document.createElement('td');
    slugCell.textContent = page.slug;
    container.appendChild(slugCell);

    const layoutCell = document.createElement('td');
    layoutCell.textContent = page.layout;
    container.appendChild(layoutCell);

    const titleCell = document.createElement('td');
    titleCell.textContent = page.title;
    container.appendChild(titleCell);

    const metaDescCell = document.createElement('td');
    metaDescCell.textContent = metaInfo.description;
    container.appendChild(metaDescCell);

    const metaKeywordsCell = document.createElement('td');
    metaKeywordsCell.textContent = metaInfo.keywords;
    container.appendChild(metaKeywordsCell);

    const actionsCell = document.createElement('td');
    const { showButton, editButton, deleteButton } = createPageActionButtons(page);
    actionsCell.appendChild(showButton);
    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
    container.appendChild(actionsCell);

    return container;
}

function buildPageCard(page) {
    const column = document.createElement('div');
    column.className = 'col-12 col-md-6 col-xl-4';

    const card = document.createElement('div');
    card.className = 'card h-100 shadow-sm';

    const metaInfo = normalisePageMeta(page.meta);

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    cardBody.innerHTML = `
        <h5 class="card-title mb-2">${page.title || page.slug}</h5>
        <h6 class="card-subtitle text-muted mb-3">/${page.slug}</h6>
        <dl class="row mb-0 small">
            <dt class="col-5">ID</dt>
            <dd class="col-7 text-end">${page.objectId}</dd>
            <dt class="col-5">Layout</dt>
            <dd class="col-7 text-end">${page.layout || '-'}</dd>
            <dt class="col-5">Meta Description</dt>
            <dd class="col-7 text-end">${metaInfo.description || '-'}</dd>
            <dt class="col-5">Meta Keywords</dt>
            <dd class="col-7 text-end">${metaInfo.keywords || '-'}</dd>
        </dl>
    `;

    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer bg-transparent border-0 pt-0 d-flex gap-2 flex-wrap';
    const { showButton, editButton, deleteButton } = createPageActionButtons(page);
    cardFooter.appendChild(showButton);
    cardFooter.appendChild(editButton);
    cardFooter.appendChild(deleteButton);

    card.appendChild(cardBody);
    card.appendChild(cardFooter);
    column.appendChild(card);

    return column;
}

function createPageActionButtons(page) {
    const showButton = document.createElement('button');
    showButton.innerHTML = '<i class="fa fa-eye" style="margin-left:-5px"></i>';
    showButton.className = 'portal-show-button';
    showButton.onclick = function (event) {
        event.preventDefault();
        const pageUrl = `/${page.slug}`;
        window.open(pageUrl, '_blank');
    };

    const editButton = document.createElement('button');
    editButton.innerHTML = '<i class="fa fa-edit" style="margin-left:-5px"></i>';
    editButton.className = 'portal-edit-button';
    editButton.onclick = function (event) {
        event.preventDefault();
        loadPage(page.objectId);
        const editTab = document.querySelector('.nav-tabs a[href="#editForm"]');
        if (editTab) {
            editTab.click();
        }
    };

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fa fa-trash" style="margin-left:-5px"></i>';
    deleteButton.className = 'portal-delete-button';
    deleteButton.onclick = function (event) {
        event.preventDefault();
        deletePage(page.objectId);
    };

    return { showButton, editButton, deleteButton };
}

function getPageFilters() {
    const idInput = document.getElementById('searchPageInput');
    const slugInput = document.getElementById('searchPageSlugInput');

    return {
        id: idInput ? idInput.value.trim().toLowerCase() : '',
        slug: slugInput ? slugInput.value.trim().toLowerCase() : ''
    };
}

function matchesPageFilters(page, filters) {
    const idMatch = !filters.id || String(page.objectId).toLowerCase().includes(filters.id);
    const slugMatch = !filters.slug || (page.slug || '').toLowerCase().includes(filters.slug);
    return idMatch && slugMatch;
}

function normalisePageMeta(meta) {
    if (!meta) {
        return { description: '', keywords: '' };
    }

    if (typeof meta === 'string') {
        try {
            const parsed = JSON.parse(meta);
            return normalisePageMeta(parsed);
        } catch (err) {
            return { description: meta, keywords: meta };
        }
    }

    if (typeof meta === 'object') {
        const description = meta.description || '';
        const keywordsValue = meta.keywords;
        const keywords = Array.isArray(keywordsValue) ? keywordsValue.join(', ') : (keywordsValue || '');
        return { description, keywords };
    }

    return { description: '', keywords: '' };
}

function updatePagesView() {
    const gridWrapper = document.getElementById('pagesGridWrapper');
    const panelWrapper = document.getElementById('pagesPanelWrapper');
    const gridButton = document.getElementById('pagesGridViewBtn');
    const panelButton = document.getElementById('pagesPanelViewBtn');

    if (gridWrapper && panelWrapper) {
        gridWrapper.classList.toggle('d-none', pagesViewMode !== 'grid');
        panelWrapper.classList.toggle('d-none', pagesViewMode !== 'panel');
    }

    if (gridButton && panelButton) {
        if (pagesViewMode === 'grid') {
            gridButton.classList.add('btn-primary');
            gridButton.classList.remove('btn-outline-secondary');
            panelButton.classList.add('btn-outline-secondary');
            panelButton.classList.remove('btn-primary');
        } else {
            panelButton.classList.add('btn-primary');
            panelButton.classList.remove('btn-outline-secondary');
            gridButton.classList.add('btn-outline-secondary');
            gridButton.classList.remove('btn-primary');
        }
    }
}

function togglePagesView(mode) {
    if (pagesViewMode === mode) {
        return;
    }
    pagesViewMode = mode;
    updatePagesView();
}

function loadPage(pageId) {
    console.log("Loading page with ID:", pageId);
    fetch(`/pages/${pageId}`)
        .then(response => {
            if (!response.ok) {
                showToast("Error loading page: " + response.statusText);
            }
            return response.json();
        })
        .then(page => {
            console.log("Page data:", page);
            // Populate the form with the page data
            document.getElementById("objectId").value = page.objectId;
            document.getElementById("objectName").value = page.title;
            document.getElementById("objectSlug").value = page.slug;
            document.getElementById("userCreated").value = page.userCreated;
            document.getElementById("userModified").value = page.userModified;
            document.getElementById("objectTypeHidden").value = page.header || ""; // Use header if available
            var objectType = document.getElementById('objectType');
            // select in the objecttype the value form
            objectType.value = 'page';
            // Assuming formContainer is where the page content is displayed
            const formContainer = document.getElementById("formContainer");
            formContainer.innerHTML = ""; // Clear existing content
            // Assuming page.content is a JSON object that needs to be rendered
            switch (page.layout) {
                case "raw":
                    formContainer.innerHTML = page.content; // Directly set the HTML content
                    break;
                case "default":
                    jsonToDom(page.content, formContainer);
                    break;
                default:
                    console.error("Unknown layout type:", page.layout);
            }
            showToast("Page loaded successfully");
        })
        .catch(error => {
            console.error("Error loading page:", error);
            showToast("Error loading page: " + error.message);
        });
}


function registerObject(e) {
    e.preventDefault();
    console.log("submit");

    var type = document.getElementById("objectType").value;
    switch (type) {
        case "form":
            registerForm(e);
            break;
        case "business_component":
            registerBusinessComponent(e);
            break;
        case "page":
            registerPage(e);
            break;
        default:
            console.error("Unknown object type");
    }

}

function registerPage(e) {
    e.preventDefault();
    console.log("submit");

    var objectId = document.getElementById("objectId").value;
    var objectName = document.getElementById("objectName").value;
    var objectSlug = document.getElementById("objectSlug").value;
    var userCreated = document.getElementById("userCreated").value;
    var userModified = document.getElementById("userModified").value;
    var type = document.getElementById("objectType").value;
    var header = document.getElementById("objectTypeHidden").value;

    var formContainer = document.getElementById("formContainer");
    // var jsonData = domToJson(formContainer);
    // removet gjs-selection class from all elements in formContainer
    var elements = formContainer.querySelectorAll('.gjs-selection');
    elements.forEach(function (element) {
        element.classList.remove('gjs-selection');
    });
    // get the innerHTML of the formContainer
    var htmlContent = formContainer.innerHTML;
    if (type == "page") {

        // genere form data based on slug, title, layout = "default", content = "", meta = {}
        const formData = {
            objectId: objectId,
            slug: objectSlug,
            title: objectName,
            layout: "raw", // Assuming raw layout for pages
            content: htmlContent,
            meta: {
                description: "Page description",
                keywords: ["keyword1", "keyword2"]
            },
            userCreated: userCreated,
            userModified: userModified,
            header: header,
        };
        // post the form data to the server to store it /page
        fetch("/pages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    showToast("Error registering page: " + response.statusText);
                }
                showToast("Page registered successfully");

            }).catch(error => {
                console.error("Error registering page:", error);
                showToast("Error registering page: " + error.message);
            });
    }
}

function deletePage(pageID) {
    if (confirm("Are you sure you want to delete this page?")) {
        fetch(`/pages/${pageID}`, {
            method: "DELETE"
        })
            .then(response => {
                if (!response.ok) {
                    showToast("Error deleting page: " + response.statusText);
                } else {
                    showToast("Page deleted successfully");
                    pagesData = pagesData.filter(page => page.objectId !== pageID);
                    renderPages();
                }
            }).catch(error => {
                console.error("Error deleting page:", error);
                showToast("Error deleting page: " + error.message);
            });
    }
}

function searchPagebyID(event) {
    event.preventDefault();
    renderPages();
}

function searchPagebySlug(event) {
    event.preventDefault();
    renderPages();
}

loadPages();