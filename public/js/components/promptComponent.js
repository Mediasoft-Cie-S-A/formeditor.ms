/*
 * Copyright (c) 2023 Mediasoft & Cie S.A.
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
 * - promptText / promptPlaceholder / promptButtonText: plain strings controlling the UI labels.
 * - promptResponse: plain string holding the latest generated response.
 */
/**
 * Crée dynamiquement un composant de prompt prêt à être déposé dans l'éditeur.
 * @param {string} type - Tag fonctionnel utilisé pour différencier les composants créés.
 * @usage Appeler lorsque l'utilisateur ajoute un nouveau bloc "prompt" dans l'interface de conception; la fonction prépare
 *        les attributs attendus par le panneau de propriétés avant de déléguer le rendu à {@link renderPromptComponent}.
 */
function createPromptComponent(type) {
    var main = document.createElement('div');
    main.className = 'form-container';
    main.id = type + Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName = type;
    main.setAttribute("promptText", "Please enter your question");
    main.setAttribute("promptPlaceholder", "Type your question here...");
    main.setAttribute("promptButtonText", "Submit");
    main.setAttribute("promptResponse", "");
    renderPromptComponent(main);

    return main;
}

/**
 * Génère l'interface de configuration dans la barre de propriétés pour un prompt existant.
 * @param {string} type - Identifiant logique du composant à éditer.
 * @param {HTMLElement} element - Élément DOM qui conserve les attributs de configuration du prompt.
 * @param {HTMLElement} content - Conteneur dans lequel injecter les champs de configuration.
 * @usage Utilisée lorsqu'un composant prompt est sélectionné dans le designer afin de permettre la mise à jour des textes
 *        via les champs éditables puis d'enregistrer les modifications grâce à {@link updatePanelJsonData}.
 */
function editPromptComponent(type, element, content) {
    const button = document.createElement('button');
    button.textContent = 'Update';
    button.onclick = function (event) {
        const propertiesBar = document.getElementById('propertiesBar');
        const panelID = propertiesBar.getAttribute("data-element-id");
        const main = document.getElementById(panelID);
        updatePanelJsonData(element);
    };
    content.appendChild(button);

    const promptText = createInputItem("Prompt Text", "promptText", "text", element.getAttribute('promptText'));
    const promptPlaceholder = createInputItem("Prompt Placeholder", "promptPlaceholder", "text", element.getAttribute('promptPlaceholder'));
    const promptButtonText = createInputItem("Button Text", "promptButtonText", "text", element.getAttribute('promptButtonText'));

    content.appendChild(promptText);
    content.appendChild(promptPlaceholder);
    content.appendChild(promptButtonText);
}

/**
 * Reconstruit le contenu HTML du composant prompt à partir des attributs courants.
 * @param {HTMLElement} element - Élément cible dont l'intérieur doit être re-rendu.
 * @usage Appelée lors de la création initiale ou après une mise à jour d'attributs pour rafraîchir l'affichage du textarea,
 *        des boutons d'action et du loader associé au composant.
 */
function renderPromptComponent(element) {
    element.innerHTML = `<div id="chat-container">
                    <textarea id="PromptText" placeholder="Type your message..."></textarea>

                    <div class="actions">
                      <div style="display: none; gap: 10px;">
                        <label for="file-upload">📎 Upload
                        <input type="file" id="file-upload" />
                        </label>
                    </div>
                        <button onclick="handleBigDocument(event)" title="Upload File">📎</button>
                        <button onclick="handleFill(event)" title="Fill">✨</button>
                        <button 
                            onmousedown="startVoice()" 
                            onmouseup="stopVoice()" 
                            onmouseleave="stopVoice()" 
                            title="Voice: Hold to Speak"
                        >🎤</button>
                        <button  onclick="handleAiButton(event)" title="Send to AI">🤖</button>
                        <img src="img/loader.gif" id="loader" style="display: none; width: 80px; height: 40px;" alt="Loading...">
                    </div>
                    </div> `;

}

let recognition;
let isRecognizing = false;

/**
 * Initialise l'API de reconnaissance vocale du navigateur si disponible.
 * @returns {SpeechRecognition|null} Instance prête à l'emploi ou `null` si l'API est absente.
 * @usage Invoker avant le démarrage de l'écoute vocale pour configurer la langue, les callbacks de transcription et
 *        signaler l'absence de support via `showToast`.
 */
function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        //alert("Speech Recognition API not supported.");
        showToast("Speech Recognition API not supported.");
        return null;
    }

    const recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = "en-US";

    recognizer.onresult = function (event) {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        const promptTextArea = document.getElementById("PromptText");
        promptTextArea.value = finalTranscript + interimTranscript;
        console.log("Recognized:", finalTranscript + interimTranscript);
    };

    recognizer.onerror = function (event) {
        console.error("Speech error:", event.error);
    };

    return recognizer;
}

/**
 * Démarre l'enregistrement vocal et attache l'instance de reconnaissance si nécessaire.
 * @usage Appelée par le bouton micro lors de l'événement `mousedown`; déclenche `recognition.start()` et positionne le flag
 *        global `isRecognizing` afin d'éviter les démarrages multiples.
 */
