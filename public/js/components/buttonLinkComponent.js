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
    inputLabel.value = config.label || "Open Screen";

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
        saveButtonLink(element, inputURL.value, inputTarget.value, inputLabel.value);
    };

    // Add all inputs to the editor panel
    container.appendChild(labelURL);
    container.appendChild(inputURL);
    container.appendChild(labelLabel);
    container.appendChild(inputLabel);
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

function saveButtonLink(element, url, target, label) {
    const config = {
        url: url,
        target: target,
        iconLock: element.getAttribute("data-icon-lock") === "true",
        label: label
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
    element.className = "btn-link";
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
            } else {
                alert("Link is incomplete.");
            }
        };
    };
    element._applyClick();

    // Icon
    setLockIcon(element);
}

