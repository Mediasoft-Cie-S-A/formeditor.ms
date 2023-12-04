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
    console.log("createElement:"+type);
    var main= document.createElement('div');
    main.className = 'form-container';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;
    main.addEventListener('dblclick', function(){ editElement(main,type); });
    main.addEventListener('click', function(){ selectElement(main); });
    var label=document.createElement('label');  
    label.innerHTML=type;    
    main.appendChild(label);   
    var input = document.createElement('input');
    input.type = type;
    main.appendChild(input)
    return main;
}

function editElementInput(type,element,content)
{
    // Create and append the elements
    var labelDiv = createInputDiv("label", "Text:", updateElementText,element.querySelector('label').innerText);
    var textDiv = createInputDiv("text", "Value:", updateElementValue,element.querySelector('input').value);
    var checkedDiv = createInputDiv("sld", "checked", function(value) { updateElementStyle('checked', value); },element.querySelector('input').checked);
    var onChangeDiv = createInputDiv("change", "OnChange Event:", updateElementOnChange,"");

    content.appendChild(labelDiv);
    content.appendChild(textDiv);
    content.appendChild(checkedDiv);
    content.appendChild(onChangeDiv);

}