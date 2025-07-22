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
                        <button onclick="handleshowFileUpload()" title="Upload File">📎</button>
                        <button onclick="handleFill(event)" title="Fill">✨</button>
                        <button onclick="handleOCR(event)" title="OCR">📄</button>
                        <button onclick="handleVoice(event)" title="Voice">🎤</button>
                        <button  onclick="callAIService(event)" title="Send to AI">🤖</button>
                        <img src="img/loader.gif" id="loader" style="display: none; width: 80px; height: 40px;" alt="Loading...">
                    </div>
                    </div> `;

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

function handleshowFileUpload() {
    const fileUpload = document.getElementById('file-upload');
    fileUpload.style.display = fileUpload.style.display === 'none' ? 'block' : 'none';
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

