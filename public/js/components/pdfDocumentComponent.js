/*!
 * PDF document component for dataset driven document generation.
 *
 * Provides a drag and drop experience for composing HTML templates
 * bound to dataset fields and exporting the rendered output as PDF.
 */

let pdfDocumentLibrariesPromise = null;
let pdfDocumentDraggedTag = null;

function parseJsonSafe(value, fallback = null) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Impossible de parser le JSON pour le composant PDF", error);
    return fallback;
  }
}

function normalizeFieldDescriptor(field) {
  if (!field) {
    return null;
  }

  const name = field.name || field.fieldName || field.columnName || field.id;
  if (!name) {
    return null;
  }

  const label = field.label || field.fieldLabel || field.title || name;
  const type = field.type || field.fieldType || field.dataType || "";
  const typeLower = typeof type === "string" ? type.toLowerCase() : "";
  const dbName = field.DBName || field.dbName || field.database || "";
  const tableName = field.tableName || field.table || field.table_name || "";

  const sampleCandidates = [
    field.sampleValue,
    field.previewValue,
    field.preview,
    field.defaultValue,
    field.default,
    field.fieldDefaultValue,
    field.value,
    field.fieldValue,
  ];

  let sampleValue = "";
  for (const candidate of sampleCandidates) {
    if (candidate === undefined || candidate === null) {
      continue;
    }
    if (Array.isArray(candidate)) {
      if (candidate.length === 0) {
        continue;
      }
      sampleValue = candidate.join(", ");
      break;
    }
    const candidateString = String(candidate);
    if (candidateString.trim() === "") {
      continue;
    }
    sampleValue = candidateString;
    break;
  }

  return {
    ...field,
    name,
    label,
    type,
    typeLower,
    DBName: dbName,
    tableName,
    sampleValue,
    hidden: typeLower === "rowid" || typeLower === "hidden",
  };
}

function extractFieldsFromDataset(dataset) {
  if (!Array.isArray(dataset)) {
    return [];
  }
  return dataset.map((field) => normalizeFieldDescriptor(field)).filter(Boolean);
}

function isPdfFieldVisible(field) {
  if (!field) {
    return false;
  }
  const type = field.typeLower || (typeof field.type === "string" ? field.type.toLowerCase() : "");
  return type !== "rowid" && type !== "hidden";
}

function buildFieldValueMap(fields) {
  const map = {};
  if (!Array.isArray(fields)) {
    return map;
  }

  fields.forEach((field) => {
    if (!field || !field.name) {
      return;
    }

    let value = field.sampleValue;
    if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
      const candidates = [
        field.previewValue,
        field.defaultValue,
        field.default,
        field.fieldDefaultValue,
        field.value,
        field.fieldValue,
      ];
      for (const candidate of candidates) {
        if (candidate === undefined || candidate === null) {
          continue;
        }
        value = Array.isArray(candidate) ? candidate.join(", ") : String(candidate);
        if (value.trim() !== "") {
          break;
        }
        value = undefined;
      }
    }

    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      map[field.name] = value.join(", ");
      return;
    }

    const stringValue = String(value);
    if (stringValue.trim() === "") {
      return;
    }

    map[field.name] = stringValue;
  });

  return map;
}

function populatePreviewValues(container, fields) {
  if (!container) {
    return;
  }

  const valueMap = buildFieldValueMap(fields);
  const tags = container.querySelectorAll("span[data-field]");

  tags.forEach((tag) => {
    const fieldName = tag.getAttribute("data-field");
    const fallback = tag.getAttribute("data-label") || tag.dataset.label || tag.textContent || fieldName || "";
    const value = valueMap[fieldName];

    tag.classList.remove("pdf-template-value-populated", "pdf-template-value-missing");

    if (value !== undefined) {
      tag.textContent = value;
      tag.classList.add("pdf-template-value-populated");
    } else {
      tag.textContent = fallback || fieldName || "";
      tag.classList.add("pdf-template-value-missing");
    }
  });
}

