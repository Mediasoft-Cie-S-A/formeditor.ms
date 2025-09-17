/* greetingComponent.js  v2
 * Salue l’utilisateur connecté en fonction du moment de la journée.
 * Drag-and-drop compatible, configuration minimale.
 * --------------------------------------------------------------- */

/**
 * Data storage
 * - config: JSON object storing greeting message content and display options.
 */

/* Utilitaire — adapte cette partie à ton propre backend ------------- */
function getCurrentUser() {
    if (window.currentUser) return normaliseUser(window.currentUser);

    const stored =
        sessionStorage.getItem("currentUser") ||
        localStorage.getItem("currentUser");
    if (stored) {
        try {
            return normaliseUser(JSON.parse(stored));
        } catch (_) {
            /* malformed JSON – ignore */
        }
    }
    return { name: "Anonymous" };
}

function normaliseUser(u = {}) {
    const name = u.name || u.displayName || u.username || "Test";
    return { ...u, name };
}

/* ------------------------------------------------------------------
 * 2. Greeting message helper                                        */
function getGreetingMessage(date = new Date()) {
    const h = date.getHours();
    return h < 12 ? "Bonjour"      // 00 h → 11 h 59
        : h < 18 ? "Bonjour" // 12 h → 17 h 59
            : "Bonsoir";       // 18 h → 23 h 59

}

/* ------------------------------------------------------------------
 * 3. Factory – create component                                     */
function createGreetingComponent(type) {
    const box = document.createElement("div");
    box.setAttribute("tagName", type);
    box.id = `greeting-${Date.now()}`;
    box.className = "greeting-box";

    const config = { showName: true };
    box.setAttribute("config", JSON.stringify(config));

    enableDrag(box);
    renderGreetingComponent(box);
    return box;
}


/* 1. Création ------------------------------------------------------- */
function createGreetingComponent(type) {
    const box = document.createElement("div");
    box.setAttribute("tagName", type);
    box.id = `greeting-${Date.now()}`;
    box.className = "greeting-box";

    // config par défaut : on affiche le nom
    const config = { showName: true };
    box.setAttribute("config", JSON.stringify(config));

    // drag & drop
    box.draggable = true;
    box.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", box.id);
        setTimeout(() => (box.style.display = "none"), 0);
    };
    box.ondragend = () => (box.style.display = "block");

    renderGreetingComponent(box);
    return box;
}

/* 2. Panneau d’édition (juste un switch “Afficher le nom”) ---------- */
function editGreetingComponent(type, element, content) {
    const cfg = JSON.parse(element.getAttribute("config") || "{}");
    const wrap = document.createElement("div");
    wrap.className = "greeting-editor";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.checked = !!cfg.showName;
    const lbl = document.createElement("label");
    lbl.textContent = "Afficher le nom";

    const save = document.createElement("button");
    save.textContent = "Update";
    save.style.width = "100%";
    save.onclick = () => {
        element.setAttribute(
            "config",
            JSON.stringify({ showName: chk.checked })
        );
        renderGreetingComponent(element);
    };

    wrap.append(chk, lbl, save);
    content.appendChild(wrap);
}

/* 3. Rendu ---------------------------------------------------------- */
function renderGreetingComponent(element) {
    const cfg = JSON.parse(element.getAttribute("config") || "{}");
    const user = getCurrentUser();

    let html = `<strong>${getGreetingMessage()}</strong>`;
    if (cfg.showName && user.name) html += ` ${user.name}`;

    element.innerHTML = html;

    // drag & drop (au cas où le nœud serait recréé)
    element.draggable = true;
    element.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", element.id);
        setTimeout(() => (element.style.display = "none"), 0);
    };
    element.ondragend = () => (element.style.display = "block");
}

/* 4. Mise à jour auto quand l’utilisateur change -------------------- */
document.addEventListener("userChanged", () => {
    document
        .querySelectorAll('div[tagName="greeting"]')
        .forEach(renderGreetingComponent);
});