function startVoice() {
    if (!recognition) {
        recognition = setupSpeechRecognition();
    }
    if (recognition && !isRecognizing) {
        recognition.start();
        isRecognizing = true;
        console.log("Speech recognition started");
    }
}

/**
 * Interrompt la reconnaissance vocale en cours et réinitialise le flag interne.
 * @usage Appelée sur `mouseup`/`mouseleave` du bouton micro pour libérer proprement l'API et empêcher la transcription
 *        continue lorsque l'utilisateur relâche le contrôle.
 */
function stopVoice() {
    if (recognition && isRecognizing) {
        recognition.stop();
        isRecognizing = false;
        console.log("Speech recognition stopped");
    }
}

/**
 * Affiche une réponse formatée dans le panneau d'actions du composant en remplaçant les sorties précédentes.
 * @param {Event} event - Événement déclencheur provenant du bouton d'action.
 * @param {string} answer - Contenu HTML (fiable) à injecter dans la zone de réponse.
 * @usage Utilisée par les actions IA/fichier pour présenter les retours ou erreurs en supprimant d'abord les réponses AI
 *        précédentes via la classe `ai-response` afin de conserver un affichage unique.
 */
function displayAnswer(event, answer) {
    const responseElement = document.createElement('div');
    responseElement.classList.add('ai-response'); // Add a marker class
    responseElement.innerHTML = answer;
    const parent = event.target.parentElement;
    // Remove previously added AI responses only
    parent.querySelectorAll('.ai-response').forEach(el => el.remove());
    parent.appendChild(responseElement);
}

/**
 * Soumet le contenu du textarea au service IA configuré et affiche la réponse obtenue.
 * @param {Event} event - Événement `click` sur le bouton 🤖.
 * @usage Branchée directement sur l'attribut `onclick` du bouton IA dans {@link renderPromptComponent}; gère l'état du
 *        formulaire, la promesse retournée par {@link askAi} ainsi que les messages d'erreur éventuels.
 */
function handleAiButton(event) {
    event.preventDefault();
    // get the prompt text and button text
    const promptText = document.getElementById('PromptText');

    // call the AI service with the prompt text
    askAi(promptText.value).then(responseText => {
        // handle the response from the AI service
        console.log("AI response : ", responseText);
        displayAnswer(event, `<strong>AI Response:</strong> ${responseText}`);
    }).catch(error => {
        console.error('Error:', error);
        displayAnswer(event, `<strong>Error:</strong> ${error.message}`);
    });

}



/**
 * Ouvre un sélecteur de fichier, extrait le texte du document choisi et demande à l'IA de remplir les champs du formulaire.
 * @param {Event} event - Événement `click` sur le bouton de téléversement standard.
 * @usage Reliée aux formulaires simples pour analyser un document unique; utilise {@link extractTextFromFile} puis
 *        {@link askAi} afin de renseigner automatiquement les champs détectés.
 */
async function handlesFileUpload(event) {
    event.preventDefault();
    console.log("File upload button clicked");

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/png,image/jpeg,image/jpg,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.style.display = 'none';

    input.addEventListener('change', async (event2) => {
        const file = event2.target.files[0];
        if (!file) return;

        uploadedPDF = file;

        const cleanedText = await extractTextFromFile(file, progress => {
            displayAnswer(event, `<strong>Progress:</strong> ${progress}`);
        });

        uploadedPDF.cleanedText = cleanedText;

        // Collect field metadata
        const formFields = document.querySelectorAll('[dataset-field-name]');
        const fieldInfo = Array.from(formFields).map(field => ({
            name: field.getAttribute('dataset-field-name'),
            desc: field.getAttribute('dataset-description') || ''
        }));

        const fieldDescriptions = fieldInfo
            .map(f => `- ${f.name}: ${f.desc || '(no description provided)'}`)
            .join('\n');

        const prompt = `
            From the following extracted document text (from a PDF or scanned file):
            === INPUT TEXT ===
            """
            ${cleanedText}
            """

            Try to fill in the following fields with values inferred from the text:

            === FIELD DESCRIPTIONS ===
            ${fieldDescriptions}

            === RESPONSE FORMAT ===

            Guidelines:
            - The text may contain OCR errors, bad formatting, or missing labels — infer values where possible.
            - Use known data formats (e.g., SWIFT codes, IBANs, addresses) to guide your matching.
            - Do not guess blindly — only assign a value if it's reasonably clear.
            - If no reliable value is found for a field, set it to null.

            Output Format:
            - The response must begin with exactly: response: {
            - The response must end with exactly: }
            - All field names must be quoted. All string values must be in double quotes.
            - Do not add any comments, extra text, or explanations outside the JSON.
            - Ensure the JSON is valid and machine-readable.
            - Include all requested fields, even if null.
            - Do not include any explanation or text outside the JSON.

            Field Hints:
            - cler: Clearing number, usually a short numeric code (e.g. 3-5 digits)
            - des1: Small designation of the address , often a short label or acronym
            - des2: NPA + location (short)
            - ibswift: International SWIFT/BIC code, usually 8 or 11 uppercase letters (e.g. SNBZCHZZXXX)
            - liba: Bank label or short bank name, e.g. "SNB", "UBS", etc.
            - lieu: City or location name (e.g. "Zürich")
            - nccp: Account type or code, usually numeric (e.g. "1", "2")
            - noba: Bank number, often 3-6 digits or alphanumeric (e.g. "100", "X123")
            - nom1 / nom2 / nom3: Name lines for a bank or company (e.g. legal name)
            - rowid: Row ID in the system, you don't need to generate that, it will be generated by the system

            Now complete the JSON response below.
            response:
            `;

        const responseText = await asdkAI(prompt);
        displayAnswer(event, `<strong>AI Response:</strong> ${responseText}`);

        const jsonResponse = extractCleanJson(responseText);
        if (jsonResponse) {
            for (const [key, value] of Object.entries(jsonResponse)) {
                if (key !== "rowid") {
                    const field = document.querySelector(`[dataset-field-name="${key}"]`);
                    if (field) field.value = value !== null ? value : '';
                }
            }
        } else {
            console.error('No valid JSON response found.');
        }
    });

    input.click();
}