function getDatasetFieldsFromAttributes(element) {
  const datasetAttribute = element.getAttribute("dataSet") || element.getAttribute("dataset");
  const dataset = parseJsonSafe(datasetAttribute, []);
  return extractFieldsFromDataset(dataset);
}

function getPdfDocumentFieldsForPreview(element) {
  const structureAttribute = element.getAttribute("data-structure");
  const structure = decodePdfDocumentStructure(structureAttribute);
  if (Array.isArray(structure) && structure.length) {
    return structure;
  }
  return getDatasetFieldsFromAttributes(element);
}

function createPdfDocumentComponent(type) {
  const main = document.createElement("div");
  main.id = `${type}${Date.now()}`;
  main.setAttribute("tagName", type);
  initializePdfDocumentElement(main);
  updatePdfDocumentPreview(main, "");
  return main;
}

function editPdfDocumentComponent(type, element, content) {
  initializePdfDocumentElement(element);

  const savedTemplate = decodePdfDocumentTemplate(element.getAttribute("data-template"));
  const savedStructure = decodePdfDocumentStructure(element.getAttribute("data-structure"));
  const savedFileName = element.getAttribute("data-pdf-filename") || "document.pdf";

  content.innerHTML = "";
  content.classList.add("pdf-document-properties");

  const title = document.createElement("h3");
  title.textContent = "Document PDF";
  content.appendChild(title);

  const datasetSectionTitle = document.createElement("label");
  datasetSectionTitle.textContent = "Dataset";
  content.appendChild(datasetSectionTitle);

  const datasetEditorContainer = document.createElement("div");
  datasetEditorContainer.className = "pdf-dataset-editor";
  content.appendChild(datasetEditorContainer);

  if (typeof editElementDataSet === "function") {
    editElementDataSet(type, element, datasetEditorContainer);
  }

  const datasetStructureLabel = document.createElement("label");
  datasetStructureLabel.textContent = "Structure du dataset";
  content.appendChild(datasetStructureLabel);

  const datasetStructureContainer = document.createElement("div");
  datasetStructureContainer.className = "pdf-dataset-structure";
  content.appendChild(datasetStructureContainer);

  const paletteLabel = document.createElement("label");
  paletteLabel.textContent = "Champs disponibles";
  content.appendChild(paletteLabel);

  const fieldPalette = document.createElement("div");
  fieldPalette.className = "pdf-field-palette";
  content.appendChild(fieldPalette);

  const editorLabel = document.createElement("label");
  editorLabel.textContent = "Template HTML";
  content.appendChild(editorLabel);

  const templateEditor = document.createElement("div");
  templateEditor.className = "pdf-template-editor";
  templateEditor.contentEditable = "true";
  templateEditor.spellcheck = false;
  content.appendChild(templateEditor);

  const editorHelper = document.createElement("p");
  editorHelper.className = "pdf-editor-helper";
  editorHelper.textContent =
    "Glissez les champs dans le template ou cliquez pour les insérer. Les balises sont repositionnables.";
  content.appendChild(editorHelper);

  const livePreviewLabel = document.createElement("label");
  livePreviewLabel.textContent = "Aperçu";
  content.appendChild(livePreviewLabel);

  const livePreview = document.createElement("div");
  livePreview.className = "pdf-template-preview pdf-document-preview";
  content.appendChild(livePreview);

  const fileNameWrapper = document.createElement("div");
  fileNameWrapper.className = "pdf-editor-row";
  const fileNameLabel = document.createElement("label");
  fileNameLabel.textContent = "Nom du fichier";
  fileNameLabel.setAttribute("for", "pdfFileNameInput");
  fileNameWrapper.appendChild(fileNameLabel);

  const fileNameInput = document.createElement("input");
  fileNameInput.id = "pdfFileNameInput";
  fileNameInput.type = "text";
  fileNameInput.className = "pdf-editor-input";
  fileNameInput.value = savedFileName;
  fileNameWrapper.appendChild(fileNameInput);
  content.appendChild(fileNameWrapper);

  const actionsWrapper = document.createElement("div");
  actionsWrapper.className = "pdf-editor-actions";
  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Enregistrer";
  const resetButton = document.createElement("button");
  resetButton.type = "button";
  resetButton.className = "secondary";
  resetButton.textContent = "Réinitialiser";
  actionsWrapper.appendChild(saveButton);
  actionsWrapper.appendChild(resetButton);
  content.appendChild(actionsWrapper);

  let currentFields = [];
  let currentRange = null;

  function renderDatasetStructure(fields) {
    datasetStructureContainer.innerHTML = "";

    if (!fields || !fields.length) {
      const empty = document.createElement("div");
      empty.className = "pdf-dataset-structure-empty";
      empty.textContent = "Aucun dataset sélectionné.";
      datasetStructureContainer.appendChild(empty);
      return;
    }

    const grouped = fields.reduce((accumulator, field) => {
      const keyParts = [];
      if (field.DBName) {
        keyParts.push(field.DBName);
      }
      if (field.tableName) {
        keyParts.push(field.tableName);
      }
      const key = keyParts.length ? keyParts.join(" / ") : "Dataset";
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(field);
      return accumulator;
    }, {});

    const groupEntries = Object.entries(grouped).sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { sensitivity: "base" })
    );

    groupEntries.forEach(([groupKey, groupFields]) => {
      const group = document.createElement("div");
      group.className = "pdf-dataset-structure-group";

      const title = document.createElement("div");
      title.className = "pdf-dataset-structure-group-title";
      title.textContent = groupKey;
      group.appendChild(title);

      const table = document.createElement("div");
      table.className = "pdf-dataset-structure-table";

      const headerRow = document.createElement("div");
      headerRow.className = "pdf-dataset-structure-row pdf-dataset-structure-row--header";
      ["Libellé", "Champ", "Type", "Valeur d'exemple"].forEach((columnLabel) => {
        const cell = document.createElement("div");
        cell.className = "pdf-dataset-structure-cell";
        cell.textContent = columnLabel;
        headerRow.appendChild(cell);
      });
      table.appendChild(headerRow);

      const sortedFields = [...groupFields].sort((a, b) => {
        const labelA = (a.label || a.name || "").toString();
        const labelB = (b.label || b.name || "").toString();
        return labelA.localeCompare(labelB, undefined, { sensitivity: "base" });
      });

      sortedFields.forEach((field) => {
        const row = document.createElement("div");
        row.className = "pdf-dataset-structure-row";
        if (!isPdfFieldVisible(field)) {
          row.classList.add("pdf-dataset-structure-row--hidden");
        }

        const labelCell = document.createElement("div");
        labelCell.className = "pdf-dataset-structure-cell";
        labelCell.textContent = field.label || field.name || "—";
        labelCell.title = labelCell.textContent;
        row.appendChild(labelCell);

        const nameCell = document.createElement("div");
        nameCell.className = "pdf-dataset-structure-cell";
        nameCell.textContent = field.name || "—";
        nameCell.title = nameCell.textContent;
        row.appendChild(nameCell);

        const typeCell = document.createElement("div");
        typeCell.className = "pdf-dataset-structure-cell";
        typeCell.textContent = field.type || "—";
        typeCell.title = typeCell.textContent;
        row.appendChild(typeCell);

        const sampleCell = document.createElement("div");
        sampleCell.className = "pdf-dataset-structure-cell pdf-dataset-structure-cell--sample";
        const sampleText = field.sampleValue && String(field.sampleValue).trim() !== "" ? field.sampleValue : "—";
        sampleCell.textContent = sampleText;
        sampleCell.title = sampleText;
        row.appendChild(sampleCell);

        table.appendChild(row);
      });

      group.appendChild(table);
      datasetStructureContainer.appendChild(group);
    });
  }

  function buildDefaultTemplate(fields) {
    if (!fields || !fields.length) {
      return "<div class=\"pdf-template-placeholder\">Aucun champ disponible.</div>";
    }
    const visibleFields = fields.filter((field) => isPdfFieldVisible(field));
    if (!visibleFields.length) {
      return "<div class=\"pdf-template-placeholder\">Aucun champ disponible.</div>";
    }
    const wrapper = document.createElement("div");
    wrapper.className = "pdf-template-grid";
    visibleFields.forEach((field) => {
      const row = document.createElement("div");
      row.className = "pdf-template-row";
      row.innerHTML = `
        <div class=\"pdf-template-label\">${escapeHtml(field.label)}</div>
        <div class=\"pdf-template-value\"><span class=\"pdf-template-tag\" data-field="${escapeHtml(
          field.name
        )}\" data-label=\"${escapeHtml(field.label)}\" contenteditable=\"false\">${escapeHtml(field.label)}</span></div>
      `;
      wrapper.appendChild(row);
    });
    return wrapper.innerHTML;
  }

  function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
  }

  function insertTag(fieldName, fieldLabel, clientX, clientY) {
    if (!fieldName) {
      return;
    }
    const safeName = escapeHtml(fieldName);
    const safeLabel = escapeHtml(fieldLabel || fieldName);
    const html = `<span class=\"pdf-template-tag\" data-field="${safeName}" data-label="${safeLabel}" contenteditable=\"false\">${safeLabel}</span>&nbsp;`;
    templateEditor.focus();
    const selection = window.getSelection();
    let range = null;
    if (typeof clientX === "number" && typeof clientY === "number") {
      range = getRangeFromPoint(clientX, clientY);
    }
    if (!range && currentRange) {
      range = currentRange.cloneRange();
    }
    if (!range && selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    }
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(templateEditor);
      range.collapse(false);
    }
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("insertHTML", false, html);
    prepareEditorTags();
    updateLivePreview();
  }

  function getRangeFromPoint(x, y) {
    if (document.caretRangeFromPoint) {
      return document.caretRangeFromPoint(x, y);
    }
    if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y);
      if (pos && pos.offsetNode) {
        const range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
        return range;
      }
    }
    return null;
  }

  function prepareEditorTags() {
    const tags = templateEditor.querySelectorAll("span[data-field]");
    tags.forEach((tag) => {
      tag.classList.add("pdf-template-tag");
      tag.setAttribute("contenteditable", "false");
      tag.setAttribute("draggable", "true");
      if (!tag.getAttribute("data-label")) {
        tag.setAttribute("data-label", tag.textContent || tag.getAttribute("data-field") || "");
      }
      if (!tag.dataset.pdfTagBound) {
        tag.addEventListener("dragstart", (event) => {
          pdfDocumentDraggedTag = tag;
          event.dataTransfer.setData("application/x-existing-tag", tag.dataset.field || "");
          event.dataTransfer.effectAllowed = "move";
        });
        tag.dataset.pdfTagBound = "true";
      }
    });
  }

  function preparePreviewTags(container) {
    const tags = container.querySelectorAll("span[data-field]");
    tags.forEach((tag) => {
      tag.classList.add("pdf-template-tag");
      tag.removeAttribute("contenteditable");
      tag.removeAttribute("draggable");
      if (!tag.getAttribute("data-label")) {
        tag.setAttribute("data-label", tag.textContent || tag.getAttribute("data-field") || "");
      }
      delete tag.dataset.pdfTagBound;
    });
  }

  function updateLivePreview() {
    const html = getCleanTemplateHtml();
    if (html) {
      livePreview.innerHTML = html;
      preparePreviewTags(livePreview);
      populatePreviewValues(livePreview, currentFields);
    } else {
      livePreview.innerHTML =
        "<div class=\"pdf-document-placeholder\">Ajoutez des balises pour générer un aperçu.</div>";
    }
  }

  function getCleanTemplateHtml() {
    const clone = templateEditor.cloneNode(true);
    const nestedEditable = clone.querySelectorAll("[contenteditable]");
    nestedEditable.forEach((node) => node.removeAttribute("contenteditable"));
    const draggable = clone.querySelectorAll("[draggable]");
    draggable.forEach((node) => node.removeAttribute("draggable"));
    const datasets = clone.querySelectorAll("span[data-field]");
    datasets.forEach((node) => node.classList.add("pdf-template-tag"));
    return clone.innerHTML.trim();
  }

  function renderFieldPalette(fields) {
    fieldPalette.innerHTML = "";
    const visibleFields = (fields || []).filter((field) => isPdfFieldVisible(field));
    if (!visibleFields.length) {
      const empty = document.createElement("div");
      empty.className = "pdf-field-empty";
      empty.textContent = "Aucun champ disponible.";
      fieldPalette.appendChild(empty);
      return;
    }
    visibleFields.forEach((field) => {
      const chip = document.createElement("span");
      chip.className = "pdf-field-chip";
      chip.textContent = field.label;
      chip.title = field.name;
      chip.draggable = true;
      chip.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/x-field-name", field.name);
        event.dataTransfer.setData("text/x-field-label", field.label);
        event.dataTransfer.setData("text/plain", field.name);
        event.dataTransfer.effectAllowed = "copy";
      });
      chip.addEventListener("click", () => {
        insertTag(field.name, field.label);
      });
      fieldPalette.appendChild(chip);
    });
  }

  function refreshFields() {
    const datasetFields = getDatasetFieldsFromAttributes(element);
    if (datasetFields && datasetFields.length) {
      currentFields = datasetFields.map((field) => ({ ...field }));
    } else if (savedStructure && savedStructure.length) {
      currentFields = savedStructure.map((field) => ({ ...field }));
    } else {
      currentFields = [];
    }
    renderFieldPalette(currentFields);
    renderDatasetStructure(currentFields);
  }

  function saveChanges() {
    const cleanHtml = getCleanTemplateHtml();
    element.setAttribute("data-dataset-id", "");
    element.setAttribute("data-template", encodeURIComponent(cleanHtml));
    element.setAttribute("data-pdf-filename", fileNameInput.value.trim() || "document.pdf");
    element.setAttribute("data-structure", encodeURIComponent(JSON.stringify(currentFields || [])));
    updatePdfDocumentPreview(element, cleanHtml);
    if (typeof showToast === "function") {
      showToast("Composant PDF mis à jour", 3000);
    }
  }

  function bindDatasetUpdateEvents() {
    const buttons = Array.from(datasetEditorContainer.querySelectorAll("button"));
    const updateButton = buttons.find((btn) => btn.textContent && btn.textContent.trim().toLowerCase() === "update");
    if (updateButton) {
      updateButton.addEventListener("click", () => {
        setTimeout(() => {
          refreshFields();
          if (!templateEditor.innerHTML.trim() && currentFields.length) {
            templateEditor.innerHTML = buildDefaultTemplate(currentFields);
            prepareEditorTags();
          }
          updateLivePreview();
        }, 0);
      });
    }
  }

  function observeDatasetChanges() {
    if (typeof MutationObserver !== "function") {
      return;
    }

    let lastSignature = element.getAttribute("dataSet") || element.getAttribute("dataset") || "";

    const observer = new MutationObserver((mutations) => {
      const datasetChanged = mutations.some(
        (mutation) =>
          mutation.type === "attributes" &&
          (mutation.attributeName === "dataset" || mutation.attributeName === "dataSet")
      );

      if (!datasetChanged) {
        return;
      }

      const currentSignature = element.getAttribute("dataSet") || element.getAttribute("dataset") || "";
      if (currentSignature === lastSignature) {
        return;
      }

      lastSignature = currentSignature;

      refreshFields();
      if (!templateEditor.innerHTML.trim() && currentFields.length) {
        templateEditor.innerHTML = buildDefaultTemplate(currentFields);
        prepareEditorTags();
      } else {
        prepareEditorTags();
      }
      updateLivePreview();
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ["dataset", "dataSet"],
    });

    const disconnectObserver = () => observer.disconnect();
    content.addEventListener("DOMNodeRemoved", disconnectObserver, { once: true });
    content.addEventListener("DOMNodeRemovedFromDocument", disconnectObserver, { once: true });
  }

  templateEditor.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    templateEditor.classList.add("drag-over");
  });

  templateEditor.addEventListener("dragleave", () => {
    templateEditor.classList.remove("drag-over");
  });

  templateEditor.addEventListener("drop", (event) => {
    event.preventDefault();
    templateEditor.classList.remove("drag-over");
    const moveExisting = event.dataTransfer.getData("application/x-existing-tag");
    if (moveExisting && pdfDocumentDraggedTag) {
      const html = pdfDocumentDraggedTag.outerHTML;
      insertTag(pdfDocumentDraggedTag.dataset.field, pdfDocumentDraggedTag.textContent, event.clientX, event.clientY);
      if (pdfDocumentDraggedTag.parentNode) {
        pdfDocumentDraggedTag.parentNode.removeChild(pdfDocumentDraggedTag);
      }
      pdfDocumentDraggedTag = null;
      return;
    }
    const fieldName = event.dataTransfer.getData("text/x-field-name");
    const fieldLabel = event.dataTransfer.getData("text/x-field-label") || fieldName;
    if (fieldName) {
      insertTag(fieldName, fieldLabel, event.clientX, event.clientY);
    }
  });

  templateEditor.addEventListener("keyup", () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      currentRange = selection.getRangeAt(0).cloneRange();
    }
    prepareEditorTags();
    updateLivePreview();
  });

  templateEditor.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      currentRange = selection.getRangeAt(0).cloneRange();
    }
  });

  templateEditor.addEventListener("paste", (event) => {
    event.preventDefault();
    const text = (event.clipboardData || window.clipboardData).getData("text");
    document.execCommand("insertText", false, text);
  });

  templateEditor.addEventListener("focus", () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      currentRange = selection.getRangeAt(0).cloneRange();
    }
  });

  saveButton.addEventListener("click", () => {
    saveChanges();
  });

  resetButton.addEventListener("click", () => {
    templateEditor.innerHTML = buildDefaultTemplate(currentFields);
    prepareEditorTags();
    updateLivePreview();
  });

  if (savedTemplate) {
    templateEditor.innerHTML = savedTemplate;
  } else if (savedStructure && savedStructure.length) {
    templateEditor.innerHTML = buildDefaultTemplate(savedStructure);
  } else {
    templateEditor.innerHTML = "";
  }

  refreshFields();
  if (!templateEditor.innerHTML.trim() && currentFields.length) {
    templateEditor.innerHTML = buildDefaultTemplate(currentFields);
  }
  prepareEditorTags();
  updateLivePreview();
  bindDatasetUpdateEvents();
  observeDatasetChanges();
}

