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
// Translation Dictionary Example (Replace with Google Translate API generated data)
/**
 * Data storage
 * - translationDictionary: in-memory JSON object mapping languages to text replacements.
 * - tagName: plain string stored on the root element for serialization.
 */

let translationDictionary = {};
let translationDictionaryPromise;

function setTranslationDictionary(newDictionary = {}) {
    translationDictionary = newDictionary;
    translationDictionaryPromise = Promise.resolve(translationDictionary);
}

async function loadTranslationDictionary(forceReload = false) {
    if (!forceReload && translationDictionaryPromise) {
        return translationDictionaryPromise;
    }

    translationDictionaryPromise = fetch('/api/translations', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
        .then(async response => {
            if (!response.ok) {
                throw new Error('Unable to load translation dictionary');
            }
            const payload = await response.json();
            setTranslationDictionary(payload.dictionary || {});
            return translationDictionary;
        })
        .catch(err => {
            console.error('Failed to load translation dictionary:', err);
            setTranslationDictionary({});
            return translationDictionary;
        });

    return translationDictionaryPromise;
}

async function saveTranslationDictionary(newDictionary) {
    const response = await fetch('/api/translations', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ dictionary: newDictionary }),
    });

    if (!response.ok) {
        throw new Error('Failed to save translation dictionary');
    }

    const payload = await response.json();
    setTranslationDictionary(payload.dictionary || {});
    return translationDictionary;
}

async function importTranslationDictionary(newDictionary) {
    const response = await fetch('/api/translations/import', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ dictionary: newDictionary }),
    });

    if (!response.ok) {
        throw new Error('Failed to import translation dictionary');
    }

    const payload = await response.json();
    setTranslationDictionary(payload.dictionary || {});
    return translationDictionary;
}

async function generateTranslationDictionaryWithAI(promptText, baseDictionary) {
    const response = await fetch('/api/translations/ai-generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ prompt: promptText, baseDictionary }),
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || 'Failed to generate dictionary with AI');
    }

    const payload = await response.json();
    setTranslationDictionary(payload.dictionary || {});
    return translationDictionary;
}

function createLanguageEditor(language, dictionary) {
    const languageBox = document.createElement('div');
    languageBox.className = 'translation-language-box';
    languageBox.setAttribute('tagName', 'language');

    const languageHeader = document.createElement('div');
    languageHeader.className = 'translation-language-header';

    const languageNameInput = document.createElement('input');
    languageNameInput.placeholder = 'Language';
    languageNameInput.value = language || '';
    languageNameInput.className = 'translation-language-input';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Remove';
    deleteButton.className = 'translation-language-remove';
    deleteButton.onclick = () => {
        languageBox.remove();
    };

    languageHeader.appendChild(languageNameInput);
    languageHeader.appendChild(deleteButton);

    const languageDictionaryInput = document.createElement('textarea');
    languageDictionaryInput.placeholder = 'Language dictionary as JSON';
    languageDictionaryInput.value = dictionary ? JSON.stringify(dictionary, null, 2) : '';
    languageDictionaryInput.className = 'translation-language-textarea';

    languageBox.appendChild(languageHeader);
    languageBox.appendChild(languageDictionaryInput);

    return languageBox;
}

function collectDictionaryFromEditors(editorContainer) {
    const result = {};
    const languageBoxes = editorContainer.querySelectorAll("div[tagName='language']");
    languageBoxes.forEach(languageBox => {
        const languageName = languageBox.querySelector('input').value.trim();
        const languageDictionaryText = languageBox.querySelector('textarea').value.trim();
        if (!languageName) {
            return;
        }
        if (!languageDictionaryText) {
            result[languageName] = {};
            return;
        }
        try {
            const parsedDictionary = JSON.parse(languageDictionaryText);
            result[languageName] = parsedDictionary;
        } catch (err) {
            throw new Error(`Invalid JSON for language ${languageName}`);
        }
    });
    return result;
}
// create component
function createTranslateComponent(type) {
    console.log("createTranslateComponent");
    const mainDiv = document.createElement('div');
    mainDiv.setAttribute("tagName", type);
    mainDiv.className = "form-element";
    mainDiv.id = `translateComponent-${Date.now()}`;

    renderTranslationComponent(mainDiv).catch(err => console.error('Failed to render translate component:', err));
    return mainDiv;
}

