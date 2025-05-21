/* buttonLinkComponent.js
 * A button that links to a specific screen, with drag-and-drop support.
 */

function createButtonLink(type) {
    const btn = document.createElement("button");
    btn.setAttribute("tagName", type);
    btn.id = `buttonLink-${Date.now()}`;
    btn.textContent = "Open Screen";

    // Add spacing around the button for better layout
    btn.style.margin = "8px"; // external space between buttons
    btn.style.padding = "10px 15px"; // internal space inside the button

    // Initial configuration
    const config = {
        url: "",
        // target: "", // ❌ no longer used
        iconLock: true,
        label: "Open Screen",
        nameScreen: "Écran"
    };
    btn.setAttribute("config", JSON.stringify(config));

    // Enable drag & drop
    btn.draggable = true;
    btn.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", btn.id);
        setTimeout(() => btn.style.display = "none", 0);
    };
    btn.ondragend = () => {
        btn.style.display = "block";

        // 🧠 Re-apply layout spacing after drop (in case needed)
        btn.style.margin = "8px";
        btn.style.padding = "10px 15px";
    };

    // Assign click behavior (previous logic disabled)
    /*
    btn._applyClick = () => {
        btn.onclick = () => {
            const config = JSON.parse(btn.getAttribute("config") || "{}");
            if (config.url && config.target) {
                const targetEl = document.getElementById(config.target);
                if (targetEl) {
                    targetEl.innerHTML = ""; // Clear previous screen
                    loadFormData(config.url, targetEl);
                    setTimeout(() => {
                        activateEditTabIn(targetEl);
                    }, 100);
                }
            }
        };
    };
    */
    btn._applyClick = () => {}; // noop

    btn._applyClick();

    setLockIcon(btn);
    return btn;
}


// Edit panel to update button's URL and label
function editButtonLink(type, element, content) {
    const config = JSON.parse(element.getAttribute("config") || "{}");

    const container = document.createElement("div");
    container.className = "button-link-editor";

    // Label input
    const labelLabel = document.createElement("label");
    labelLabel.textContent = "Button Label:";
    const inputLabel = document.createElement("input");
    inputLabel.type = "text";
    inputLabel.value = config.label || "Name button";

    // Screen name input
    const nameScreen = document.createElement("label");
    nameScreen.textContent = "Screen name:";
    const inputNameScreen = document.createElement("input");
    inputNameScreen.type = "text";
    inputNameScreen.value = config.nameScreen || "Name Screen";

    // URL input
    const labelURL = document.createElement("label");
    labelURL.textContent = "Destination URL:";
    const inputURL = document.createElement("input");
    inputURL.type = "text";
    inputURL.value = config.url || "";

    // Target input (désactivé mais conservé)
    /*
    const labelTarget = document.createElement("label");
    labelTarget.textContent = "Target ID:";
    const inputTarget = document.createElement("input");
    inputTarget.type = "text";
    inputTarget.value = config.target || "";
    */

    // Update button
    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Update";
    updateBtn.style.width = "100%";
    updateBtn.onclick = () => {
        // saveButtonLink(element, inputURL.value, inputTarget.value, inputLabel.value, inputNameScreen.value); // old
        saveButtonLink(element, inputURL.value, inputLabel.value, inputNameScreen.value); // new
    };

    // Add all inputs to the editor panel
    container.appendChild(updateBtn);
    container.appendChild(labelURL);
    container.appendChild(inputURL);
    container.appendChild(labelLabel);
    container.appendChild(inputLabel);
    // container.appendChild(labelTarget);
    // container.appendChild(inputTarget);
    container.appendChild(nameScreen);
    container.appendChild(inputNameScreen);

    content.appendChild(container);
}

function setLockIcon(btn) {
    const show = btn.getAttribute("data-icon-lock") === "true";
    btn.querySelectorAll(".__lock").forEach(el => el.remove());

    if (show) {
        const i = document.createElement("i");
        i.className = "fa fa-lock __lock";
        i.style.marginLeft = "6px";
        btn.appendChild(i);
    }
}

