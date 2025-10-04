/*!
 * PDF document component for dataset driven document generation.
 *
 * Provides a drag and drop experience for composing HTML templates
 * bound to dataset fields and exporting the rendered output as PDF.
 */

let pdfDocumentLibrariesPromise = null;
let pdfDocumentDraggedTag = null;
let pdfDatasetStructureModalControls = null;

function ensurePdfDatasetStructureModal() {
  if (pdfDatasetStructureModalControls) {
    return pdfDatasetStructureModalControls;
  }

  const modal = document.createElement("div");
  modal.id = "pdfDatasetStructureModal";
  modal.className = "pdf-dataset-modal";
  modal.setAttribute("aria-hidden", "true");

  const backdrop = document.createElement("div");
  backdrop.className = "pdf-dataset-modal__backdrop";
  modal.appendChild(backdrop);

  const dialog = document.createElement("div");
  dialog.className = "pdf-dataset-modal__dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "pdfDatasetStructureTitle");
  dialog.setAttribute("tabindex", "-1");

  const header = document.createElement("div");
  header.className = "pdf-dataset-modal__header";

  const title = document.createElement("h2");
  title.className = "pdf-dataset-modal__title";
  title.id = "pdfDatasetStructureTitle";
  title.textContent = "Structure du dataset";
  header.appendChild(title);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "pdf-dataset-modal__close";
  closeButton.setAttribute("aria-label", "Fermer");
  closeButton.textContent = "×";
  header.appendChild(closeButton);

  const body = document.createElement("div");
  body.className = "pdf-dataset-modal__body";

  const container = document.createElement("div");
  container.className = "pdf-dataset-structure";
  body.appendChild(container);

  const sectionsWrapper = document.createElement("div");
  sectionsWrapper.className = "pdf-dataset-modal__sections";

  const createSection = (titleText) => {
    const section = document.createElement("section");
    section.className = "pdf-dataset-modal__section";

    const sectionTitle = document.createElement("h3");
    sectionTitle.className = "pdf-dataset-modal__section-title";
    sectionTitle.textContent = titleText;
    section.appendChild(sectionTitle);

    return section;
  };

  const modalFieldSection = createSection("Champs disponibles");
  const modalFieldPalette = document.createElement("div");
  modalFieldPalette.className = "pdf-field-palette pdf-field-palette--modal";
  modalFieldPalette.setAttribute("aria-live", "polite");
  modalFieldSection.appendChild(modalFieldPalette);
  sectionsWrapper.appendChild(modalFieldSection);

  const modalComponentSection = createSection("Composants");
  const modalComponentPalette = document.createElement("div");
  modalComponentPalette.className =
    "pdf-component-palette pdf-component-palette--modal";
  modalComponentSection.appendChild(modalComponentPalette);
  sectionsWrapper.appendChild(modalComponentSection);

  const modalTemplateSection = createSection("Template HTML");
  const modalTemplatePreview = document.createElement("pre");
  modalTemplatePreview.className = "pdf-dataset-modal__template";
  modalTemplatePreview.setAttribute("aria-live", "polite");
  modalTemplatePreview.setAttribute("tabindex", "0");
  modalTemplateSection.appendChild(modalTemplatePreview);
  sectionsWrapper.appendChild(modalTemplateSection);

  const modalPreviewSection = createSection("Aperçu");
  const modalPreview = document.createElement("div");
  modalPreview.className =
    "pdf-template-preview pdf-document-preview pdf-dataset-modal__preview";
  modalPreviewSection.appendChild(modalPreview);
  sectionsWrapper.appendChild(modalPreviewSection);

  body.appendChild(sectionsWrapper);

  dialog.appendChild(header);
  dialog.appendChild(body);
  modal.appendChild(dialog);

  document.body.appendChild(modal);

  const keydownHandler = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  const close = () => {
    if (!modal.classList.contains("is-open")) {
      return;
    }
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", keydownHandler);
    modal.dispatchEvent(new CustomEvent("pdf-dataset-modal-close"));
  };

  const open = () => {
    if (modal.classList.contains("is-open")) {
      return;
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.addEventListener("keydown", keydownHandler);
    modal.dispatchEvent(new CustomEvent("pdf-dataset-modal-open"));
    requestAnimationFrame(() => dialog.focus());
  };

  closeButton.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  pdfDatasetStructureModalControls = {
    modal,
    container,
    fieldsContainer: modalFieldPalette,
    componentsContainer: modalComponentPalette,
    templateContainer: modalTemplatePreview,
    previewContainer: modalPreview,
    open,
    close,
  };
  return pdfDatasetStructureModalControls;
}

const PDF_TEMPLATE_COMPONENTS = [
  {
    id: "heading",
    label: "Titre",
    description: "Ajoute un titre principal pour structurer le document.",
    html: '<h1 class="pdf-heading">Titre principal</h1>',
  },
  {
    id: "subheading",
    label: "Sous-titre",
    description: "Ajoute un sous-titre ou un bloc de contexte.",
    html: '<h2 class="pdf-subheading">Sous-titre</h2>',
  },
  {
    id: "paragraph",
    label: "Paragraphe",
    description: "Insère un paragraphe de texte éditable.",
    html:
      '<p class="pdf-paragraph">Ajoutez ici le contenu détaillé de votre section. Ce texte peut être remplacé par vos propres informations.</p>',
  },
  {
    id: "columns",
    label: "2 colonnes",
    description: "Crée une mise en page à deux colonnes.",
    html:
      '<div class="pdf-columns"><div class="pdf-column">Contenu colonne 1</div><div class="pdf-column">Contenu colonne 2</div></div>',
  },
  {
    id: "table",
    label: "Tableau",
    description: "Insère un tableau simple pour présenter des données.",
    html:
      '<table class="pdf-table"><thead><tr><th>Colonne 1</th><th>Colonne 2</th><th>Colonne 3</th></tr></thead><tbody><tr><td>Valeur 1</td><td>Valeur 2</td><td>Valeur 3</td></tr></tbody></table>',
  },
  {
    id: "separator",
    label: "Séparateur",
    description: "Ajoute une ligne de séparation pour aérer la mise en page.",
    html: '<hr class="pdf-separator" />',
  },
  {
    id: "signature",
    label: "Signature",
    description: "Insère un bloc de signature avec ligne et libellé.",
    html:
      '<div class="pdf-signature"><div class="pdf-signature-line"></div><div class="pdf-signature-label">Signature</div></div>',
  },
];

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

  // button showModalDbStrc for show the database structure
  const buttonShowDbStrc = document.createElement("button");
  buttonShowDbStrc.style.width = "100%";
  buttonShowDbStrc.textContent = "Show DB";
  buttonShowDbStrc.onclick = function () {
    const propertiesBar = document.getElementById("propertiesBar");
    const gridID = propertiesBar.querySelector("label").textContent;
    const main = document.getElementById(gridID);
    showModalDbStrc(content, type);
  };
  content.appendChild(buttonShowDbStrc);

  content.appendChild(createMultiSelectItem("SQL", "sql", "sql"));
  content.appendChild(createMultiSelectItem("Data", "data", "data"));
  content.appendChild(createMultiSelectItem("Link", "link", "link"));
  content.appendChild(createMultiSelectItem("Exception", "exception", "exception"));
  content.appendChild(createSelectItem("Filter", "filter", "filter", element.getAttribute("filter"), "text", true));


  // load the data
  // check if jsonData is not empty
  if (element.getAttribute("dataSet") != null) {
    var target = content.querySelector("#Data");
    var jsonData = JSON.parse(element.getAttribute("dataSet"));
    jsonData.forEach((fieldJson) => {
      if (fieldJson.fieldType == "search_win") {
        addFieldToPropertiesBar(target, fieldJson);

        // get the select input with name=fieldType
        var selects = content.querySelectorAll("select[name='fieldType']");
        // select the last select
        var select = selects[selects.length - 1];
        console.log("select", select);
        // select search_win in the select
        select.value = "search_win";
        // execute the onchange event of the select
        select.dispatchEvent(new Event('change'));

      }
      if (fieldJson.fieldType !== "rowid")
        addFieldToPropertiesBar(target, fieldJson);
    });

  }

  if (element.getAttribute("datalink") != null) {
    var target = content.querySelector("#Link");
    var jsonData = JSON.parse(element.getAttribute("datalink"));
    jsonData.forEach((fieldJson) => {
      addFieldToPropertiesBar(target, fieldJson);
    });
  }
  // exception
  if (element.getAttribute("exceptionSet") != null) {
    var target = content.querySelector("#Exception");
    var jsonData = JSON.parse(element.getAttribute("exceptionSet"));
    jsonData.forEach((fieldJson) => {
      addFieldToPropertiesBar(target, fieldJson);
    });
  }

  // sql
  if (element.getAttribute("sql") != null) {
    var target = content.querySelector("#SQL");
    var jsonData = JSON.parse(element.getAttribute("sql"));

    // add the db name
    if (jsonData.DBName != null) {
      var dbinput = target.querySelector("[tagname='dbname']");
      dbinput.value = jsonData.DBName;
    }
    // add the select
    if (jsonData.select != null) {
      var select = target.querySelector("[tagname='select']");
      select.value = jsonData.select;
    }
    // add the update
    if (jsonData.update != null) {
      var update = target.querySelector("[tagname='update']");
      update.value = jsonData.update
    }
    // add the insert
    if (jsonData.insert != null) {
      var insert = target.querySelector("[tagname='insert']");
      insert.value = jsonData.insert;
    }
    // add the delete
    if (jsonData.delete != null) {
      var del = target.querySelector("[tagname='delete']");
      del.value = jsonData.delete;

    }
    // add the api
  } // end if sql

  // add input api key 
  content.appendChild(createInputItem("Api Key", "apikey", "apikey", element.getAttribute("apikey"), "text", false));
  // filter
  if (element.getAttribute("filter") != null) {
    var target = content.querySelector("#Filter");
    target.value = element.getAttribute("filter");
  }

  const datasetStructureModal = ensurePdfDatasetStructureModal();
  const datasetStructureContainer = datasetStructureModal.container;
  const datasetStructureFieldsContainer = datasetStructureModal.fieldsContainer;
  const datasetStructureComponentsContainer =
    datasetStructureModal.componentsContainer;
  const datasetStructureTemplateContainer =
    datasetStructureModal.templateContainer;
  const datasetStructurePreviewContainer =
    datasetStructureModal.previewContainer;

  const datasetStructureLauncher = document.createElement("div");
  datasetStructureLauncher.className = "pdf-dataset-structure-launcher";

  const datasetStructureHelper = document.createElement("p");
  datasetStructureHelper.className = "pdf-dataset-structure-helper";
  datasetStructureHelper.textContent =
    "Consultez la structure du dataset et les valeurs d'exemple dans une fenêtre dédiée.";
  datasetStructureLauncher.appendChild(datasetStructureHelper);

  const datasetStructureButton = document.createElement("button");
  datasetStructureButton.type = "button";
  datasetStructureButton.className = "pdf-dataset-structure-button";
  datasetStructureButton.textContent = "Structure du dataset";
  datasetStructureButton.setAttribute("aria-haspopup", "dialog");
  datasetStructureButton.setAttribute("aria-expanded", "false");
  datasetStructureButton.addEventListener("click", () => {
    if (datasetStructureButton.disabled) {
      return;
    }
    renderDatasetStructure(currentFields);
    renderFieldPalette(currentFields);
    renderComponentPalette();
    updateLivePreview();
    datasetStructureModal.open();
  });
  datasetStructureButton.disabled = true;
  datasetStructureButton.setAttribute("aria-disabled", "true");
  datasetStructureButton.title = "Aucun dataset sélectionné";
  datasetStructureLauncher.appendChild(datasetStructureButton);

  content.appendChild(datasetStructureLauncher);

  datasetStructureModal.modal.addEventListener("pdf-dataset-modal-open", () => {
    datasetStructureButton.setAttribute("aria-expanded", "true");
  });

  datasetStructureModal.modal.addEventListener("pdf-dataset-modal-close", () => {
    datasetStructureButton.setAttribute("aria-expanded", "false");
    if (
      !datasetStructureButton.disabled &&
      document.body &&
      document.body.contains(datasetStructureButton)
    ) {
      datasetStructureButton.focus({ preventScroll: true });
    }
  });

  const paletteLabel = document.createElement("label");
  paletteLabel.textContent = "Champs disponibles";
  content.appendChild(paletteLabel);

  const fieldPalette = document.createElement("div");
  fieldPalette.className = "pdf-field-palette";
  content.appendChild(fieldPalette);

  const componentLabel = document.createElement("label");
  componentLabel.textContent = "Composants";
  content.appendChild(componentLabel);

  const componentPalette = document.createElement("div");
  componentPalette.className = "pdf-component-palette";
  content.appendChild(componentPalette);

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
    "Glissez les champs ou les composants pour enrichir le template, ou cliquez pour les insérer. Les balises sont repositionnables.";
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
    const hasFields = Array.isArray(fields) && fields.length > 0;
    if (datasetStructureButton) {
      datasetStructureButton.disabled = !hasFields;
      datasetStructureButton.setAttribute("aria-disabled", hasFields ? "false" : "true");
      datasetStructureButton.title = hasFields
        ? "Afficher la structure du dataset"
        : "Aucun dataset sélectionné";
    }

    if (!datasetStructureContainer) {
      return;
    }

    datasetStructureContainer.innerHTML = "";

    if (!hasFields) {
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
    const updatedSelection = window.getSelection();
    if (updatedSelection && updatedSelection.rangeCount > 0) {
      currentRange = updatedSelection.getRangeAt(0).cloneRange();
    }
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
      if (datasetStructurePreviewContainer) {
        datasetStructurePreviewContainer.innerHTML = html;
        preparePreviewTags(datasetStructurePreviewContainer);
        populatePreviewValues(datasetStructurePreviewContainer, currentFields);
      }
      if (datasetStructureTemplateContainer) {
        datasetStructureTemplateContainer.textContent = html;
        datasetStructureTemplateContainer.classList.remove(
          "pdf-dataset-modal__template--empty"
        );
      }
    } else {
      livePreview.innerHTML =
        "<div class=\"pdf-document-placeholder\">Ajoutez des balises pour générer un aperçu.</div>";
      if (datasetStructurePreviewContainer) {
        datasetStructurePreviewContainer.innerHTML =
          "<div class=\"pdf-document-placeholder\">Ajoutez des balises pour générer un aperçu.</div>";
      }
      if (datasetStructureTemplateContainer) {
        datasetStructureTemplateContainer.textContent =
          "Aucun template défini.";
        datasetStructureTemplateContainer.classList.add(
          "pdf-dataset-modal__template--empty"
        );
      }
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

  function insertHtmlSnippet(html) {
    if (!html) {
      return;
    }

    templateEditor.focus();
    const selection = window.getSelection();
    let range = null;

    if (currentRange) {
      range = currentRange.cloneRange();
    } else if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0).cloneRange();
    }

    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    document.execCommand("insertHTML", false, html);

    const updatedSelection = window.getSelection();
    if (updatedSelection && updatedSelection.rangeCount > 0) {
      currentRange = updatedSelection.getRangeAt(0).cloneRange();
    }

    prepareEditorTags();
    updateLivePreview();
  }

  function renderComponentPalette() {
    const componentPalettes = [
      { element: componentPalette, interactive: true },
    ];
    if (datasetStructureComponentsContainer) {
      componentPalettes.push({
        element: datasetStructureComponentsContainer,
        interactive: false,
      });
    }

    componentPalettes.forEach(({ element, interactive }) => {
      element.innerHTML = "";

      PDF_TEMPLATE_COMPONENTS.forEach((component) => {
        const item = document.createElement(interactive ? "button" : "div");
        if (interactive) {
          item.type = "button";
        }
        item.className = "pdf-component-chip";
        if (!interactive) {
          item.classList.add("pdf-component-chip--static");
        }
        item.title = component.description;

        const title = document.createElement("span");
        title.className = "pdf-component-chip-title";
        title.textContent = component.label;
        item.appendChild(title);

        const description = document.createElement("span");
        description.className = "pdf-component-chip-description";
        description.textContent = component.description;
        item.appendChild(description);

        if (interactive) {
          item.addEventListener("click", () => {
            insertHtmlSnippet(component.html);
          });

          item.draggable = true;
          item.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData(
              "text/x-component-html",
              component.html
            );
            event.dataTransfer.setData("text/html", component.html);
            event.dataTransfer.setData("text/plain", component.label);
            event.dataTransfer.effectAllowed = "copy";
          });
        }

        element.appendChild(item);
      });
    });
  }

  function renderFieldPalette(fields) {
    const palettes = [{ element: fieldPalette, interactive: true }];
    if (datasetStructureFieldsContainer) {
      palettes.push({ element: datasetStructureFieldsContainer, interactive: false });
    }

    const visibleFields = (fields || []).filter((field) => isPdfFieldVisible(field));

    palettes.forEach(({ element, interactive }) => {
      element.innerHTML = "";
      if (!visibleFields.length) {
        const empty = document.createElement("div");
        empty.className = "pdf-field-empty";
        empty.textContent = "Aucun champ disponible.";
        element.appendChild(empty);
        return;
      }

      visibleFields.forEach((field) => {
        const chip = document.createElement("span");
        chip.className = "pdf-field-chip";
        chip.textContent = field.label;
        chip.title = field.name;
        if (interactive) {
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
        } else {
          chip.classList.add("pdf-field-chip--static");
        }
        element.appendChild(chip);
      });
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
    const componentHtml = event.dataTransfer.getData("text/x-component-html");
    if (componentHtml) {
      insertHtmlSnippet(componentHtml);
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
  });

  templateEditor.addEventListener("input", () => {
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
  renderComponentPalette();
  if (!templateEditor.innerHTML.trim() && currentFields.length) {
    templateEditor.innerHTML = buildDefaultTemplate(currentFields);
  }
  prepareEditorTags();
  updateLivePreview();

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