/**
 * Convertit un fichier (PDF, image ou DOCX) en texte normalisé en s'appuyant sur pdf.js, Tesseract ou Mammoth.
 * @param {File} file - Fichier fourni par l'utilisateur.
 * @param {Function} [onProgress] - Callback optionnel pour indiquer l'avancement de l'OCR.
 * @returns {Promise<string>} Texte nettoyé prêt à être utilisé par les prompts IA.
 * @usage Appeler avant toute requête IA nécessitant la lecture d'un document; la fonction gère automatiquement la détection
 *        du type MIME et applique la normalisation via {@link cleanExtractedText}.
 */
async function extractTextFromFile(file, onProgress = () => { }) {
    const mime = file.type;
    let cleanedText = '';

    if (mime === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const text = content.items.map(item => item.str).join(' ');

            if (text.trim().length > 30) {
                fullText += `\n\n--- Page ${pageNum} ---\n\n` + text;
            } else {
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const renderTask = page.render({ canvasContext: context, viewport });
                await renderTask.promise;

                const dataUrl = canvas.toDataURL();
                const result = await Tesseract.recognize(dataUrl, 'eng', {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            const percent = Math.floor(m.progress * 100);
                            onProgress(`OCR Page ${pageNum}: ${percent}%`);
                        }
                    },
                });

                fullText += `\n\n--- OCR Page ${pageNum} ---\n\n` + result.data.text;
            }
        }

        cleanedText = cleanExtractedText(fullText);

    } else if (mime.startsWith('image/')) {
        const imageURL = URL.createObjectURL(file);

        const result = await Tesseract.recognize(imageURL, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    const percent = Math.floor(m.progress * 100);
                    onProgress(`OCR Progress: ${percent}%`);
                }
            }
        });

        cleanedText = cleanExtractedText(result.data.text);

    } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        cleanedText = cleanExtractedText(result.value);

    } else {
        throw new Error("Unsupported file type: " + mime);
    }

    return cleanedText;
}


/**
 * Normalise le texte brut issu de l'OCR en réduisant les espaces et en harmonisant certains caractères.
 * @param {string} text - Chaîne originale extraite du document.
 * @returns {string} Texte prêt pour l'exploitation dans un prompt.
 * @usage Utilisée systématiquement par {@link extractTextFromFile} pour s'assurer que les prompts générés restent concis et
 *        lisibles par les modèles IA.
 */
function cleanExtractedText(text) {
    return text
        .replace(/\s+/g, ' ')          // collapse multiple spaces/newlines
        .replace(/–/g, '-')            // normalize dashes
        .replace(/\u00a0/g, ' ')       // non-breaking space to regular space
        .trim();
}


/**
 * Analyse le contenu du textarea pour suggérer des valeurs de champs via l'IA à partir du contexte du formulaire.
 * @param {Event} event - Événement `click` sur le bouton ✨.
 * @usage Conçu pour pré-remplir rapidement les champs existants: collecte les métadonnées du formulaire et construit un
 *        prompt détaillé avant d'interroger {@link askAi} et d'injecter les valeurs retournées.
 */
