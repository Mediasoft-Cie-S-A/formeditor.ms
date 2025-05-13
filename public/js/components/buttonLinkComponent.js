/* buttonLinkComponent.js
 * A button that links to a specific screen, with drag-and-drop support.
 */

function createButtonLink(type) {
    const btn = document.createElement("button");
    btn.setAttribute("tagName", type);
    btn.className = "btn-link";
    btn.id = `buttonLink-${Date.now()}`;
    btn.textContent = "Open Screen";

    // Initial configuration
    const config = {
        url: "",
        target: "",
        iconLock: true
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
                loadFormData(config.url, document.getElementById(config.target));
            } else {
                alert("Link is incomplete: missing URL or target.");
            }
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
        saveButtonLink(element, inputURL.value, inputTarget.value);
    };

    // Add all inputs to the editor panel
    container.appendChild(labelURL);
    container.appendChild(inputURL);
    container.appendChild(labelTarget);
    container.appendChild(inputTarget);
    container.appendChild(updateBtn);

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

  function saveButtonLink(element, url, target) {
    const config = {
        url: url,
        target: target,
        iconLock: element.getAttribute("data-icon-lock") === "true"
    };

    // Save configuration to element attribute
    element.setAttribute("config", JSON.stringify(config));

    // Update appearance and behavior
    renderButtonLink(element);

    console.log("Button link saved:", config);
}

function renderButtonLink(element) {
    const config = JSON.parse(element.getAttribute("config") || "{}");

    const newBtn = document.createElement("button");
    newBtn.className = "btn-link";
    newBtn.id = element.id; // Keep same ID
    newBtn.textContent = "Open Screen";
    newBtn.setAttribute("tagName", element.getAttribute("tagName"));
    newBtn.setAttribute("config", JSON.stringify(config));
    newBtn.setAttribute("data-url", config.url || "");
    newBtn.setAttribute("data-target", config.target || "");
    newBtn.setAttribute("data-icon-lock", config.iconLock ? "true" : "false");

    // Drag & drop
    newBtn.draggable = true;
    newBtn.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", newBtn.id);
        setTimeout(() => newBtn.style.display = "none", 0);
    };
    newBtn.ondragend = () => {
        newBtn.style.display = "block";
    };

    // Click logic
    newBtn._applyClick = () => {
        newBtn.onclick = () => {
            const cfg = JSON.parse(newBtn.getAttribute("config") || "{}");
            if (cfg.url && cfg.target) {
                loadFormData(cfg.url, document.getElementById(cfg.target));
            } else {
                alert("Link is incomplete.");
            }
        };
    };
    newBtn._applyClick();

    // Icon
    setLockIcon(newBtn);

    // Replace old element in DOM
    element.replaceWith(newBtn);
}

