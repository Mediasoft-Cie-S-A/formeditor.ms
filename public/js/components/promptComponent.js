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
       var main= document.createElement('div');
    main.className = 'form-container';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;
    main.setAttribute("promptText", "Please enter your question");
    main.setAttribute("promptPlaceholder", "Type your question here...");
    main.setAttribute("promptButtonText", "Submit");
    main.setAttribute("promptResponse", "");
    const  Label = document.createElement('label');
    Label.innerHTML = "Prompt";
    Label.id = "PromptLabel";
    Label.tagName = "label";
    main.appendChild(Label);    
    const promptText = document.createElement('textarea');
    promptText.id = "PromptText";
    promptText.value = main.getAttribute("promptText");
    promptText.placeholder = main.getAttribute("promptPlaceholder");
    promptText.className = "input-element textarea-element";
    promptText.setAttribute("promptType","auto");
    main.appendChild(promptText);
    const promptType = document.createElement('select');
    promptType.id = "PromptType";
    promptType.innerHTML = `
        <option value="auto">Auto Fill</option>
        <option value="generate">Generate</option>
        <option value="question">Question</option>
        `;
    promptType.value = main.getAttribute("promptType") || "auto";
    main.appendChild(promptType);
    const promptButtonText = document.createElement('input');
    promptButtonText.id = "PromptButtonText";
    promptButtonText.value = main.getAttribute("promptButtonText");
    promptButtonText.placeholder = "Button text for the prompt";
    promptButtonText.setAttribute("onclick", "callAIService(event)");
    main.appendChild(promptButtonText);
    return main;
}

function editPromptComponent(type, element, content) {
    const button = document.createElement('button');
    button.textContent = 'Update';
    button.onclick = function(event) {
        const propertiesBar = document.getElementById('propertiesBar');
        const panelID = propertiesBar.querySelector('label').textContent;
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
    
}

function callAIService(event) {
    event.preventDefault();
    // get the prompt text and button text
    const promptText = event.target.parentElement.querySelector('#PromptText').value;
    const promptType = event.target.parentElement.querySelector('#PromptType').value;
    switch (promptType) {
        case 'auto':
             // get all the inputs in the form
            const inputs = event.target.parentElement.querySelectorAll('input, textarea');
        
            break;
        case 'generate':
            // Generate logic can be implemented here
            break;
        case 'question':
            // Question logic can be implemented here
            break;
        default:
            console.error('Unknown prompt type:', promptType);
            return;
    }
  
}

function fetchAIResponse(promptText) {
      
    // call ollama API or any AI service with the prompt text with full URL
    fetch('https://api.ollama.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama2',
            messages: [{ role: 'user', content: promptText }],
        }),
    })  
    .then(response => response.json())
    .then(data => {
        // handle the response from the AI service
        const responseText = data.choices[0].message.content;
        // display the response in the element
        const responseElement = document.createElement('div');
        responseElement.innerHTML = `<strong>Response:</strong> ${responseText}`;
        event.target.parentElement.appendChild(responseElement);
    })  
    .catch(error => {
        console.error('Error:', error);
        const errorElement = document.createElement('div');
        errorElement.innerHTML = `<strong>Error:</strong> ${error.message}`;
        event.target.parentElement.appendChild(errorElement);
    });
}
    
