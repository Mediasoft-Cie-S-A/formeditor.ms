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

function createElementImage(type) {
  
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
    // addinput for image src
    content.appendChild(createInputItem("imageSrcInput", "Source", "Source",element.getAttribute('src'),"text"));
    // button to open media library to select image
    const button = document.createElement("button");
    button.textContent = "Select Image";
    button.onclick = () => openMediaLibrary(element);
    content.appendChild(button);
    // add input for image alt
       
    content.appendChild(createInputItem("alt", "alt", "alt",element.getAttribute('alt'),"text"));
}

function openMediaLibrary(targetElement) {
    const mediaLibraryWindow = window.open('/media-library', 'Media Library', 'width=800,height=600');

    // Listener for image selection
    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return; // Ensure messages are from the same origin

        const selectedImage = event.data;
        if (selectedImage && targetElement) {
            targetElement.setAttribute('src', selectedImage);
        }
    }, { once: true });
}