/*!
 * PDF document component for dataset driven document generation.
 *
 * Provides a drag and drop experience for composing HTML templates
 * bound to dataset fields and exporting the rendered output as PDF.
 */

let pdfDocumentLibrariesPromise = null;
let pdfDocumentDraggedTag = null;

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

  const savedDatasetId = element.getAttribute("data-dataset-id") || "";
  const savedTemplate = decodePdfDocumentTemplate(element.getAttribute("data-template"));
  const savedStructure = decodePdfDocumentStructure(element.getAttribute("data-structure"));
  const savedFileName = element.getAttribute("data-pdf-filename") || "document.pdf";

  content.innerHTML = "";
  content.classList.add("pdf-document-properties");

  const title = document.createElement("h3");
  title.textContent = "Document PDF";
  content.appendChild(title);

  const datasetWrapper = document.createElement("div");
  datasetWrapper.className = "pdf-editor-row";

  const datasetLabel = document.createElement("label");
  datasetLabel.textContent = "Dataset source";
  datasetLabel.setAttribute("for", "pdfDatasetSelect");
  datasetWrapper.appendChild(datasetLabel);

  const datasetSelect = document.createElement("select");
  datasetSelect.id = "pdfDatasetSelect";
  datasetSelect.className = "pdf-editor-select";
  datasetSelect.appendChild(createOption("", "Sélectionnez un dataset"));

  const datasetSources = collectPdfDatasetSources();
  datasetSources.forEach((source) => {
    const option = createOption(source.id, source.label);
    datasetSelect.appendChild(option);
  });
  datasetSelect.value = savedDatasetId;
  datasetWrapper.appendChild(datasetSelect);
  content.appendChild(datasetWrapper);

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

  function createOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  function collectPdfDatasetSources() {
    const nodes = document.querySelectorAll("[tagname='dataSet']");
    const sources = [];
    nodes.forEach((node) => {
      if (!node.id) {
        return;
      }
      const structure = decodePdfDocumentStructure(node.getAttribute("data-structure")) || [];
      let dataset = [];
      if (!structure.length) {
        dataset = parseJsonSafe(node.getAttribute("dataset"));
      }
      const fields = structure.length ? structure : extractFieldsFromDataset(dataset);
      const label = buildDatasetLabel(node, dataset, fields);
      sources.push({ id: node.id, label, fields });
    });
    return sources;
  }

  function buildDatasetLabel(node, dataset, fields) {
    const firstField = dataset && dataset.length ? dataset[0] : null;
    const tableName = firstField?.tableName || fields[0]?.tableName || "";
    const dbName = firstField?.DBName || fields[0]?.DBName || "";
    const parts = [];
    if (tableName) parts.push(tableName);
    if (dbName) parts.push(`DB: ${dbName}`);
    const detail = parts.length ? ` (${parts.join(" - ")})` : "";
    return `${node.id}${detail}`;
  }

  function extractFieldsFromDataset(dataset) {
    if (!Array.isArray(dataset)) {
      return [];
    }
    return dataset
      .filter((field) => field && field.fieldName && field.fieldType !== "rowid" && field.fieldType !== "hidden")
      .map((field) => ({
        name: field.fieldName,
        label: field.fieldLabel || field.fieldName,
        type: field.fieldType,
        DBName: field.DBName,
        tableName: field.tableName,
      }));
  }

  function parseJsonSafe(value) {
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn("Impossible de parser le dataset du composant", error);
      return null;
    }
  }

  function buildDefaultTemplate(fields) {
    if (!fields || !fields.length) {
      return "<div class=\"pdf-template-placeholder\">Aucun champ disponible.</div>";
    }
    const wrapper = document.createElement("div");
    wrapper.className = "pdf-template-grid";
    fields.forEach((field) => {
      const row = document.createElement("div");
      row.className = "pdf-template-row";
      row.innerHTML = `
        <div class=\"pdf-template-label\">${escapeHtml(field.label)}</div>
        <div class=\"pdf-template-value\"><span class=\"pdf-template-tag\" data-field="${escapeHtml(
          field.name
        )}\" contenteditable="false">${escapeHtml(field.label)}</span></div>
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
    const html = `<span class=\"pdf-template-tag\" data-field="${escapeHtml(fieldName)}" contenteditable="false">${escapeHtml(
      fieldLabel || fieldName
    )}</span>&nbsp;`;
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
      delete tag.dataset.pdfTagBound;
    });
  }

  function updateLivePreview() {
    const html = getCleanTemplateHtml();
    if (html) {
      livePreview.innerHTML = html;
      preparePreviewTags(livePreview);
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
    if (!fields || !fields.length) {
      const empty = document.createElement("div");
      empty.className = "pdf-field-empty";
      empty.textContent = "Aucun champ disponible.";
      fieldPalette.appendChild(empty);
      return;
    }
    fields.forEach((field) => {
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
    const selected = datasetSelect.value;
    const selectedSource = datasetSources.find((source) => source.id === selected);
    if (selectedSource) {
      currentFields = selectedSource.fields;
    } else if (savedStructure && savedStructure.length) {
      currentFields = savedStructure;
    } else {
      currentFields = [];
    }
    renderFieldPalette(currentFields);
  }

  function saveChanges() {
    const cleanHtml = getCleanTemplateHtml();
    element.setAttribute("data-dataset-id", datasetSelect.value || "");
    element.setAttribute("data-template", encodeURIComponent(cleanHtml));
    element.setAttribute("data-pdf-filename", fileNameInput.value.trim() || "document.pdf");
    element.setAttribute("data-structure", encodeURIComponent(JSON.stringify(currentFields || [])));
    updatePdfDocumentPreview(element, cleanHtml);
    if (typeof showToast === "function") {
      showToast("Composant PDF mis à jour", 3000);
    }
  }

  datasetSelect.addEventListener("change", () => {
    refreshFields();
    if (!templateEditor.innerHTML.trim()) {
      templateEditor.innerHTML = buildDefaultTemplate(currentFields);
      prepareEditorTags();
      updateLivePreview();
    }
  });

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
  prepareEditorTags();
  updateLivePreview();
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
    });
  } else {
    preview.innerHTML =
      '<div class="pdf-document-placeholder">Sélectionnez un dataset et composez votre document.</div>';
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
  try {
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded);
  } catch (error) {
    console.warn("Impossible de décoder la structure du PDF", error);
    return [];
  }
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
