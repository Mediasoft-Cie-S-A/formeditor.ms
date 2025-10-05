/*
 * Horizontal & Multi-Filter Data Search Component (Unique H version)
 * CSS externalized in dataSearchH.css
 *
 * Author: Mediasoft & Cie S.A. — 2025
 * License: Apache-2.0
 */

/**
 * Data storage
 * - datasearch: JSON array of dataset fields exposed in the search helper.
 * - datafilters: JSON object tracking advanced filter mode and selected items.
 * - data-value* attributes: plain strings applied to options with DB/table/field/type metadata.
 */

// --------------------------
// Public factory + editor (H)
// --------------------------
function createDatabaseSearchH(type) {
    const main = document.createElement("div");
    main.className = "dataSetContainer data-search-horizontal";
    main.id = type + Date.now();
    main.draggable = true;
    main.tagName = type;
    main.setAttribute("datasearch", JSON.stringify([]));
    main.setAttribute("datafilters", JSON.stringify({ mode: "ALL", items: [] }));
    return main;
}

function editDatabaseSearchH(type, element, content) {
    const button = document.createElement("button");
    button.textContent = "Mettre à jour";
    button.onclick = function () {
        const propertiesBar = document.getElementById("propertiesBar");
        const gridID = propertiesBar.querySelector("label").textContent;
        const main = document.getElementById(gridID);
        updateDataSearchH(main, content);
    };
    content.appendChild(button);
    content.appendChild(createMultiSelectItem("Data", "data", "data"));

    if (element.getAttribute("datasearch") != null) {
        const target = content.querySelector("#Data");
        const jsonData = JSON.parse(element.getAttribute("datasearch"));
        jsonData.forEach((fieldJson) => {
            addFieldToPropertiesBar(target, fieldJson);
        });
    }
}

function updateDataSearchH(main, content) {
    const data = content.querySelectorAll('#Data span[name="dataContainer"]');
    const jsonData = [];
    data.forEach((span) => {
        const json = JSON.parse(span.getAttribute("data-field"));
        jsonData.push(json);
    });
    main.setAttribute("datasearch", JSON.stringify(jsonData));
    RenderDataSearchH(main);
}

// --------------------------
// Rendering (H)
// --------------------------
function RenderDataSearchH(main) {
    main.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "ms-search-wrapper";

    const header = document.createElement("div");
    header.className = "ms-search-header";

    const modeToggle = document.createElement("select");
    modeToggle.className = "ms-mode-toggle";
    modeToggle.innerHTML = `<option value="ALL">Correspondre à TOUS (AND)</option>
                           <option value="ANY">Correspondre à AU MOINS UN (OR)</option>`;

    const clearAllBtn = document.createElement("button");
    clearAllBtn.className = "ms-btn clear-all";
    clearAllBtn.type = "button";
    clearAllBtn.textContent = "Effacer tout";

    const applyBtn = document.createElement("button");
    applyBtn.className = "ms-btn apply";
    applyBtn.type = "button";
    applyBtn.textContent = "Appliquer";

    header.appendChild(modeToggle);
    header.appendChild(clearAllBtn);
    header.appendChild(applyBtn);

    const ribbon = document.createElement("div");
    ribbon.className = "ms-search-ribbon";

    const chips = document.createElement("div");
    chips.className = "ms-chips";

    wrapper.appendChild(header);
    wrapper.appendChild(ribbon);
    wrapper.appendChild(chips);
    main.appendChild(wrapper);

    const config = JSON.parse(main.getAttribute("datasearch") || "[]");
    const state = getCurrentFiltersStateH(main);
    modeToggle.value = state.mode || "ALL";

    config.forEach((field) => {
        const block = buildFieldBlockH(field, chips, main);
        ribbon.appendChild(block);
    });

    clearAllBtn.addEventListener("click", () => {
        setCurrentFiltersStateH(main, { mode: modeToggle.value, items: [] });
        renderChipsH(chips, main);
    });

    modeToggle.addEventListener("change", () => {
        const st = getCurrentFiltersStateH(main);
        st.mode = modeToggle.value;
        setCurrentFiltersStateH(main, st);
    });

    applyBtn.addEventListener("click", () => applyFiltersToGridsH(main));


    renderChipsH(chips, main);
    return main;
}

