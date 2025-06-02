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
function createElementStatic(type) {
//    console.log("createElement:"+type);
    let tagType ="";
    let html="..."
    switch(type) {
        case 'heading1':
            tagType = 'h1';
            html = "Heading 1";
            break;
        case 'heading2':
            tagType = 'h2';
            html = "Heading 2";
            break;
        case 'heading3':
            tagType = 'h3';
            html = "Heading 3";
            break;
        case 'paragraph':
            tagType = 'p';
            html = "Paragraph";
            break;
        case 'container':
            tagType = 'div';
            html = "Container";
            break;
        default:
            console.error("Unknown static element type: " + type);
            return null; // Return null for unsupported types
        
    }
    var main= document.createElement(tagType);
    main.id=type+ Date.now(); // Unique ID for each new element
    main.setAttribute("tagName",type);
    main.innerHTML = html;
    console.log(main);
    return main;
}

function editElementStatic(type,element,content)
{
    // Create and append the elements
     // add to the editor the properties of the element for modify the 
   

}