async function handleFill(event) {

    event.preventDefault();
    // Implement the fill functionality here
    const promptText = document.getElementById('PromptText');
    // search all the fileds in the form and fill the prompt text with their values
    const formFields = document.querySelectorAll('[dataset-field-name]');

    const fieldInfo = Array.from(formFields).map(field => {
        const name = field.getAttribute('dataset-field-name');
        const desc = field.getAttribute('dataset-description') || '';
        return { name, desc };
    });

    const fieldNames = fieldInfo.map(f => f.name).join(', ');

    const fieldDescriptions = fieldInfo
        .map(f => `- ${f.name}: ${f.desc || '(no description provided)'}`)
        .join('\n');

    console.log("Field Names:", fieldNames);
    console.log("Field Descriptions:", fieldDescriptions);
    console.log("Field Infos : ", fieldInfo);
    let prompt = `
    From the following text: 
    "${promptText.value}"
    Extract the following fields and generate a JSON object with their names and values:
    Fields:${fieldNames} Only include values that can be inferred from the text. For missing fields, return null.
    Always answer in a valid json format, for example if the field are a,b,c and you can only infer the value of b the output will be
    {
        "a": null,
        "b": "infered value",
        "c": null
    }
    You should output "response:" and then the json, the first characters you print should always be response: { and the last always }

    `

    prompt = `
    From the following unstructured text:
    "${promptText.value}"

    Extract the following fields and generate a JSON object with their inferred values.

    Fields: ${fieldNames}

    Instructions:
    - Try to match values even if the formatting is irregular or partially labeled.
    - Use heuristics, patterns, and common field formats to make educated inferences.
    - For example, if you see a 3-letter + 8-character SWIFT/BIC code, assign it to the field 'ibswift'.
    - For "clearing", match values labeled as "Clearing", "CB", or "Clearing/CB".
    - If a value is not clearly present, return 'null' for that field.

    Output Format Rules:
    - Output must start with: response: {
    - Output must end with: }
    - Must be a valid JSON object.
    - Do not include any comments or explanations.
    - Always include all listed fields, even if null.

    Example:

    If the input is:

    MyBank AG
    Bahnhofstrasse 1, Zürich
    SWIFT: MBAGCHZZ
    Clearing 123

    And the fields are:
    rowid, name, address, nccp, ibswift, cler

    Then the response should be exactly:
    response: {
        "rowid": null,
        "name": "MyBank AG",
        "address": "Bahnhofstrasse 1, Zürich",
        "nccp": null,
        "ibswift": "MBAGCHZZ",
        "cler": "123"
    }
    `

    prompt = `
    From the following unstructured text:
    === INPUT TEXT ===
    """
    ${promptText.value}
    """

    Try to fill in the following fields with values inferred from the text:

    === FIELD DESCRIPTIONS ===
    ${fieldDescriptions}

    === RESPONSE FORMAT ===

    Guidelines:
    - The text may be poorly formatted or missing labels — try your best to infer each value.
    - Use common formats (e.g. SWIFT codes, phone numbers, VAT numbers, etc.) to help identify the values.
    - Only assign a value if you're reasonably confident it matches the field.
    - If no reliable value is found for a field, set it to null.

    Output Format:
    - The response must begin with exactly: response: {
    - The response must end with exactly: }
    - All field names must be quoted. All string values must be in double quotes.
    - Do not add any comments, extra text, or explanations outside the JSON.
    - Ensure the JSON is valid and machine-readable.
    - The output must be a valid JSON object.
    - Include all requested fields, even if null.
    - Do not include any explanation or text outside the JSON.

    Field Hints:
    - cler: Clearing number, usually a short numeric code (e.g. 3-5 digits)
    - des1: Small designation of the address , often a short label or acronym
    - des2: NPA + location (short)
    - ibswift: International SWIFT/BIC code, usually 8 or 11 uppercase letters (e.g. SNBZCHZZXXX)
    - liba: Bank label or short bank name, e.g. "SNB", "UBS", etc.
    - lieu: City or location name (e.g. "Zürich")
    - nccp: Account type or code, usually numeric (e.g. "1", "2")
    - noba: Bank number, often 3-6 digits or alphanumeric (e.g. "100", "X123")
    - nom1 / nom2 / nom3: Name lines for a bank or company (e.g. legal name)
    - rowid: Row ID in the system, you don't need to generate that, it will be generated by the system


   Example:

    If the input is:
    """
    Bank XYZ
    SWIFT: XYZABCDG123
    Clearing 123
    """

    And the fields are:
    nom1, ibswift, cler

    Then respond exactly as:
    response: {
    "nom1": "Bank XYZ",
    "ibswift": "XYZABCDG123",
    "cler": "123"
    }

    Now complete the JSON response below.
    response:
    `;

    prompt = `
            From the following extracted document text (from a PDF or scanned file):
            === INPUT TEXT ===
            """
            ${promptText.value}
            """

            Try to fill in the following fields with values inferred from the text:

            === FIELD DESCRIPTIONS ===
            ${fieldDescriptions}

            === RESPONSE FORMAT ===

            Guidelines:
            - The text may contain OCR errors, bad formatting, or missing labels — infer values where possible.
            - Use known data formats (e.g., SWIFT codes, IBANs, addresses) to guide your matching.
            - Do not guess blindly — only assign a value if it's reasonably clear.
            - If no reliable value is found for a field, set it to null.

            Output Format:
            - The response must begin with exactly: response: {
            - The response must end with exactly: }
            - All field names must be quoted. All string values must be in double quotes.
            - Do not add any comments, extra text, or explanations outside the JSON.
            - Ensure the JSON is valid and machine-readable.
            - Include all requested fields, even if null.
            - Do not include any explanation or text outside the JSON.

            Field Hints:
            - cler: Clearing number, usually a short numeric code (e.g. 3-5 digits)
            - des1: Small designation of the address , often a short label or acronym
            - des2: NPA + location (short)
            - ibswift: International SWIFT/BIC code, usually 8 or 11 uppercase letters (e.g. SNBZCHZZXXX)
            - liba: Bank label or short bank name, e.g. "SNB", "UBS", etc.
            - lieu: City or location name (e.g. "Zürich")
            - nccp: Account type or code, usually numeric (e.g. "1", "2")
            - noba: Bank number, often 3-6 digits or alphanumeric (e.g. "100", "X123")
            - nom1 / nom2 / nom3: Name lines for a bank or company (e.g. legal name)
            - rowid: Row ID in the system, you don't need to generate that, it will be generated by the system

            Now complete the JSON response below.
            response:
    `;

    prompt = `
                From the following extracted document text (e.g., from a PDF or scanned file), extract **all identifiable bank entries**. Each bank may include fields such as name, address, SWIFT, clearing number, and other identifiers.

                === INPUT TEXT ===
                """
                 ${promptText.value}
                """

                Your task is to:

                1. Identify **each unique bank or financial entity** mentioned in the text.
                2. For each one, extract the following fields where reasonably available.
                3. Include **multiple entries** if more than one bank appears.
                4. If a field cannot be confidently filled, set it to **null**.

                === FIELD DEFINITIONS ===
                ${fieldDescriptions}

                === EXTRACTION FORMAT ===

                Output must begin with: **response: [**
                Each item in the array must be a JSON object containing **all fields**.
                Only output valid JSON. No explanations or comments.

                Guidelines:
                - Each object in the array should represent a **distinct bank**.
                - Field values must be strings (double-quoted) or null.
                - Do not omit any fields — always include all, even if null.
                - If there’s uncertainty in a field, set it to null rather than guessing.

                Field Hints:
                - cler: Clearing number (numeric or short code, e.g. "766")
                - des1: Address line short label (optional)
                - des2: NPA + location (e.g. "1211 Genève 2")
                - ibswift: SWIFT/BIC code (e.g. "BCGECHGGXXX")
                - liba: Short bank label (e.g. "BCGE", "BCNN")
                - lieu: Location or city name (e.g. "Genève")
                - nccp: Account type code (e.g. "20-136-4")
                - noba: Bank number or internal ID
                - nom1 / nom2 / nom3: Name lines (e.g. "Banque Cantonale de Genève", etc.)
                - rowid: Always null, this will be generated by the system

                === OUTPUT ===

                response: [
                {
                    "cler": "788",
                    "des1": "Quai de l'Ile 17 - CP 2251",
                    "des2": "1211 Genève 2",
                    "ibswift": "BCGECHGGXXX",
                    "liba": "BCGE",
                    "lieu": "Genève",
                    "nccp": null,
                    "noba": null,
                    "nom1": "Banque Cantonale de Genève",
                    "nom2": null,
                    "nom3": null,
                    "rowid": null
                },
                {
                    "cler": "766",
                    "des1": "Place Pury 4",
                    "des2": "CH-2001 Neuchâtel",
                    "ibswift": "BCNNCH22XXX",
                    "liba": "BCNN",
                    "lieu": "Neuchâtel",
                    "nccp": "20-136-4",
                    "noba": null,
                    "nom1": "Banque Cantonale Neuchâteloise",
                    "nom2": null,
                    "nom3": null,
                    "rowid": null
                }
                ]
    `;


    const responseText = await askAi(prompt);
    displayAnswer(event, `<strong>AI Response:</strong> ${responseText}`);
    console.log(responseText);

    const jsonResponse = extractCleanJson(responseText);

    loadBigModalWithJson(jsonResponse);


    /*
        askAi(prompt).then(responseText => {
            // handle the response from the AI service
    
    
            console.log("AI response : ", responseText);
            displayAnswer(event, `<strong>AI Response:</strong> ${responseText}`);
    
            const jsonResponse = extractCleanJson(responseText);
            console.log('JSON Response:', jsonResponse);
    
            if (jsonResponse) {
                // Update the form fields with the values from the JSON response
                for (const [key, value] of Object.entries(jsonResponse)) {
                    if (key !== "rowid") { // Skip rowid as it is handled by the system
                        const field = document.querySelector(`[dataset-field-name="${key}"]`);
                        if (field) {
                            field.value = value !== null ? value : '';
                        }
                    }
                }
            } else {
                console.error('No valid JSON response found.');
            }
    
        }).catch(error => {
            console.error('Error:', error);
            const errorElement = document.createElement('div');
            errorElement.innerHTML = `<strong>Error:</strong> ${error.message}`;
            event.target.parentElement.appendChild(errorElement);
        }
        );
    */
}

