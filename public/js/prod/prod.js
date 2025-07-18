document.addEventListener("DOMContentLoaded", function () {
  const mainApplication = document.getElementById("mainApplication");

  if (!mainApplication) {
    console.error("❌ mainApplication container introuvable !");
    return;
  }

  console.log("✅ mainApplication trouvé, chargement de la Home Page...");
  loadFormData("Home", mainApplication);

  waitForDashboard();



});


// function sleep(ms) {
//   console.log("sleep");
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function waitForDashboard() {
//   let screen = null;
//   let attempts = 0;
//   const maxAttempts = 20; // max ~2s (20 * 100ms)

//   while (!screen && attempts < maxAttempts) {
//     screen = document.getElementById("formContainer");
//     if (!screen) {
//       await sleep(500); // attends 100ms
//       attempts++;
//     }
//   }

//   if (screen) {
//     console.log("✅ Home trouvé :", screen);
//     // tu peux maintenant faire ce que tu veux avec `screen`, ex :
//     loadFormData("Home", screen);
//   } else {
//     console.error("❌ Home introuvable après plusieurs tentatives");
//   }
// }