// edit component
async function editTranslateComponent(type, element, content) {
    content.innerHTML = '';

    const editorContainer = document.createElement('div');
    editorContainer.className = 'translation-editor-container';

    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'translation-editor-controls';

    const statusMessage = document.createElement('div');
    statusMessage.className = 'translation-editor-status';

    const importInput = document.createElement('input');
    importInput.type = 'file';
    importInput.accept = 'application/json';
    importInput.style.display = 'none';

    const rebuildEditors = (dictionary) => {
        editorContainer.innerHTML = '';
        Object.entries(dictionary || {}).forEach(([language, languageDictionary]) => {
            editorContainer.appendChild(createLanguageEditor(language, languageDictionary));
        });
        if (!editorContainer.children.length) {
            editorContainer.appendChild(createLanguageEditor('', {}));
        }
    };

    const refreshDictionary = async (force = false) => {
        await loadTranslationDictionary(force);
        rebuildEditors(translationDictionary);
        try {
            await renderTranslationComponent(element);
        } catch (err) {
            console.error('Failed to refresh translate component:', err);
        }
    };

    await refreshDictionary(true);

    const addLanguageButton = document.createElement('button');
    addLanguageButton.type = 'button';
    addLanguageButton.textContent = 'Add Language';
    addLanguageButton.onclick = () => {
        editorContainer.appendChild(createLanguageEditor('', {}));
    };

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = 'Save Dictionary';
    saveButton.onclick = async () => {
        try {
            const updatedDictionary = collectDictionaryFromEditors(editorContainer);
            await saveTranslationDictionary(updatedDictionary);
            statusMessage.textContent = 'Dictionary saved successfully.';
            await refreshDictionary();
        } catch (err) {
            console.error('Failed to save dictionary:', err);
            statusMessage.textContent = err.message || 'Unable to save dictionary.';
        }
    };

    const importButton = document.createElement('button');
    importButton.type = 'button';
    importButton.textContent = 'Import JSON';
    importButton.onclick = () => importInput.click();

    importInput.onchange = async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            return;
        }
        try {
            const fileContent = await file.text();
            const importedDictionary = JSON.parse(fileContent);
            await importTranslationDictionary(importedDictionary);
            statusMessage.textContent = `Dictionary imported from ${file.name}.`;
            importInput.value = '';
            await refreshDictionary();
        } catch (err) {
            console.error('Failed to import dictionary:', err);
            statusMessage.textContent = err.message || 'Unable to import dictionary.';
        }
    };

    const aiButton = document.createElement('button');
    aiButton.type = 'button';
    aiButton.textContent = 'Generate with AI';
    aiButton.onclick = async () => {
        const promptText = window.prompt('Describe the dictionary you want to generate (languages, keys, etc.):');
        if (!promptText) {
            return;
        }
        try {
            await generateTranslationDictionaryWithAI(promptText, translationDictionary);
            statusMessage.textContent = 'Dictionary generated with AI.';
            await refreshDictionary();
        } catch (err) {
            console.error('Failed to generate dictionary with AI:', err);
            statusMessage.textContent = err.message || 'Unable to generate dictionary with AI.';
        }
    };

    controlsContainer.appendChild(addLanguageButton);
    controlsContainer.appendChild(saveButton);
    controlsContainer.appendChild(importButton);
    controlsContainer.appendChild(aiButton);

    content.appendChild(editorContainer);
    content.appendChild(controlsContainer);
    content.appendChild(importInput);
    content.appendChild(statusMessage);
}


async function renderTranslationComponent(mainDiv) {

    mainDiv.innerHTML = ''; // Clear the mainDiv content

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'translation-loading-indicator';
    loadingIndicator.textContent = 'Loading translations...';
    mainDiv.appendChild(loadingIndicator);

    await loadTranslationDictionary();

    mainDiv.innerHTML = '';
    const floatButton = document.createElement('div');

    floatButton.style.backgroundColor = '#007bff';
    floatButton.style.color = '#fff';
    floatButton.style.padding = '5px';
    floatButton.style.borderRadius = '50%';
    floatButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    floatButton.style.cursor = 'pointer';
    floatButton.textContent = '🌐';
    floatButton.title = 'Select Language';
    floatButton.style.width = '30px';
    floatButton.style.height = '30px';

    const languageSelector = document.createElement('select');
    languageSelector.id = 'landSelector' + Date.now();
    languageSelector.style.position = 'absolute';
    languageSelector.style.width = '150px';
    languageSelector.style.padding = '5px';
    languageSelector.style.border = '1px solid #ccc';
    languageSelector.style.borderRadius = '5px';
    languageSelector.style.display = 'none';

    const languages = Object.keys(translationDictionary || {});
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageSelector.appendChild(option);
    });

    if (!languages.length) {
        languageSelector.disabled = true;
        languageSelector.title = 'No translations configured yet.';
    }

    floatButton.onclick = () => {
        if (languageSelector.disabled) {
            alert('No translations available. Please configure the dictionary.');
            return;
        }
        showlanguageSelector(languageSelector.id);
    };

    languageSelector.onchange = (event) => {
        translatePage(languageSelector.id, event.target.value);
    };

    mainDiv.appendChild(floatButton);
    mainDiv.appendChild(languageSelector);
}

function showlanguageSelector(langSelectorID) {
    const languageSelector = document.getElementById(langSelectorID);
    if (!languageSelector || languageSelector.disabled) {
        return;
    }
    languageSelector.style.display = languageSelector.style.display === 'none' ? 'block' : 'none';
}


/*
function translatePage(language) {
    const dictionary = translationDictionary[language];
    if (!dictionary) {
        alert(`Translation for ${language} is not available.`);
        return;
    }

    document.querySelectorAll('*:not(script):not(style)').forEach(element => {
        if (element.children.length === 0 && element.textContent.trim()) {
            const originalText = element.textContent.trim();
            if (dictionary[originalText]) {
                element.textContent = dictionary[originalText];
            }
        }
    });
}*/

function translatePage(langSelectorID, language) {
    const dictionary = translationDictionary[language];
    const languageSelector = document.getElementById(langSelectorID);
    if (!dictionary) {
        alert(`Translation for ${language} is not available.`);
        return;
    }

    const replaceTextInDOM = (node) => {
        //  console.log(node);
        if (node.nodeType === Node.TEXT_NODE) {
            console.log(node.textContent);
            const textContent = node.textContent.trim();
            if (dictionary[textContent]) {
                node.textContent = dictionary[textContent];
            }
        } else {
            node.childNodes.forEach(child => replaceTextInDOM(child));
        }
    };

    replaceTextInDOM(document.body);
    languageSelector.style.display = 'none';
}
