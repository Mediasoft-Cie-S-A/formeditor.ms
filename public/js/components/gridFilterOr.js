/*
 * Copyright (c) 2024 Mediasoft & Cie S.A.
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

/**
 * Data storage
 * - placeholder: plain string displayed inside the search input.
 * - data-grid-target: ID of the grid component to filter.
 * - filter-value: last value applied to the filter input.
 * - data-original-json-data: cached JSON string containing the unfiltered rows.
 */

function createGridFilterOr(type) {
  const main = document.createElement("div");
  main.className = "grid-filter-or";
  main.id = type + Date.now();
  main.tagName = type;
  main.draggable = true;
  main.setAttribute("placeholder", "Filtrer la grille...");
  renderGridFilterOr(main);
  return main;
}

function editGridFilterOr(type, element, content) {
  const button = document.createElement("button");
  button.textContent = "update";
  button.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.getAttribute("data-element-id");
    if (!gridID) return;
    const main = document.getElementById(gridID);
    updateGridFilterOr(main, content);
  };
  content.appendChild(button);

  const placeholder = element.getAttribute("placeholder") || "";
  content.appendChild(
    createInputItem(
      "grid-filter-or-placeholder",
      "Placeholder",
      "placeholder",
      placeholder,
      "text",
      "placeholder"
    )
  );

  const wrapper = document.createElement("div");
  wrapper.className = "input-wrapper";
  const label = document.createElement("label");
  label.textContent = "Grid target";
  label.style.fontSize = "9px";
  label.style.height = "20px";
  const select = document.createElement("select");
  select.id = "grid-filter-or-target";
  select.className = "input-element";

  const grids = document.querySelectorAll(
    "[tagname='dataGridWeb'], [tagname='dataGrid']"
  );
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Auto (first grid)";
  select.appendChild(emptyOption);

  grids.forEach((grid) => {
    const option = document.createElement("option");
    option.value = grid.id;
    option.textContent = grid.id;
    select.appendChild(option);
  });

  const currentTarget = element.getAttribute("data-grid-target") || "";
  select.value = currentTarget;

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  content.appendChild(wrapper);
}

function updateGridFilterOr(main, content) {
  if (!main) return;
  const placeholderInput = content.querySelector("#grid-filter-or-placeholder");
  if (placeholderInput) {
    main.setAttribute("placeholder", placeholderInput.value || "");
  }

  const targetSelect = content.querySelector("#grid-filter-or-target");
  if (targetSelect) {
    if (targetSelect.value) {
      main.setAttribute("data-grid-target", targetSelect.value);
    } else {
      main.removeAttribute("data-grid-target");
    }
  }

  renderGridFilterOr(main);
}

function renderGridFilterOr(main) {
  if (!main) return;
  main.innerHTML = "";
  main.classList.add("grid-filter-or");

  const wrapper = document.createElement("div");
  wrapper.className = "grid-filter-or__wrapper";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "input-element grid-filter-or__input";
  input.placeholder = main.getAttribute("placeholder") || "";
  input.value = main.getAttribute("filter-value") || "";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "grid-filter-or__clear";
  clearButton.innerHTML = "&times;";
  clearButton.title = "Effacer le filtre";

  const status = document.createElement("div");
  status.className = "grid-filter-or__status";
  status.textContent = "";

  const helper = document.createElement("div");
  helper.className = "grid-filter-or__hint";
  helper.textContent = buildGridFilterOrHelper(main);

  input.addEventListener("input", function () {
    main.setAttribute("filter-value", this.value);
    applyGridFilterOr(main, this.value);
    toggleClearButton(clearButton, this.value);
  });

  clearButton.addEventListener("click", function () {
    input.value = "";
    main.setAttribute("filter-value", "");
    applyGridFilterOr(main, "");
    toggleClearButton(clearButton, "");
  });

  wrapper.appendChild(input);
  wrapper.appendChild(clearButton);
  main.appendChild(wrapper);
  main.appendChild(status);
  main.appendChild(helper);

  toggleClearButton(clearButton, input.value);
  applyGridFilterOr(main, input.value);
}

function toggleClearButton(button, value) {
  if (!button) return;
  button.style.visibility = value ? "visible" : "hidden";
}

function buildGridFilterOrHelper(main) {
  const target = main.getAttribute("data-grid-target");
  if (target) {
    return `Grille ciblée : ${target}`;
  }
  return "Aucune grille sélectionnée (première grille trouvée utilisée).";
}

function applyGridFilterOr(main, query) {
  if (!main) return;
  const targetGrid = resolveGridForFilter(main);
  const status = main.querySelector(".grid-filter-or__status");
  const helper = main.querySelector(".grid-filter-or__hint");
  if (helper) {
    helper.textContent = buildGridFilterOrHelper(main);
  }
  if (!targetGrid) {
    if (status) status.textContent = "Grille introuvable.";
    return;
  }

  const tableGrid = targetGrid.querySelector("[dataset-api-table-name]") ||
    targetGrid.querySelector("[tagname='dataTable']") ||
    targetGrid;

  const datasetFieldsAttr =
    tableGrid.getAttribute("dataset-fields-names") ||
    tableGrid.getAttribute("Dataset-Fields-Names") ||
    tableGrid.getAttribute("datasetFields") ||
    tableGrid.getAttribute("dataset-fields");

  const datasetFields = datasetFieldsAttr
    ? datasetFieldsAttr.split(",").map((field) => field.trim()).filter(Boolean)
    : [];

  const jsonDataRaw = tableGrid.getAttribute("jsonData") || "[]";

  if (!query) {
    main.setAttribute("data-original-json-data", jsonDataRaw);
  }

  const originalDataRaw =
    main.getAttribute("data-original-json-data") || jsonDataRaw;

  let originalData;
  try {
    originalData = JSON.parse(originalDataRaw);
  } catch (error) {
    console.error("Invalid JSON data on grid:", error);
    originalData = [];
  }

  const normalizedQuery = query ? query.toString().trim().toLowerCase() : "";
  let filteredData = originalData;

  if (normalizedQuery) {
    filteredData = originalData.filter((record) =>
      recordMatchesQuery(record, normalizedQuery)
    );
  }

  renderFilteredGridData(tableGrid, filteredData, datasetFields);

  if (status) {
    const total = originalData.length;
    const current = filteredData.length;
    if (!total) {
      status.textContent = "Aucune donnée disponible.";
    } else if (normalizedQuery) {
      status.textContent = `${current} / ${total} éléments correspondent.`;
    } else {
      status.textContent = `${total} éléments affichés.`;
    }
  }
}

