/*!
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
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("confirmClearModal");
  const confirmBtn = document.getElementById("confirmClearYes");
  const cancelBtn = document.getElementById("confirmClearCancel");

  window.showClearConfirmation = function () {
    modal.style.display = "flex";
  };

  window.confirmClear = function (confirmed) {
    modal.style.display = "none";
    if (confirmed) {
      const formContainer = document.getElementById("formContainer");
      if (formContainer) {
        formContainer.innerHTML = "";
      }
    }
  };

  confirmBtn.addEventListener("click", () => confirmClear(true));
  cancelBtn.addEventListener("click", () => confirmClear(false));
});
