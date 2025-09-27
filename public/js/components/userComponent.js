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

/**
 * Data storage
 * - This component manipulates modal visibility only and does not persist configuration attributes.
 */


function showUserModal(main) {

    const modal = document.getElementById('userModal');
    modal.classList.toggle('opened-modal');

    // /** Check if clicked outside of modal, if so --> close it **/
    // document.addEventListener('click', event => {
    //   const isClickInside = modal.contains(event.target)

    //   if (!isClickInside && modal.classList.contains('opened-modal')) {
    //     modal.classList.remove('opened-modal');

    //   }
    // })
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'none';
}