// Save button settings
// ❗️ version simplifiée sans target
function saveButtonLink(element, url, label, nameScreen) {
    const config = {
        url: url,
        // target: target, // ❌ plus utilisé
        iconLock: element.getAttribute("data-icon-lock") === "true",
        label: label,
        nameScreen: nameScreen
    };

    element.setAttribute("config", JSON.stringify(config));
    renderButtonLink(element);
    console.log("Button link saved:", config);
}

function renderButtonLink(element) {
    const config = JSON.parse(element.getAttribute("config") || "{}");

    // Update appearance
    element.textContent = config.label || "Open Screen";
    element.setAttribute("tagName", element.getAttribute("tagName"));
    element.setAttribute("config", JSON.stringify(config));
    element.setAttribute("data-url", config.url || "");
    // element.setAttribute("data-target", config.target || ""); // ❌ plus utilisé
    element.setAttribute("data-icon-lock", config.iconLock ? "true" : "false");

    // Drag & drop
    element.draggable = true;
    element.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", element.id);
        setTimeout(() => element.style.display = "none", 0);
    };
    element.ondragend = () => {
        element.style.display = "block";
    };

    // Click behavior (ancienne logique désactivée)
    /*
    element._applyClick = () => {
        element.onclick = () => {
            const cfg = JSON.parse(element.getAttribute("config") || "{}");
            const targetEl = document.getElementById(cfg.target);
            if (cfg.url && targetEl) {
                targetEl.innerHTML = "";
                loadFormData(cfg.url, targetEl);
                setTimeout(() => {
                    activateEditTabIn(targetEl);
                }, 100);
            }
        };
    };
    */
    element._applyClick();

    setLockIcon(element);
}

// Main click listener: modal opening
document.addEventListener("click", (e) => {
    const btn = e.target.closest('button[tagName="buttonLink"]');
    if (!btn) return;

    const config = JSON.parse(btn.getAttribute("config") || "{}");
    if (!config.url) return;

    openMenuInModal(config.nameScreen || "Écran", config.url);
});

/***********************
 *  Modal infrastructure
 ***********************/
function ensureMenuModal() {
    let modal = document.getElementById("menuModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "menuModal";
        modal.className = "modal";

        modal.innerHTML = `
            <div class="modal__dialog">
                <button class="modal__close" aria-label="Fermer">&times;</button>
                <div class="modal__title" id="menuModalTitle"></div>
                <div class="modal__screen" id="menuModalScreen"></div>
            </div>
        `;

        const closeBtn = modal.querySelector(".modal__close");
        closeBtn.onclick = () => {
            modal.style.display = "none";
            modal.querySelector("#menuModalScreen").innerHTML = "";
        };

        document.body.appendChild(modal);
    }
    return modal;
}

function openMenuInModal(titleText, screenUrl) {
    const modal = ensureMenuModal();
    const title = modal.querySelector("#menuModalTitle");
    const screen = modal.querySelector("#menuModalScreen");

    title.textContent = titleText || "Menu";
    screen.innerHTML = "<h2>Chargement...</h2>";
    //loadFormData(screenUrl, screen);
    loadFormDataInModal(screenUrl, screen);

    modal.style.display = "flex";

    setTimeout(() => {
        activateEditTabIn(screen);
// Désactiver l'onglet "Table" s'il existe
const tabHeaders = screen.querySelectorAll('.ctab_HeaderButton');
tabHeaders.forEach(header => {
    if (header.innerText.trim().toLowerCase() === "table") {
        header.classList.add('disabled');
        header.onclick = (e) => e.preventDefault(); // bloque le clic
        header.style.pointerEvents = "none"; // optionnel : désactive les clics
        header.style.opacity = "0.5"; // optionnel : grise le bouton
    }
});

        // Attendre encore un peu pour s'assurer que les éléments sont bien dans le DOM
        setTimeout(() => {
            const insertBtn = screen.querySelector('[name="InsertDSBtn"]');
            if (insertBtn) {
                console.log("InsertDSBtn trouvé, déclenchement du clic...");
                insertBtn.click(); // 💥 Lancement du mode 'new record'
            } else {
                console.warn('Le bouton [name="InsertDSBtn"] est introuvable.');
            }
        }, 100); // ajustable si nécessaire selon le temps de chargement
    }, 100);
}