function renderPdfDocument(element) {
  initializePdfDocumentElement(element);
  const template = decodePdfDocumentTemplate(element.getAttribute("data-template"));
  updatePdfDocumentPreview(element, template);
}

function initializePdfDocumentElement(element) {
  element.classList.add("pdf-document-component");
  let toolbar = element.querySelector(".pdf-document-toolbar");
  if (!toolbar) {
    toolbar = document.createElement("div");
    toolbar.className = "pdf-document-toolbar";
    const title = document.createElement("span");
    title.className = "pdf-document-title";
    title.textContent = "Document PDF";
    toolbar.appendChild(title);
    const download = document.createElement("button");
    download.type = "button";
    download.className = "pdf-document-download";
    download.textContent = "Télécharger le PDF";
    toolbar.appendChild(download);
    element.insertBefore(toolbar, element.firstChild);
  }

  let preview = element.querySelector(".pdf-document-preview");
  if (!preview) {
    preview = document.createElement("div");
    preview.className = "pdf-document-preview";
    element.appendChild(preview);
  }

  bindPdfDocumentDownload(element);
}

function updatePdfDocumentPreview(element, html) {
  initializePdfDocumentElement(element);
  const preview = element.querySelector(".pdf-document-preview");
  if (!preview) {
    return;
  }
  if (html && html.trim()) {
    preview.innerHTML = html;
    const tags = preview.querySelectorAll("span[data-field]");
    tags.forEach((tag) => {
      tag.classList.add("pdf-template-tag");
      tag.removeAttribute("contenteditable");
      tag.removeAttribute("draggable");
      if (!tag.getAttribute("data-label")) {
        tag.setAttribute("data-label", tag.textContent || tag.getAttribute("data-field") || "");
      }
    });
    const previewFields = getPdfDocumentFieldsForPreview(element);
    populatePreviewValues(preview, previewFields);
  } else {
    preview.innerHTML =
      '<div class="pdf-document-placeholder">Configurez un dataset et composez votre document.</div>';
  }
}

