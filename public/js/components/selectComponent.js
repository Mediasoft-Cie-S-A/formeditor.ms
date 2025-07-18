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
function createElementSelect(type) {
    var main = document.createElement('div');
    main.className = 'form-container';
    main.id = type + Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName = type;

    var label = document.createElement('label');
    label.id = main.id + "Label";
    label.tagName = "label";
    label.innerHTML = "Text";

    main.appendChild(label);

    var input = document.createElement('select');
    input.type = type;
    input.id = main.id + "Input";
    input.tagName = "select";
    main.appendChild(input)
    return main;
}

function editElementSelect(type, element, content) {
    // generate the list of options
    var optionsList = document.createElement('div');
    // generate a label for the list
    var label = document.createElement('label');
    label.innerHTML = "Options: value, label";
    optionsList.appendChild(label);
    // generate a textarea for the list
    var textarea = document.createElement('textarea');
    textarea.id = element.id + "Options";
    textarea.value = element.getAttribute("options");
    // adding to the textarea onchage event to update the options
    textarea.onchange = function () { updateOptions(element.id, textarea.value) };
    optionsList.appendChild(textarea);
    content.appendChild(optionsList);

}

// generate the options list
function updateOptions(elementId, options) {
    var element = document.getElementById(elementId);
    element.setAttribute("options", options);
    var optionsList = document.getElementById(elementId + "Input");
    optionsList.innerHTML = "";
    var optionsArray = options.split("\n");
    optionsArray.forEach(option => {
        // if the option is empty, skip it
        if (option == "") return;
        // split the option in value and label
        var optionArray = option.split(",");
        // if the comman is missing, use the value as label
        if (optionArray.length == 1) {
            optionArray[1] = optionArray[0];
        }
        // create the option element
        var optionElement = document.createElement("option");
        optionElement.value = optionArray[0];
        optionElement.innerHTML = optionArray[1];
        // add the option to the select
        optionsList.appendChild(optionElement);

    });
}