/**
 * Variante avancée du chargement de document permettant d'extraire plusieurs entrées bancaires et de les afficher en modal.
 * @param {Event} event - Événement `click` sur le bouton 📎 spécifique aux gros documents.
 * @usage À utiliser lorsqu'un document contient potentiellement plusieurs banques; la réponse JSON est transmise à
 *        `loadBigModalWithJson` pour permettre une sélection manuelle des enregistrements détectés.
 */
function handleBigDocument(event) {
    event.preventDefault();
    console.log("File upload button clicked");

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/png,image/jpeg,image/jpg,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.style.display = 'none';

    input.addEventListener('change', async (event2) => {
        const file = event2.target.files[0];
        if (!file) return;

        uploadedPDF = file;

        const cleanedText = await extractTextFromFile(file, progress => {
            displayAnswer(event, `<strong>Progress:</strong> ${progress}`);
        });

        uploadedPDF.cleanedText = cleanedText;

        // Collect field metadata
        const formFields = document.querySelectorAll('[dataset-field-name]');
        const fieldInfo = Array.from(formFields).map(field => ({
            name: field.getAttribute('dataset-field-name'),
            desc: field.getAttribute('dataset-description') || ''
        }));

        const fieldDescriptions = fieldInfo
            .map(f => `- ${f.name}: ${f.desc || '(no description provided)'}`)
            .join('\n');

        const prompt = `
                From the following extracted document text (e.g., from a PDF or scanned file), extract **all identifiable bank entries**. Each bank may include fields such as name, address, SWIFT, clearing number, and other identifiers.

                === INPUT TEXT ===
                """
                ${cleanedText}
                """

                Your task is to:

                1. Identify **each unique bank or financial entity** mentioned in the text.
                2. For each one, extract the following fields where reasonably available.
                3. Include **multiple entries** if more than one bank appears.
                4. If a field cannot be confidently filled, set it to **null**.

                === FIELD DEFINITIONS ===
                ${fieldDescriptions}

                === EXTRACTION FORMAT ===

                Output must begin with: **response: [**
                Each item in the array must be a JSON object containing **all fields**.
                Only output valid JSON. No explanations or comments.

                Guidelines:
                - Each object in the array should represent a **distinct bank**.
                - Field values must be strings (double-quoted) or null.
                - Do not omit any fields — always include all, even if null.
                - If there’s uncertainty in a field, set it to null rather than guessing.

                Field Hints:
                - cler: Clearing number (numeric or short code, e.g. "766")
                - des1: Address line short label (optional)
                - des2: NPA + location (e.g. "1211 Genève 2")
                - ibswift: SWIFT/BIC code (e.g. "BCGECHGGXXX")
                - liba: Short bank label (e.g. "BCGE", "BCNN")
                - lieu: Location or city name (e.g. "Genève")
                - nccp: Account type code (e.g. "20-136-4")
                - noba: Bank number or internal ID
                - nom1 / nom2 / nom3: Name lines (e.g. "Banque Cantonale de Genève", etc.)
                - rowid: Always null, this will be generated by the system

                === OUTPUT ===

                response: [
                {
                    "cler": "788",
                    "des1": "Quai de l'Ile 17 - CP 2251",
                    "des2": "1211 Genève 2",
                    "ibswift": "BCGECHGGXXX",
                    "liba": "BCGE",
                    "lieu": "Genève",
                    "nccp": null,
                    "noba": null,
                    "nom1": "Banque Cantonale de Genève",
                    "nom2": null,
                    "nom3": null,
                    "rowid": null
                },
                {
                    "cler": "766",
                    "des1": "Place Pury 4",
                    "des2": "CH-2001 Neuchâtel",
                    "ibswift": "BCNNCH22XXX",
                    "liba": "BCNN",
                    "lieu": "Neuchâtel",
                    "nccp": "20-136-4",
                    "noba": null,
                    "nom1": "Banque Cantonale Neuchâteloise",
                    "nom2": null,
                    "nom3": null,
                    "rowid": null
                }
                ]
                `;


        const responseText = await askAi(prompt);
        displayAnswer(event, `<strong>AI Response:</strong> ${responseText}`);
        console.log(responseText);

        const jsonResponse = extractCleanJson(responseText);

        loadBigModalWithJson(jsonResponse);
        /*
        if (jsonResponse) {
            for (const [key, value] of Object.entries(jsonResponse)) {
                if (key !== "rowid") {
                    const field = document.querySelector(`[dataset-field-name="${key}"]`);
                    if (field) field.value = value !== null ? value : '';
                }
            }
        } else {
            console.error('No valid JSON response found.');
        }
        */
    });

    input.click();

}

