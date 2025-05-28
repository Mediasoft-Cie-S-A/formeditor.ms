// js/renderReadOnly.js

/**
 * Construit récursivement un élément DOM à partir d'un objet JSON
 */
function buildElement(jsonNode) {
  if (jsonNode.text) {
    return document.createTextNode(jsonNode.text);
  }
  if (!jsonNode.tag) {
    console.warn("⚠️ Élément sans tag:", jsonNode);
    return null;
  }

  const el = document.createElement(jsonNode.tag);

  if (jsonNode.attributes) {
    for (const [key, value] of Object.entries(jsonNode.attributes)) {
      el.setAttribute(key, value);
    }
  }

  if (jsonNode.children && Array.isArray(jsonNode.children)) {
    for (const child of jsonNode.children) {
      const childEl = buildElement(child);
      if (childEl) el.appendChild(childEl);
    }
  }

  return el;
}

/**
 * Rend un JSON formData sous forme de DOM dans le conteneur #renderContainer
 */
function renderScreen(formData) {
  const container = document.getElementById("renderContainer");
  if (!container) {
    console.error("❌ Container 'renderContainer' introuvable.");
    return;
  }


  for (const element of formData) {
    const domElement = buildElement(element);
    if (domElement) container.appendChild(domElement);
    else console.warn("⚠️ Element non rendu :", element);
  }

}

// ✅ Attendre que le DOM soit prêt AVANT de parser ou insérer
document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("📌 DOM loaded");

    const rawJson = document.getElementById("homePageData").textContent;
    let parsedData;
    try {
      parsedData = JSON.parse(rawJson);
      if (typeof parsedData === 'string') {
        parsedData = JSON.parse(parsedData);  // double parsing nécessaire
      }
    } catch (err) {
      console.error("❌ Problème de parsing JSON :", err);
    }
    
    console.log("✅ Résultat après parsing :", parsedData);
    renderScreen(parsedData);
    
  } catch (err) {
    console.error("❌ Erreur lors du parsing JSON homePageData :", err);
  }
});
