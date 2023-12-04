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

/*This function createElementButton creates a new HTML element of a given type,
sets its text content to the type, adds two event listeners to it, and returns the created element. 
The double-click event listener calls the editElement function with the element and its type as arguments,
 and the click event listener calls the selectElement function with the element as an argument.
*/
function createElementButton(type) {
    element = document.createElement(type);
            element.textContent = type;
            element.addEventListener('dblclick', function(){ editElement(element,type); });
            element.addEventListener('click', function(){ selectElement(element); });
    return element;
}

function editElementButton(type,element,content)
{
    var textContentDiv = createInputDiv("textContent", "Value:", updateElementTxtC,element.textContent);
    var clickDiv = createInputDiv("click", "OnClick Event:", updateElementOnChange,"");

    content.appendChild(textContentDiv);
    content.appendChild(clickDiv);

}