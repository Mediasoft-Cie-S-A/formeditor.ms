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

const e = require("express");

function createElementImage(type) {
    console.log("createElementImage");
    element = document.createElement('img');
            element.src="/img/empty.png";
    element.id=type+ Date.now(); // Unique ID for each new element
    element.tagName=type;
            element.setAttribute('alt', 'na');
            element.setAttribute('height', '1px');
            element.setAttribute('width', '1px');
    return element;
}

function editElementImage(type,element,content)
{
    var textContentDiv = createInputDiv("src", "src:", updateElementTxtC,element.src);
    var clickDiv = createInputDiv("click", "OnChange Event:", updateElementOnChange,"");
    

    content.appendChild(textContentDiv);
    content.appendChild(clickDiv);
    content.appendChild(createInputItem("alt", "alt", "alt",element.getAttribute('alt'),"text"));
}