function resolveGridForFilter(main) {
  const explicitTarget = main.getAttribute("data-grid-target");
  if (explicitTarget) {
    const direct = document.getElementById(explicitTarget);
    if (direct) {
      return direct;
    }
  }
  const fallback = document.querySelector("[tagname='dataGridWeb']") ||
    document.querySelector("[tagname='dataGrid']");
  if (fallback && !explicitTarget) {
    main.setAttribute("data-grid-target", fallback.id);
  }
  return fallback;
}

function recordMatchesQuery(record, query) {
  if (!record || typeof record !== "object") return false;
  return Object.keys(record).some((key) => {
    const value = record[key];
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value).toLowerCase().includes(query);
      } catch (error) {
        return false;
      }
    }
    return value.toString().toLowerCase().includes(query);
  });
}

function renderFilteredGridData(grid, data, datasetFields) {
  if (!grid) return;
  const body = grid.querySelector(".grid-body");
  if (!body) return;
  body.innerHTML = "";

  const view = (grid.parentElement && grid.parentElement.getAttribute("view-web")) ||
    grid.getAttribute("view-web") ||
    "standard";

  if (!data || data.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "grid-filter-or__empty";
    emptyState.textContent = "Aucun enregistrement trouvé.";
    body.appendChild(emptyState);
    const header = grid.querySelector(".grid-header");
    if (header) {
      header.style.display = view === "panel" ? "none" : "";
    }
    return;
  }

  if (view === "panel") {
    renderFilteredPanelView(grid, data, datasetFields);
  } else {
    renderFilteredGridView(grid, data, datasetFields);
  }
}

function renderFilteredGridView(grid, data, datasetFields) {
  const body = grid.querySelector(".grid-body");
  if (!body) return;
  const header = grid.querySelector(".grid-header");
  if (header) {
    header.style.display = "";
  }

  const fields = datasetFields.length > 0 ? datasetFields : Object.keys(data[0] || {});

  data.forEach((record, index) => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "grid-row";

    const rowIdField = fields[0];
    if (rowIdField && record[rowIdField] !== undefined) {
      rowDiv.setAttribute("rowid", record[rowIdField]);
    }

    let cellIndex = 0;
    fields.forEach((field) => {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      if (cellIndex === 0 && field === "rowid") {
        cell.style.display = "none";
      }
      const value = record[field];
      cell.textContent = value === undefined || value === null ? "" : value;
      rowDiv.appendChild(cell);
      cellIndex++;
    });

    rowDiv.addEventListener("click", function () {
      const allRows = grid.querySelectorAll(".grid-row");
      allRows.forEach((row) => row.classList.remove("grid-row-selected"));
      this.classList.add("grid-row-selected");
      notifyGridSelection(record, index);
    });

    if (index === 0) {
      rowDiv.classList.add("grid-row-selected");
      notifyGridSelection(record, index);
    }

    body.appendChild(rowDiv);
  });
}

function renderFilteredPanelView(grid, data, datasetFields) {
  const body = grid.querySelector(".grid-body");
  if (!body) return;
  const header = grid.querySelector(".grid-header");
  if (header) {
    header.style.display = "none";
  }

  const fields = datasetFields.length > 0 ? datasetFields : Object.keys(data[0] || {});

  data.forEach((record, index) => {
    const panelDiv = document.createElement("div");
    panelDiv.className = "panel";

    fields.forEach((field) => {
      if (field === "rowid") return;
      const fieldRow = document.createElement("div");
      fieldRow.className = "panel-row";

      const label = document.createElement("span");
      label.className = "panel-label";
      label.textContent = `${field}:`;

      const valueSpan = document.createElement("span");
      valueSpan.className = "panel-value";
      const value = record[field];
      valueSpan.textContent = value === undefined || value === null ? "" : value;

      fieldRow.appendChild(label);
      fieldRow.appendChild(valueSpan);
      panelDiv.appendChild(fieldRow);
    });

    panelDiv.addEventListener("click", function () {
      const allPanels = grid.querySelectorAll(".panel");
      allPanels.forEach((panel) => panel.classList.remove("selected-panel"));
      this.classList.add("selected-panel");
      notifyGridSelection(record, index);
    });

    if (index === 0) {
      panelDiv.classList.add("selected-panel");
      notifyGridSelection(record, index);
    }

    body.appendChild(panelDiv);
  });
}

function notifyGridSelection(record, index) {
  if (typeof linkRecordToGridWeb === "function") {
    try {
      linkRecordToGridWeb(record, index);
    } catch (error) {
      console.warn("Unable to notify dataset selection:", error);
    }
  }
}
