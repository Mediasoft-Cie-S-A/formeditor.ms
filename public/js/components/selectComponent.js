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
    var main= document.createElement('div');
    main.className = 'form-container';
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;

    var label=document.createElement('label');  
    label.id=main.id+"Label";
    label.tagName="label";
    label.innerHTML="Text";
    
    main.appendChild(label);
   
    var input = document.createElement('select');
    input.type = type;
    input.id=main.id+"Input";
    input.tagName="select";
    main.appendChild(input)
    return main;
}

function editElementSelect(type,element,content)
{
    // Create and append the elements
 
 
}
