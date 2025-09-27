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
    let tagType = "";
    let html = "..."
    switch (type) {
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
        case 'line':
            tagType = 'hr';
            html = ""; // Horizontal line, no inner HTML
            break;
        case 'link':
            tagType = 'a';
            html = "Link";
            break;
        case 'quote':
            tagType = 'blockquote';
            html = "Quote";
            break;
        case 'iframe':
            tagType = 'iframe';
            html = '<iframe src="https://example.com" width="100%" height="300px"></iframe>';
            break;
        case 'code':
            tagType = 'pre';
            html = '<code>Code block</code>';
            break;
        case 'list':
            tagType = 'ul';
            html = '<li>List item 1</li><li>List item 2</li>';
            break;
        case 'table':
            tagType = 'table';
            html = '<tr><td>Cell 1</td><td>Cell 2</td></tr>';
            break;
        default:
            console.error("Unknown static element type: " + type);
            return null; // Return null for unsupported types

    }
    var main = document.createElement(tagType);
    main.id = type + Date.now(); // Unique ID for each new element
    main.setAttribute("tagName", type);
    main.innerHTML = html;
    console.log(main);
    return main;
}

function editElementStatic(type, element, content) {
    // Create and append the elements
    // add to the editor the properties of the element for modify the 


}

