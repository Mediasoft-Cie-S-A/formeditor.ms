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
function createElementInput(type) {
    //    console.log("createElement:"+type);
    var main = document.createElement('div');
    main.className = 'form-container';
    main.id = type + Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName = type;

    var label = document.createElement('label');
    label.innerHTML = type;
    label.id = main.id + "Label";
    label.tagName = "label";
    main.appendChild(label);
    if (type === 'textarea') {
        var input = document.createElement('textarea');
        input.tagName = "input";
        input.className = "input-element textarea-element";
        input.id = main.id + "Textarea";
        input.tagName = "textarea";
        input.placeholder = "";
        main.appendChild(input)
    } else {
        var input = document.createElement('input');
        input.type = type;
        if (type === 'checkbox') {
            input.className = "apple-switch";
        } else {
            input.className = "input-element";
        }
        input.id = main.id + "Input";
        input.tagName = "input";
        input.placeholder = "";
        main.appendChild(input)
    }
    main.innerHTML += `<img class="miniLoader" style="display: none;" src="/img/loader.gif" alt="Loading...">`;
    return main;
}

function editElementInput(type, element, content) {
    // Create and append the elements
    // add to the editor the properties of the element for modify the 


}

// activate the loaders 
function activateLoaders() {
    const loaders = document.querySelectorAll(".miniLoader");
    loaders.forEach((loader) => {
        loader.style.display = "inline-block";
    });

}

// deactivate the loaders
function deactivateLoaders() {
    const loaders = document.querySelectorAll(".miniLoader");
    loaders.forEach((loader) => {
        loader.style.display = "none";
    }
    );
}