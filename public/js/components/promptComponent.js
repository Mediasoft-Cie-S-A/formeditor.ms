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

function callAIService(event) {
    event.preventDefault();
    // get the prompt text and button text
    const promptText = document.getElementById('PromptText');

    // call the AI service with the prompt text
    fetchAIResponse(promptText.value).then(responseText => {
        // handle the response from the AI service
        const responseElement = document.createElement('div');
        responseElement.innerHTML = `<strong>AI Response:</strong> ${responseText}`;
        event.target.parentElement.appendChild(responseElement);
    }).catch(error => {
        console.error('Error:', error);
        const errorElement = document.createElement('div');
        errorElement.innerHTML = `<strong>Error:</strong> ${error.message}`;
        event.target.parentElement.appendChild(errorElement);
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
    // get all the nams of the fields
    const fieldNames = Array.from(formFields).map(field => field.getAttribute('dataset-field-name')).join(', ');
    // get the prompt text and set it to the promptText
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

    console.log(prompt);
    fetchAIResponse(prompt).then(responseText => {
        // handle the response from the AI service
        console.log("AI response : ", responseText);
        const jsonResponse = extractJsonAfterResponse(responseText);

        const responseElement = document.createElement('div');
        responseElement.classList.add('ai-response'); // Add a marker class
        responseElement.innerHTML = `<strong>AI Response:</strong> ${jsonResponse}`;

        const parent = event.target.parentElement;

        // Remove previously added AI responses only
        parent.querySelectorAll('.ai-response').forEach(el => el.remove());

        parent.appendChild(responseElement);
        //event.target.parentElement.appendChild(responseElement);

        console.log('JSON Response:', jsonResponse);
        if (jsonResponse) {
            // Update the form fields with the values from the JSON response
            for (const [key, value] of Object.entries(jsonResponse)) {
                const field = document.querySelector(`[dataset-field-name="${key}"]`);
                if (field) {
                    field.value = value !== null ? value : '';
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
        */
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
            "stop_sequence": ["{{[INPUT]}}", "{{[OUTPUT]}}"],
            "use_default_badwordsids": false,
            "bypass_eos": false,

            "prompt": promptText
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
    const keyword = 'response: {';
    const startIndex = text.toLowerCase().indexOf(keyword);

    if (startIndex === -1) {
        console.error('No "response": {' + ' found in text.');
        return null;
    }

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