// --------------------------
// Field block (H)
// --------------------------
function buildFieldBlockH(field, chipsContainer, main) {
    const block = document.createElement("div");
    block.className = "ms-field-block";

    const label = document.createElement("label");
    label.textContent = field.fieldLabel || `${field.tableName}.${field.fieldName}`;
    label.className = "ms-field-label";

    const operator = document.createElement("select");
    operator.className = "ms-op";
    const ops = getOperatorsForTypeH(field.fieldType);
    operator.innerHTML = ops.map((o) => `<option value="${o.value}">${o.label}</option>`).join("");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "ms-input";
    input.placeholder = field.fieldLabel || field.fieldName;
    input.setAttribute("data-value-DBName", field.DBName);
    input.setAttribute("data-value-table-name", field.tableName);
    input.setAttribute("data-value-field-name", field.fieldName);
    input.setAttribute("data-value-field-type", field.fieldType);

    const ac = document.createElement("div");
    ac.className = "ms-autocomplete";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "ms-btn add";
    addBtn.textContent = "+";

    const debouncedAC = debounceH((e) => searchAutoCompleteHorizontalH(e, input, ac), 200);
    input.addEventListener("input", (e) => debouncedAC(e));
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const val = input.value.trim();
            if (!val) return;
            addFilterTokenH(main, { field, operator: operator.value, value: val });
            input.value = "";
            renderChipsH(chipsContainer, main);
        } else if (e.key === "Escape") {
            ac.style.display = "none";
        } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            navigateAutocompleteH(ac, e.key === "ArrowDown" ? 1 : -1);
        }
    });

    addBtn.addEventListener("click", () => {
        const val = input.value.trim();
        if (!val) return;
        addFilterTokenH(main, { field, operator: operator.value, value: val });
        input.value = "";
        renderChipsH(chipsContainer, main);
    });

    ac.addEventListener("click", (evt) => {
        const item = evt.target.closest(".ms-ac-item");
        if (!item) return;
        const val = item.getAttribute("data-value");
        addFilterTokenH(main, { field, operator: operator.value, value: val });
        input.value = "";
        ac.style.display = "none";
        renderChipsH(chipsContainer, main);
    });

    block.appendChild(label);
    block.appendChild(operator);
    block.appendChild(input);
    block.appendChild(addBtn);
    block.appendChild(ac);
    return block;
}

// --------------------------
// Chips & state management (H)
// --------------------------
function renderChipsH(container, main) {
    container.innerHTML = "";
    const st = getCurrentFiltersStateH(main);
    if (!st.items || st.items.length === 0) {
        container.innerHTML = '<div class="ms-chips-empty">Aucun filtre appliqué</div>';
        return;
    }

    st.items.forEach((f, idx) => {
        const chip = document.createElement("div");
        chip.className = "ms-chip";
        const label = `${f.field.fieldLabel || f.field.fieldName} ${opSymbolH(f.operator)} ${formatValueForChipH(f.value)}`;
        chip.innerHTML = `<span class=\"ms-chip-text\" title=\"${label}\">${label}</span>`;

        const rm = document.createElement("button");
        rm.type = "button";
        rm.className = "ms-chip-remove";
        rm.innerHTML = "&times;";
        rm.addEventListener("click", () => {
            const newItems = st.items.slice(0, idx).concat(st.items.slice(idx + 1));
            setCurrentFiltersStateH(main, { mode: st.mode, items: newItems });
            renderChipsH(container, main);
        });

        container.appendChild(chip);
        chip.appendChild(rm);
    });
}

function addFilterTokenH(main, token) {
    const st = getCurrentFiltersStateH(main);
    st.items.push(token);
    setCurrentFiltersStateH(main, st);
}

function getCurrentFiltersStateH(main) {
    try {
        return JSON.parse(main.getAttribute("datafilters")) || { mode: "ALL", items: [] };
    } catch (_) {
        return { mode: "ALL", items: [] };
    }
}

function setCurrentFiltersStateH(main, st) {
    main.setAttribute("datafilters", JSON.stringify(st));
}

// --------------------------
// Apply filters (H)
// --------------------------
function applyFiltersToGridsH(main) {
    const st = getCurrentFiltersStateH(main);
    const items = st.items || [];
    const grouped = {};
    items.forEach((t) => {
        const key = makeFieldKeyH(t.field);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(t);
    });

    const grids = document.querySelectorAll("div[tagname='dataGrid']");
    grids.forEach((grid) => {
        if (grid.style.display === "none") return;
        if (items.length === 0) return;

        Object.values(grouped).forEach((tokens) => {
            tokens.forEach((t) => {
                searchGrid(
                    t.field.DBName,
                    t.field.fieldName,
                    t.operator,
                    t.value,
                    grid.id
                );
            });
        });
    });
}