/**
 * Interroge directement l'API locale (LM Studio/Ollama) et renvoie la réponse textuelle brute.
 * @param {string} promptText - Prompt complet à transmettre au service distant.
 * @returns {Promise<string>} Réponse du modèle ou message d'erreur formaté.
 * @usage Méthode legacy conservée pour les scénarios où l'on souhaite contacter le service HTTP local au lieu du proxy
 *        centralisé fourni par {@link askAi}; gère l'affichage du loader associé.
 */
async function fetchAIResponse(promptText) {

    const loader = document.getElementById('loader');
    // show the loader
    loader.style.display = 'block';
    // call ollama API or any AI service with the prompt text with full URL
    // return  fetch('http://demo01:5001/api/v1/generate', {
    return fetch('http://localhost:5001/api/v1/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        /*
        body: JSON.stringify({            
        "max_context_length": 2048,
        "max_length": 100,
        "prompt": promptText,
        "quiet": false,
        "rep_pen": 1.1,
        "rep_pen_range": 256,
        "rep_pen_slope": 1,
        "temperature": 0.5,
        "tfs": 1,
        "top_a": 0,
        "top_k": 100,
        "top_p": 0.9,
        "typical": 1,
        
        }),
        body: JSON.stringify({
            "n": 1,
            "max_context_length": 4096,
            "max_length": 512,
            "rep_pen": 1.07,
            "temperature": 0.75,
            "top_p": 0.92,
            "top_k": 100,
            "top_a": 0,
            "typical": 1,
            "tfs": 1,
        "rep_pen_range": 360,
        "rep_pen_slope": 0.7,
        "sampler_order": [6, 0, 1, 3, 4, 2, 5],
        "memory": "",
        "trim_stop": true,
        "genkey": "KCPP9485",
        "min_p": 0,
        "dynatemp_range": 0,
        "dynatemp_exponent": 1,
        "smoothing_factor": 0,
        "nsigma": 0,
        "banned_tokens": [],
        "render_special": false,
        "logprobs": false,
        "replace_instruct_placeholders": true,
        "presence_penalty": 0,
        "logit_bias": {},
        "quiet": true,
        "use_default_badwordsids": false,
        "bypass_eos": false,
        
        "prompt": promptText
        })
        */

        body: JSON.stringify({
            "n": 1,
            "max_context_length": 4096,
            "max_length": 512,
            "rep_pen": 1.1,
            "rep_pen_range": 512,
            "rep_pen_slope": 0.9,

            "temperature": 0.4,
            "top_p": 0.9,
            "top_k": 40,
            "typical": 0.95,
            "tfs": 1.0,
            "top_a": 0,  // disable adaptive sampling (less needed here)

            "min_p": 0.1,         // filters very unlikely tokens
            "dynatemp_range": 0,  // disable dynamic temperature
            "dynatemp_exponent": 1,

            "sampler_order": [6, 0, 1, 3, 4, 2, 5],  // default, fine to keep

            "presence_penalty": 0.3,  // slight novelty boost
            "frequency_penalty": 0.0, // keep frequency neutral

            "banned_tokens": [],
            "logprobs": false,
            "logit_bias": {},

            "trim_stop": true,
            "render_special": false,
            "replace_instruct_placeholders": true,
            "use_default_badwordsids": false,
            "bypass_eos": false,
            "quiet": true,

            "prompt": promptText,
        })
    })
        .then(response => response.json())
        .then(data => {
            // handle the response from the AI service
            const responseText = data.results[0].text || "No response from AI service";
            // hide the loader
            loader.style.display = 'none';
            return responseText;
        })
        .catch(error => {
            console.error('Error:', error);
            // hide the loader
            loader.style.display = 'none';

            const errorElement = document.createElement('div');
            errorElement.innerHTML = `<strong>Error:</strong> ${error.message}`;
            //event.target.parentElement.appendChild(errorElement);
            document.body.appendChild(errorElement);
            return "No response from AI service";
        });

}

