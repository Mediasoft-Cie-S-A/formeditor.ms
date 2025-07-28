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

function renderPromptComponent(element) {
    element.innerHTML = `<div id="chat-container">
                    <textarea id="PromptText" placeholder="Type your message..."></textarea>

                    <div class="actions">
                      <div style="display: none; gap: 10px;">
                        <label for="file-upload">📎 Upload
                        <input type="file" id="file-upload" />
                        </label>
                    </div>
                        <button onclick="handlesFileUpload(event)" title="Upload File">📎</button>
                        <button onclick="handleFill(event)" title="Fill">✨</button>
                        <button onclick="handleOCR(event)" title="OCR">📄</button>
                        <button 
                            onmousedown="startVoice()" 
                            onmouseup="stopVoice()" 
                            onmouseleave="stopVoice()" 
                            title="Voice: Hold to Speak"
                        >🎤</button>
                        <button onclick="handleBigDocument(event)" title="Handle Big Document">📚</button>
                        <button  onclick="callAIService(event)" title="Send to AI">🤖</button>
                        <img src="img/loader.gif" id="loader" style="display: none; width: 80px; height: 40px;" alt="Loading...">
                    </div>
                    </div> `;

}

let recognition;
let isRecognizing = false;

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

function stopVoice() {
    if (recognition && isRecognizing) {
        recognition.stop();
        isRecognizing = false;
        console.log("Speech recognition stopped");
    }
}

function displayAnswer(event, answer) {
    const responseElement = document.createElement('div');
    responseElement.classList.add('ai-response'); // Add a marker class
    responseElement.innerHTML = answer;
    const parent = event.target.parentElement;
    // Remove previously added AI responses only
    parent.querySelectorAll('.ai-response').forEach(el => el.remove());
    parent.appendChild(responseElement);
}

function callAIService(event) {
    event.preventDefault();
    // get the prompt text and button text
    const promptText = document.getElementById('PromptText');

    // call the AI service with the prompt text
    fetchAIResponse(promptText.value).then(responseText => {
        // handle the response from the AI service
        displayAnswer(event, `<strong>AI Response:</strong> ${responseText}`);
    }).catch(error => {
        console.error('Error:', error);
        displayAnswer(event, `<strong>Error:</strong> ${error.message}`);
    });

}