// --------------------------
// Autocomplete (H)
// --------------------------
function searchAutoCompleteHorizontalH(event, input, acPanel) {
    event.preventDefault();
    const DBName = input.getAttribute("data-value-DBName");
    const tableName = input.getAttribute("data-value-table-name");
    const fieldName = input.getAttribute("data-value-field-name");
    const fieldType = input.getAttribute("data-value-field-type");
    const searchValue = (input.value || "").trim();

    const isWhitespaceString = (str) => !str.replace(/\s/g, "").length;
    if (searchValue.length === 0 || isWhitespaceString(searchValue)) {
        acPanel.style.display = "none";
        acPanel.innerHTML = "";
        return;
    }

    let url = `/select-distinct-idvalue/${DBName}/${tableName}/${fieldName}?id=${fieldName}`;
    url += buildFilterSuffixH(fieldName, fieldType, searchValue);

    const cookieStorage = document.querySelectorAll("div[tagname=cookieStorage]");
    cookieStorage.forEach((storage) => {
        const selects = storage.querySelectorAll("select");
        selects.forEach((select) => {
            const fname = select.getAttribute("var_name");
            const fval = select.value;
            url += ` and ${fname}='${fval}'`;
        });
    });

    apiFetch(url)
        .then((r) => r.json())
        .then((data) => {
            acPanel.innerHTML = "";
            const pos = getAbsoluteOffset(input);
            acPanel.style.display = "block";
            acPanel.style.top = pos.top + input.offsetHeight + 4 + "px";
            acPanel.style.left = pos.left + "px";
            acPanel.style.minWidth = input.offsetWidth + "px";

            data.forEach((row) => {
                const val = row[fieldName];
                const item = document.createElement("div");
                item.className = "ms-ac-item";
                item.setAttribute("data-value", val);
                item.textContent = val;
                acPanel.appendChild(item);
            });
        })
        .catch((err) => console.error(err));
}

function navigateAutocompleteH(panel, dir) {
    const items = Array.from(panel.querySelectorAll(".ms-ac-item"));
    if (!items.length) return;
    const idx = items.findIndex((el) => el.classList.contains("active"));
    let next = idx + dir;
    if (next < 0) next = items.length - 1;
    if (next >= items.length) next = 0;
    items.forEach((el) => el.classList.remove("active"));
    items[next].classList.add("active");
    items[next].scrollIntoView({ block: "nearest" });
}

// --------------------------
// Helpers (H)
// --------------------------
function buildFilterSuffixH(fieldName, fieldType, val) {
    switch ((fieldType || "character").toLowerCase()) {
        case "integer":
        case "int":
        case "decimal":
        case "numeric":
            return `&filter=${fieldName}=${val}`;
        case "date":
        case "datetime":
            return `&filter=${fieldName}=${val}`;
        case "logical":
        case "boolean":
            return `&filter=${fieldName}=${val}`;
        default:
            return `&filter=${fieldName} like '%${val}%'`;
    }
}

function getOperatorsForTypeH(t) {
    const type = (t || "character").toLowerCase();
    if (["integer", "int", "decimal", "numeric", "date", "datetime"].includes(type)) {
        return [
            { value: "=", label: "=" },
            { value: "<>", label: "≠" },
            { value: ">", label: ">" },
            { value: "<", label: "<" },
            { value: ">=", label: ">=" },
            { value: "<=", label: "<=" },
        ];
    }
    if (["logical", "boolean"].includes(type)) {
        return [{ value: "=", label: "=" }];
    }
    return [

        { value: "=", label: "=" },
        { value: "<>", label: "≠" },

    ];
}

function opSymbolH(op) {
    switch (op) {
        case "like": return "contient";
        case "starts": return "commence";
        case "ends": return "finit";
        case "<>": return "≠";
        default: return op;
    }
}

function formatValueForChipH(v) {
    if (typeof v === "string" && v.length > 24) return `'${v.slice(0, 24)}…'`;
    if (typeof v === "string") return `'${v}'`;
    return String(v);
}

function makeFieldKeyH(f) {
    return `${f.DBName}::${f.tableName}::${f.fieldName}`;
}

function debounceH(fn, delay) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), delay);
    };
}
