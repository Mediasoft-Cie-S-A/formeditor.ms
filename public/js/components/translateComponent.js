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

const LANGUAGE_COOKIE_NAME = 'preferredLanguage';
const LANGUAGE_SESSION_KEY = 'preferredLanguage';
const CURRENT_USER_STORAGE_KEY = 'currentUser';
const USER_LANGUAGE_PATHS = [
    ['preferredLanguage'],
    ['language'],
    ['lang'],
    ['locale'],
    ['parameters', 'preferredLanguage'],
    ['parameters', 'language'],
    ['parameters', 'lang'],
    ['parameters', 'locale'],
    ['preferences', 'preferredLanguage'],
    ['preferences', 'language'],
    ['preferences', 'lang'],
    ['preferences', 'locale'],
    ['settings', 'preferredLanguage'],
    ['settings', 'language'],
];

function setCookie(name, value, options = {}) {
    if (typeof document === 'undefined') {
        return;
    }
    const { days = 365, path = '/' } = options;
    let cookie = `${name}=${encodeURIComponent(value)}; path=${path}; SameSite=Lax`;
    if (typeof days === 'number') {
        const maxAge = Math.round(days * 24 * 60 * 60);
        cookie += `; max-age=${maxAge}`;
    }
    document.cookie = cookie;
}

function getCookie(name) {
    if (typeof document === 'undefined') {
        return null;
    }
    const cookies = (document.cookie || '').split(';');
    for (const cookie of cookies) {
        const [key, ...rest] = cookie.trim().split('=');
        if (key === name) {
            return decodeURIComponent(rest.join('='));
        }
    }
    return null;
}

function safeGetStorageItem(storage, key) {
    try {
        if (storage) {
            return storage.getItem(key);
        }
    } catch (err) {
        console.warn('Unable to access storage item', key, err);
    }
    return null;
}

function safeSetStorageItem(storage, key, value) {
    try {
        if (storage) {
            storage.setItem(key, value);
            return true;
        }
    } catch (err) {
        console.warn('Unable to persist storage item', key, err);
    }
    return false;
}

function getStoredUser() {
    if (typeof window !== 'undefined' && window.currentUser && typeof window.currentUser === 'object') {
        return window.currentUser;
    }

    if (typeof window !== 'undefined') {
        const stored =
            safeGetStorageItem(window.sessionStorage, CURRENT_USER_STORAGE_KEY) ||
            safeGetStorageItem(window.localStorage, CURRENT_USER_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object') {
                    return parsed;
                }
            } catch (err) {
                console.warn('Unable to parse stored user information', err);
            }
        }
    }

    return null;
}

function persistCurrentUser(user) {
    if (typeof window === 'undefined' || !user || typeof user !== 'object') {
        return;
    }

    window.currentUser = user;
    let serialized;
    try {
        serialized = JSON.stringify(user);
    } catch (err) {
        console.warn('Unable to serialise user information', err);
        return;
    }

    const sessionSaved = safeSetStorageItem(window.sessionStorage, CURRENT_USER_STORAGE_KEY, serialized);
    safeSetStorageItem(window.localStorage, CURRENT_USER_STORAGE_KEY, serialized);

    if (sessionSaved) {
        try {
            document.dispatchEvent(new CustomEvent('userChanged', { detail: { user } }));
        } catch (err) {
            console.warn('Unable to dispatch userChanged event', err);
        }
    }
}

function getNestedValue(source, path) {
    return path.reduce((value, key) => {
        if (value && typeof value === 'object' && key in value) {
            return value[key];
        }
        return undefined;
    }, source);
}

function getUserLanguagePreference() {
    const user = getStoredUser();
    if (!user) {
        return null;
    }

    for (const path of USER_LANGUAGE_PATHS) {
        const value = getNestedValue(user, path);
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }

    return null;
}

function setUserLanguagePreference(language) {
    if (!language) {
        return;
    }

    const user = getStoredUser();
    if (!user) {
        return;
    }

    const currentPreference = getUserLanguagePreference();
    if (currentPreference === language) {
        const existingParameters = user.parameters && typeof user.parameters === 'object' ? user.parameters : null;
        const currentParameterLanguage = existingParameters && (existingParameters.language || existingParameters.preferredLanguage);
        if (currentParameterLanguage === language) {
            return;
        }
    }

    const updatedUser = { ...user, preferredLanguage: language };

    if (user.parameters && typeof user.parameters === 'object') {
        updatedUser.parameters = { ...user.parameters, language, preferredLanguage: language };
    } else {
        updatedUser.parameters = { language, preferredLanguage: language };
    }

    if (user.preferences && typeof user.preferences === 'object') {
        updatedUser.preferences = { ...user.preferences, language, preferredLanguage: language };
    }

    persistCurrentUser(updatedUser);
}

function getSessionLanguagePreference() {
    if (typeof window === 'undefined') {
        return null;
    }
    return safeGetStorageItem(window.sessionStorage, LANGUAGE_SESSION_KEY);
}

function persistSessionLanguagePreference(language) {
    if (typeof window === 'undefined' || !language) {
        return false;
    }
    return safeSetStorageItem(window.sessionStorage, LANGUAGE_SESSION_KEY, language);
}

function determineInitialLanguage(languages) {
    if (!Array.isArray(languages) || !languages.length) {
        return { language: null, needsPersistence: false };
    }

    const cookieLanguage = (getCookie(LANGUAGE_COOKIE_NAME) || '').trim();
    if (cookieLanguage && languages.includes(cookieLanguage)) {
        return { language: cookieLanguage, needsPersistence: false };
    }

    const sessionLanguage = (getSessionLanguagePreference() || '').trim();
    if (sessionLanguage && languages.includes(sessionLanguage)) {
        const needsPersistence = !cookieLanguage;
        return { language: sessionLanguage, needsPersistence };
    }

    const userLanguage = (getUserLanguagePreference() || '').trim();
    if (userLanguage && languages.includes(userLanguage)) {
        return { language: userLanguage, needsPersistence: true };
    }

    const fallbackLanguage = languages[0];
    return { language: fallbackLanguage, needsPersistence: true };
}

function persistPreferredLanguage(language) {
    if (!language) {
        return;
    }
    setCookie(LANGUAGE_COOKIE_NAME, language, { days: 365, path: '/' });
    persistSessionLanguagePreference(language);
    setUserLanguagePreference(language);
}

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

    const { language: initialLanguage, needsPersistence } = determineInitialLanguage(languages);
    if (initialLanguage) {
        languageSelector.value = initialLanguage;
        translatePage(languageSelector.id, initialLanguage, { persistPreference: needsPersistence });
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

function translatePage(langSelectorID, language, options = {}) {
    const { persistPreference = true } = options;
    const dictionary = translationDictionary[language];
    const languageSelector = document.getElementById(langSelectorID);
    if (!dictionary) {
        alert(`Translation for ${language} is not available.`);
        return;
    }

    if (persistPreference) {
        persistPreferredLanguage(language);
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