/**
 * Récupère un objet JSON isolé à la suite du mot-clé "response" dans un texte libre.
 * @param {string} text - Réponse textuelle potentiellement bruitée.
 * @returns {Object|null} Objet JSON parsé ou `null` en cas d'échec.
 * @usage Utile lorsqu'un modèle renvoie une structure `{ ... }` unique sans tableau; tente une réparation via `jsonrepair`
 *        avant de parser le segment identifié.
 */
function extractJsonAfterResponse(text) {

    jsonrepair(text)
    const keyword = '{';
    const startIndex = text.toLowerCase().indexOf(keyword);


    let braceCount = 0;
    let inside = false;
    let json = '';

    // Start iterating from the position of the opening brace of "response"
    for (let i = text.indexOf('{', startIndex); i < text.length; i++) {
        const char = text[i];
        json += char;

        if (char === '{') {
            braceCount++;
            inside = true;
        } else if (char === '}') {
            braceCount--;
        }

        // If we've closed all opened braces, we're done
        if (inside && braceCount === 0) {
            break;
        }
    }

    try {
        const parsed = JSON.parse(json);
        return parsed; // Return the full parsed object that was inside "response"
    } catch (err) {
        console.error('Invalid JSON structure:', err.message);
        return null;
    }
}

/**
 * Extrait et nettoie une structure JSON (tableau ou objet) renvoyée après le préfixe "response:".
 * @param {string} text - Chaîne brute renvoyée par le modèle.
 * @returns {Array|Object|null} Structure JSON parseable ou `null` si la réparation échoue.
 * @usage Principal utilitaire pour les intégrations IA: nettoie les citations cassées via {@link escapeBrokenQuotes} et
 *        garantit un résultat exploitable par les formulaires.
 */
