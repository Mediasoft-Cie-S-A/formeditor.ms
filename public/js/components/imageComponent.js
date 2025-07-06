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
            element.setAttribute('height', '150px');
            element.setAttribute('width', '150px');
    return element;
}

function editElementImage(type, element, content) {
    const updateButton = document.createElement("button");
    updateButton.textContent = "Update";
    updateButton.onclick = () => {
        // Update image src and alt
        const srcInput = content.querySelector('#imageSrcInput');
        const altInput = content.querySelector('#imageAltInput');
        const heightInput = content.querySelector('#imageHeightInput');
        const widthInput = content.querySelector('#imageWidthInput');
        element.setAttribute('height', heightInput.value);
        element.setAttribute('width', widthInput.value);
        element.setAttribute('src', srcInput.value);
        element.setAttribute('alt', altInput.value);
    };
    content.appendChild(updateButton);

    // Image source input
    content.appendChild(createInputItem("imageSrcInput", "Source", "Source", element.getAttribute('src'), "text"));

    // Button to open media library
    const button = document.createElement("button");
    button.textContent = "Select Image";
    button.onclick = () => openMediaLibrary(element);
    content.appendChild(button);

    // Size and alt inputs
    content.appendChild(createInputItem("imageHeightInput", "height", "height", element.getAttribute('height'), "text"));
    content.appendChild(createInputItem("imageWidthInput", "width", "width", element.getAttribute('width'), "text"));
    content.appendChild(createInputItem("imageAltInput", "alt", "alt", element.getAttribute('alt'), "text"));

    // Positioning radio buttons
    const positionLabel = document.createElement("label");
    positionLabel.textContent = "Position in container:";
    positionLabel.style.marginTop = "10px";
    positionLabel.style.display = "block";
    content.appendChild(positionLabel);

    const positions = [
        { label: "Top Left", value: "top-left" },
        { label: "Top Center", value: "top-center" },
        { label: "Top Right", value: "top-right" },
        { label: "Bottom Left", value: "bottom-left" },
        { label: "Bottom Center", value: "bottom-center" },
        { label: "Bottom Right", value: "bottom-right" }
    ];

    const radioGroup = document.createElement("div");
    radioGroup.style.display = "grid";
    radioGroup.style.gridTemplateColumns = "repeat(3, auto)";
    radioGroup.style.gap = "6px";

    positions.forEach(pos => {
        const wrapper = document.createElement("label");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.gap = "4px";

        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "imagePosition";
        radio.value = pos.value;

        radio.onclick = () => applyImagePosition(element, pos.value);

        wrapper.appendChild(radio);
        wrapper.appendChild(document.createTextNode(pos.label));
        radioGroup.appendChild(wrapper);
    });

    content.appendChild(radioGroup);
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

function applyImagePosition(element, position) {
    const parent = element.parentElement;
    if (!parent) return;

    // Ensure parent is relatively positioned
    if (window.getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
    }

    element.style.position = "absolute";

    // Reset all directions
    element.style.top = "";
    element.style.bottom = "";
    element.style.left = "";
    element.style.right = "";
    element.style.transform = "";

    switch (position) {
        case "top-left":
            element.style.top = "0";
            element.style.left = "0";
            break;
        case "top-center":
            element.style.top = "0";
            element.style.left = "50%";
            element.style.transform = "translateX(-50%)";
            break;
        case "top-right":
            element.style.top = "0";
            element.style.right = "0";
            break;
        case "bottom-left":
            element.style.bottom = "0";
            element.style.left = "0";
            break;
        case "bottom-center":
            element.style.bottom = "0";
            element.style.left = "50%";
            element.style.transform = "translateX(-50%)";
            break;
        case "bottom-right":
            element.style.bottom = "0";
            element.style.right = "0";
            break;
    }
}
