// Translation Dictionary Example (Replace with Google Translate API generated data)
const translationDictionary = {
    
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

    },
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
    "de": {
        // Add German translations here if needed
        "Tableau de bord": "Instrumententafel",
        "Apercu": "Überblick",
        "Analyse": "Analyse",
        "Comptabilité": "Buchhaltung",
        "Clients": "Kunden",
        "Fournisseurs": "Lieferanten",
        "Produits": "Produkte",
        "Stocks": "Bestände",
        "Commandes": "Bestellungen",
        "Factures": "Rechnungen",
        "Paiements": "Zahlungen",
        "Banques": "Banken",
        "Reports": "Berichte",
        "Daily Report": "Täglicher Bericht",
        "Monthly Report": "Monatlicher Bericht"
    },
    "it": {
        // Add Italian translations here if needed
        "Tableau de bord": "Cruscotto",
        "Apercu": "Panoramica",
        "Analyse": "Analisi",
        "Comptabilité": "Contabilità",
        "Clients": "Clienti",
        "Fournisseurs": "Fornitori",
        "Produits": "Prodotti",
        "Stocks": "Scorte",
        "Commandes": "Ordini",
        "Factures": "Fatture",
        "Paiements": "Pagamenti",
        "Banques": "Banche",
        "Reports": "Rapporti",
        "Daily Report": "Rapporto giornaliero",
        "Monthly Report": "Rapporto mensile"
    },
};
// create component
function createTranslateComponent(type) {
    console.log("createTranslateComponent");
    const mainDiv = document.createElement('div');
    mainDiv.setAttribute("tagName", type);
    mainDiv.className = "form-element";
    mainDiv.id = `translateComponent-${Date.now()}`;
 
    renderTranslationComponent(mainDiv);
    return mainDiv;
}

// edit component
function editTranslateComponent(type, element, content) {
    // Add translation dictionary editor here
    // update button translation
    const updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.onclick = () => {
        // Update translation dictionary from the editor
        // get the language name and dictionary
        const languageBoxes = content.querySelectorAll("div[tagName='language']");
        languageBoxes.forEach(languageBox => {
            const languageName = languageBox.querySelector("input").value;
            const languageDictionary = languageBox.querySelector("textarea").value;
            translationDictionary[languageName] = JSON.parse(languageDictionary);
        });
      
    };
    content.appendChild(updateButton);

    // Add translation languages button
    const addLanguageButton = document.createElement("button");
    addLanguageButton.textContent = "Add Language";
    addLanguageButton.onclick = () => {
        console.log("addLanguageButton");
      // generate a box to add a new language
        const newLanguageBox = document.createElement("div");
        newLanguageBox.tagName = "language";
        const languageNameInput = document.createElement("input");
        languageNameInput.placeholder = "Language Name";
        const languageDictionaryInput = document.createElement("textarea");
        languageDictionaryInput.placeholder = "Language Dictionary";
        newLanguageBox.appendChild(languageNameInput);
        newLanguageBox.appendChild(languageDictionaryInput);
        content.appendChild(newLanguageBox);
    
    };
    content.appendChild(addLanguageButton);

}


function renderTranslationComponent( mainDiv) {
   
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
    languageSelector.id = 'landSelector'+Date.now();
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

    floatButton.setAttribute('onclick', `showlanguageSelector('${languageSelector.id}')`);
    

    languageSelector.setAttribute('onchange', `translatePage('${languageSelector.id}', this.value)`);
    
  
    mainDiv.appendChild(floatButton);
    mainDiv.appendChild(languageSelector);
}

function showlanguageSelector(langSelectorID){
  const languageSelector = document.getElementById(langSelectorID);
    languageSelector.style.display = languageSelector.style.display === 'none' ? 'block' : 'none'
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

function translatePage(langSelectorID,language) {
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