function extractCleanJson(text) {
    console.log("Extracting clean JSON from text:", text);

    const responseMatch = text.match(/response\s*:\s*([\s\S]*)/i);
    if (!responseMatch) {
        console.warn("No 'response:' found in text.");
        return null;
    }


    let raw = responseMatch[1].trim();
    console.log("Raw JSON text found:", raw);

    // Try to detect if it's an object or array
    const isArray = raw.startsWith('[');
    const isObject = raw.startsWith('{');

    if (!isArray && !isObject) {
        // Try to fix missing brackets
        if (raw.includes('{') && raw.includes('}')) {
            raw = '[' + raw + ']';
        } else {
            console.warn("Cannot determine if it's an object or array.");
            return null;
        }
    }

    const firstBracket = raw.indexOf('[');
    const lastBracket = raw.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1 || firstBracket >= lastBracket) {
        console.warn("No valid JSON array found in text.");
        return null;
    }

    const jsonArrayText = raw.slice(firstBracket, lastBracket + 1).trim();

    // Clean up common issues
    let fixed = escapeBrokenQuotes(jsonArrayText);

    console.log("Cleaned JSON text:", fixed);

    try {
        const parsed = JSON.parse(fixed);
        console.log("Parsed JSON successfully:", parsed);
        return parsed;
    } catch (err) {
        console.error("JSON parse failed:", err.message);
        return null;
    }
}

/**
 * Corrige les guillemets non échappés qui empêchent la validation JSON.
 * @param {string} json - Chaîne JSON à réparer.
 * @returns {string} Version corrigée avec les guillemets internes échappés.
 * @usage S'utilise en complément d'{@link extractCleanJson} pour fiabiliser la chaîne avant parsing.
 */
function escapeBrokenQuotes(json) {
    return json.replace(/"(.*?)":\s*"([^"]*?)"([^,}\]])/g, (match, key, value, tail) => {
        // Check for inner unescaped quotes in value
        if (value.includes('"')) {
            const fixedValue = value.replace(/"/g, '\\"');
            return `"${key}": "${fixedValue}"${tail}`;
        }
        return match;
    });
}



/**
 * Détecte les doublons de clés dans un blob JSON et conserve la valeur la plus pertinente.
 * @param {string} rawText - Chaîne source potentiellement invalide.
 * @returns {Object} Objet clé/valeur épuré des répétitions.
 * @usage Permet de post-traiter des réponses IA contenant des répétitions afin de conserver une structure cohérente.
 */
function removeDuplicateKeys(rawText) {
    const deduped = {};
    const keyValuePattern = /["']?([\w]+)["']?\s*:\s*(null|"(.*?)"|'(.*?)'|[^,{}]+)/g;

    let match;
    while ((match = keyValuePattern.exec(rawText)) !== null) {
        const key = match[1];
        let value = match[2];

        // Normalize value
        if (value === 'null') {
            value = null;
        } else {
            value = value.replace(/^['"]|['"]$/g, ''); // remove quotes
        }

        // Keep first non-null or first if all are null
        if (!(key in deduped) || (deduped[key] === null && value !== null)) {
            deduped[key] = value;
        }
    }

    return deduped;
}

/**
 * Point d'entrée unique pour interroger le moteur IA configuré côté client.
 * @param {string} promptText - Prompt textuel complet.
 * @returns {Promise<string>} Contenu renvoyé par le service.
 * @usage Préférer cet utilitaire pour toutes les interactions IA afin de centraliser le choix du backend (actuellement
 *        {@link askGroq}).
 */
async function askAi(promptText) {

    //always use askAi so if we change the AI service we only need to change it here
    return askGroq(promptText);

}

/**
 * Envoie un prompt à l'endpoint `/api/lm` exposé par LM Studio.
 * @param {string} promptText - Instructions destinées au modèle local.
 * @returns {Promise<string>} Réponse textuelle du service ou message d'erreur.
 * @usage Utilisé lorsqu'on souhaite cibler explicitement LM Studio; gère l'affichage du loader et la conversion JSON.
 */
async function askLmStudio(promptText) {
    const loader = document.getElementById('loader');
    // show the loader
    loader.style.display = 'block';
    return fetch('/api/lm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
    })
        .then(response => response.json())
        .then(data => {
            // handle the response from the AI service
            const responseText = data.choices?.[0]?.message?.content || "No response from AI service";
            // hide the loader
            loader.style.display = 'none';
            return responseText;
        })
        .catch(error => {
            console.error('Error:', error);
            // hide the loader
            loader.style.display = 'none';

            const errorElement = document.createElement('div');
            errorElement.innerHTML = `<strong>Error:</strong> ${error.message}`;
            //event.target.parentElement.appendChild(errorElement);
            document.body.appendChild(errorElement);
            return "No response from AI service";
        });
}

/**
 * Interroge le proxy `/api/ask-groq` pour obtenir une réponse conversationnelle.
 * @param {string} promptText - Prompt utilisateur.
 * @returns {Promise<string>} Contenu textuel retourné par Groq ou "No response".
 * @usage Backend IA par défaut utilisé par {@link askAi}; assure également la gestion de l'indicateur de chargement.
 */
async function askGroq(promptText) {
    const loader = document.getElementById('loader');
    // show the loader
    if (loader) loader.style.display = 'block';
    const response = await fetch("/api/ask-groq", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Return clean JSON only if asked."
                },
                {
                    role: "user",
                    content: promptText
                }
            ]
        })
    });

    const data = await response.json();
    if (loader) loader.style.display = 'none';
    return data.choices?.[0]?.message?.content || "No response";
}

