const apiKey = "e7f4b0f3-5c6b-4a29-b821-93f0d99d1cb6"; // remplace avec ta vraie clé
const url = "/get-form/login"; // remplace avec ton formId réel

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("formContainer");
    if (!container) {
        console.error("❌ formContainer introuvable dans la page");
        return;
    }

    fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "api_key": apiKey
        }
    })
        .then(response => {
            if (!response.ok) throw new Error("Erreur réseau : " + response.status);
            return response.json();
        })
        .then(data => {
            console.log("✅ Données reçues :", data);
            jsonToDom(data.formData, container);
            renderElements(container);
        })
        .catch(error => {
            console.error("💥 Erreur lors du fetch :", error);
        });
});