/*
let uploadedPDF = null;
async function handlesFileUpload(event) {
    event.preventDefault();
    console.log("File upload button clicked");

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


    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/png,image/jpeg,image/jpg,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.style.display = 'none';

    input.addEventListener('change', async (event2) => {
        const file = event2.target.files[0];

        if (!file) {
            console.log('No file selected.');
            return;
        }

        const mime = file.type;

        let cleanedText = '';
        uploadedPDF = file;

        if (mime === 'application/pdf') {
            console.log(`PDF "${file.name}" uploaded. Extracting text...`);
            const arrayBuffer = await file.arrayBuffer();
        
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();
                const text = content.items.map(item => item.str).join(' ');

                if (text.trim().length > 30) {
                    // Page has real text
                    fullText += `\n\n--- Page ${pageNum} ---\n\n` + text;
                } else {
                    // Text too short — probably scanned. Run OCR instead.
                    console.warn(`Page ${pageNum} has little/no text. Running OCR...`);
                    const viewport = page.getViewport({ scale: 2 }); // scale for better OCR
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    const renderTask = page.render({ canvasContext: context, viewport });
                    await renderTask.promise;

                    const dataUrl = canvas.toDataURL(); // image for OCR

                    const result = await Tesseract.recognize(dataUrl, 'eng', {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                const percent = Math.floor(m.progress * 100);
                                displayAnswer(event, `<strong>OCR Page ${pageNum}:</strong> ${percent}%`);
                            }
                        },
                    });

                    fullText += `\n\n--- OCR Page ${pageNum} ---\n\n` + result.data.text;
                }
            }

            cleanedText = cleanExtractedText(fullText);
            console.log("Final Extracted Text (OCR+PDF):", cleanedText);


        } else if (mime.startsWith('image/')) {
            console.log(`Image "${file.name}" uploaded. Running OCR...`);

            const imageURL = URL.createObjectURL(file);

            const result = await Tesseract.recognize(imageURL, 'eng', {
                logger: m => {
                    console.log(m); // progress updates
                    if (m.status === 'recognizing text') {
                        const percent = Math.floor(m.progress * 100);
                        displayAnswer(event, `<strong>OCR Progress:</strong> ${percent}%`);
                    } else if (m.status) {
                        displayAnswer(event, `<strong>OCR Status:</strong> ${m.status}`);
                    }
                }
            });

            const rawText = result.data.text;
            cleanedText = cleanExtractedText(rawText);

            console.log("Cleaned OCR Text:", cleanedText);

        } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            uploadedPDF = file; // still reusing the same variable

            console.log(`Word document "${file.name}" uploaded. Extracting text...`);

            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });

            const rawText = result.value;
            cleanedText = cleanExtractedText(rawText);

            console.log("Cleaned DOCX Text:", cleanedText);

            uploadedPDF.cleanedText = cleanedText;
        } else {
            console.warn("Unsupported file type:", mime);
            return;
        }

        uploadedPDF.cleanedText = cleanedText;

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

        askGroq(prompt).then(responseText => {
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
        });

    });

    input.click();
}
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

        const responseText = await askGroq(prompt);
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


// Helper function to normalize whitespace, remove junk, etc.
function cleanExtractedText(text) {
    return text
        .replace(/\s+/g, ' ')          // collapse multiple spaces/newlines
        .replace(/–/g, '-')            // normalize dashes
        .replace(/\u00a0/g, ' ')       // non-breaking space to regular space
        .trim();
}


function handleFill(event) {

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


    askGroq(prompt).then(responseText => {
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

}

function handleVoice(event) {
    event.preventDefault();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert('Speech Recognition API is not supported in this browser.');
        return;
    }

    /*
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop automatically after one phrase
    recognition.lang = 'en-US'; // You can change this as needed

    recognition.start();


    recognition.onresult = function (event) {
        const spokenText = event.results[0][0].transcript;
        document.getElementById("promptInput").value = spokenText;
    };

    recognition.onerror = function (event) {
        console.error("Speech recognition error", event.error);
    };
    */
}

function handleBigDocument(event) {
    event.preventDefault();
    console.log("Handling big document...");
    {
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


            const responseText = await askGroq(prompt);
            displayAnswer(event, `<strong>AI Response:</strong> ${responseText}`);
            console.log(responseText);

            const jsonResponse = extractCleanJson(responseText);
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
}

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

function extractCleanJson(text) {
    console.log("Extracting clean JSON from text:", text);

    // Try to isolate the part after "response:"
    const responseStart = text.toLowerCase().indexOf("{");
    let raw = responseStart !== -1 ? text.slice(responseStart).trim() : text.trim();

    // Add missing braces if necessary
    if (!raw.startsWith('{')) raw = '{' + raw;
    if (!raw.endsWith('}')) raw = raw + '}';

    console.log("Raw JSON string to parse:", raw);

    // Try to fix common formatting issues
    let cleaned = raw
        .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // wrap keys in double quotes
        .replace(/'/g, '"'); // replace single quotes with double quotes

    try {
        const deduped = removeDuplicateKeys(cleaned);
        console.log("Deduplicated JSON string:", deduped);
        //const parsed = JSON.parse(deduped);

        //console.log("Successfully parsed JSON:", parsed);
        return deduped;
    } catch (err) {
        console.error("Still failed to parse cleaned JSON:", err.message);
        return null;
    }
}

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

async function askGroq(promptText) {
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
    return data.choices?.[0]?.message?.content || "No response";
}