function decodePdfDocumentTemplate(value) {
  if (!value) {
    return "";
  }
  try {
    return decodeURIComponent(value);
  } catch (error) {
    console.warn("Impossible de décoder le template PDF", error);
    return value;
  }
}

function decodePdfDocumentStructure(value) {
  if (!value) {
    return [];
  }

  let decodedValue = value;
  if (typeof value === "string") {
    try {
      decodedValue = decodeURIComponent(value);
    } catch (error) {
      console.warn("Impossible de décoder la structure du PDF", error);
      decodedValue = value;
    }
  }

  const parsed = parseJsonSafe(decodedValue, []);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map((field) => normalizeFieldDescriptor(field)).filter(Boolean);
}

function bindPdfDocumentDownload(element) {
  const button = element.querySelector(".pdf-document-download");
  if (!button || button.dataset.bound === "true") {
    return;
  }
  button.dataset.bound = "true";
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    await exportPdfDocument(element);
  });
}

async function exportPdfDocument(element) {
  const preview = element.querySelector(".pdf-document-preview");
  if (!preview) {
    return;
  }
  await ensurePdfDocumentLibraries();
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF || !window.html2canvas) {
    console.warn("Librairies PDF manquantes");
    if (typeof showToast === "function") {
      showToast("Impossible de générer le PDF", 4000);
    }
    return;
  }

  const clone = preview.cloneNode(true);
  clone.classList.add("pdf-document-export");
  document.body.appendChild(clone);
  const canvas = await window.html2canvas(clone, { scale: 2 });
  document.body.removeChild(clone);

  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pdfWidth, pdfHeight);
  const fileName = element.getAttribute("data-pdf-filename") || "document.pdf";
  pdf.save(fileName);
}

function ensurePdfDocumentLibraries() {
  if (window.jspdf && window.html2canvas) {
    return Promise.resolve();
  }
  if (pdfDocumentLibrariesPromise) {
    return pdfDocumentLibrariesPromise;
  }
  pdfDocumentLibrariesPromise = new Promise((resolve, reject) => {
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js")
      .then(() =>
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
      )
      .then(resolve)
      .catch((error) => {
        console.error("Erreur lors du chargement des librairies PDF", error);
        reject(error);
      });
  });
  return pdfDocumentLibrariesPromise;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Impossible de charger ${src}`));
    document.body.appendChild(script);
  });
}
