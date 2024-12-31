// Translation Dictionary Example (Replace with Google Translate API generated data)
const translationDictionary = {
    "en": {
        "Tableau de bord": "Dashboard",
        "Apercu": "Overview",
        "Analyse": "Analysis",
        "Comptabilité": "Accounting",
        "Clients": "Clients",
        "Fournisseurs": "Suppliers",
        "Produits": "Products",
        "Stocks": "Stocks",
        "Commandes": "Orders",
        "Factures": "Invoices",
        "Paiements": "Payments",
        "Banques": "Banks",
        "Reports": "Reports",
        "Daily Report": "Daily Report",
        "Monthly Report": "Monthly Report"
    },
    "fr": {
        // Add French translations here if needed
        "Tableau de bord": "Tableau de bord",
        "Apercu": "Apercu",
        "Analyse": "Analyse",
        "Comptabilité": "Comptabilité",
        "Clients": "Clients",
        "Fournisseurs": "Fournisseurs",
        "Produits": "Produits",
        "Stocks": "Stocks",
        "Commandes": "Commandes",
        "Factures": "Factures",
        "Paiements": "Paiements",

    }
};
// create component
function createTranslateComponent(type) {
    console.log("createTranslateComponent");
    const mainDiv = document.createElement('div');
    mainDiv.setAttribute("tagName", type);
    mainDiv.className = "form-element";
    mainDiv.id = `translateComponent-${Date.now()}`;
 
    renderTranslationComponent(type, mainDiv);
    return mainDiv;
}

// edit component
function editTranslateComponent(type, element, content) {
    // Add translation dictionary editor here
    // update button translation
    const updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.onclick = () => {
        // Update translation dictionary
        const translationDictionary = JSON.parse(content.querySelector('#translationDictionaryInput').value);
        window.translationDictionary = translationDictionary;
    };
    content.appendChild(updateButton);
}


function renderTranslationComponent(type, mainDiv) {
   
    const floatButton = document.createElement('div');
   // floatButton.style.position = 'fixed';
   
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
    languageSelector.style.position = 'absolute';
    languageSelector.style.width = '150px';
    languageSelector.style.padding = '5px';
    languageSelector.style.border = '1px solid #ccc';
    languageSelector.style.borderRadius = '5px';
    languageSelector.style.display = 'none';

    Object.keys(translationDictionary).forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        languageSelector.appendChild(option);
    });

    floatButton.onclick = () => {
        languageSelector.style.display = languageSelector.style.display === 'none' ? 'block' : 'none';
    };

    languageSelector.onchange = () => {
        const selectedLanguage = languageSelector.value;
        translatePage(selectedLanguage);
        languageSelector.style.display = 'none';
    };

    mainDiv.appendChild(floatButton);
    mainDiv.appendChild(languageSelector);
}

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
}

