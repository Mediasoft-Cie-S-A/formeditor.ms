/* buttonLinkComponent.js
 * A button that links to a specific screen, with drag-and-drop support.
 */

function createButtonLink(type) {
    const btn = document.createElement("button");
    btn.setAttribute("tagName", type);
    btn.id = `buttonLink-${Date.now()}`;
    btn.textContent = "Open Screen";

    // Initial configuration
    const config = {
        url: "",
        target: "",
        iconLock: true,
        label: "Open Screen"
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
    };

    // Assign click behavior
    btn._applyClick = () => {
        btn.onclick = () => {
            const config = JSON.parse(btn.getAttribute("config") || "{}");
            if (config.url && config.target) {
                const targetEl = document.getElementById(config.target);
                if (targetEl) {
                    targetEl.innerHTML = ""; // Clear previous screen
                    loadFormData(config.url, targetEl);
                    // 👇 Automatically activate the "Edit" tab if present
                    setTimeout(() => {
                        activateEditTabIn(targetEl);
                    }, 100);
                }}
        };
    };
    btn._applyClick();

    setLockIcon(btn);
    return btn;
}

// Edit panel to update button's URL and target
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

        // Label input
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

    // Target input
    const labelTarget = document.createElement("label");
    labelTarget.textContent = "Target ID:";
    const inputTarget = document.createElement("input");
    inputTarget.type = "text";
    inputTarget.value = config.target || "";

    // Update button
    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Update";
    updateBtn.style.width = "100%";
    updateBtn.onclick = () => {
        saveButtonLink(element, inputURL.value, inputTarget.value, inputLabel.value, inputNameScreen.value);
    };

    // Add all inputs to the editor panel
    container.appendChild(updateBtn);
    container.appendChild(labelURL);
    container.appendChild(inputURL);
    container.appendChild(labelLabel);
    container.appendChild(inputLabel);
    container.appendChild(labelTarget);
    container.appendChild(inputTarget);
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

function saveButtonLink(element, url, target, label,nameScreen) {
    const config = {
        url: url,
        target: target,
        iconLock: element.getAttribute("data-icon-lock") === "true",
        label: label,
        nameScreen : nameScreen
        };

    // Save configuration to element attribute
    element.setAttribute("config", JSON.stringify(config));

    // Update appearance and behavior
    renderButtonLink(element);

    console.log("Button link saved:", config);
}
function renderButtonLink(element) {
    const config = JSON.parse(element.getAttribute("config") || "{}");

    // Update existing element (no replace!)
    element.textContent = config.label || "Open Screen";
    element.setAttribute("tagName", element.getAttribute("tagName"));
    element.setAttribute("config", JSON.stringify(config));
    element.setAttribute("data-url", config.url || "");
    element.setAttribute("data-target", config.target || "");
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

    // Click logic
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
    element._applyClick();

    // Icon
    setLockIcon(element);
}





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
  
      // Fermeture uniquement via le bouton, pas au clic hors modal
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
    screen.innerHTML = "";
    loadFormData(screenUrl, screen);
  
    modal.style.display = "flex"; // ou block selon ton CSS
  
    // Si tu veux activer un onglet "Edit" ou autre dans l'écran après chargement
    setTimeout(() => activateEditTabIn(screen), 100);
  }
  