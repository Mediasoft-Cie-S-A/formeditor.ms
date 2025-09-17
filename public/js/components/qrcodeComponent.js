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

/**
 * Data storage
 * - qrvalue: plain string used to generate the QR code payload.
 * - qrsize: numeric string controlling the rendered QR dimension.
 */

function createQRCode(type) {

    console.log("createElement:" + type);
    var main = document.createElement('div');
    main.classList.add('form-container');

    main.id = type + Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName = type;
    main.setAttribute("qrvalue", "example");
    main.setAttribute("qrsize", "300");
    main.appendChild(showQRCode("example", 300));

    return main;

}

function editQRCode(type, element, content) {
    // generate the label and input for the qrcode value
    var label = document.createElement('label');
    label.innerHTML = "QRCode value";
    content.appendChild(label);
    var textarea = document.createElement('textarea');
    textarea.id = element.id + "QRCodeValue";
    textarea.value = element.getAttribute("qrvalue");
    // adding to the textarea onchage event to update the options
    textarea.onchange = function () {
        // update the qr value
        element.setAttribute("qrvalue", textarea.value);
        // update the qr code
        updateQRCode(element)
    };
    content.appendChild(textarea);
    // generate the label and input for the qrcode size
    var label = document.createElement('label');
    label.innerHTML = "QRCode size";
    content.appendChild(label);
    var input = document.createElement('input');
    input.id = element.id + "QRCodeSize";
    input.value = element.getAttribute("qrsize");
    // adding to the textarea onchage event to update the options
    input.onchange = function () {
        // update the qr value
        element.setAttribute("qrsize", input.value);
        // update the qr code
        updateQRCode(element)
    };
    content.appendChild(input);

}

function updateQRCode(element) {
    //get the value of the element
    var text = element.getAttribute("qrvalue");
    var size = parseInt(element.getAttribute("qrsize"));
    // get the element
    element.replaceChild(showQRCode(text, size), element.firstChild);

}


// Generates a QRCode of text provided.
// First QRCode is rendered to a canvas.
// The canvas is then turned to an image PNG
// before being returned as an <img> tag.
function showQRCode(text, size) {


    var dotsize = 5;  // size of box drawn on canvas
    var padding = 10; // (white area around your QRCode)
    var black = "rgb(0,0,0)";
    var white = "rgb(255,255,255)";
    var QRCodeVersion = 15; // 1-40 see http://www.denso-wave.com/qrcode/qrgene2-e.html

    var canvas = document.createElement('canvas');
    var qrCanvasContext = canvas.getContext('2d');
    try {
        // QR Code Error Correction Capability 
        // Higher levels improves error correction capability while decreasing the amount of data QR Code size.
        // QRErrorCorrectLevel.L (5%) QRErrorCorrectLevel.M (15%) QRErrorCorrectLevel.Q (25%) QRErrorCorrectLevel.H (30%)
        // eg. L can survive approx 5% damage...etc.
        var qr = new QRCode(QRCodeVersion, QRErrorCorrectLevel.L);
        qr.addData(text);
        qr.make();
    }
    catch (err) {
        var errorChild = document.createElement("p");
        var errorMSG = document.createTextNode("QR Code FAIL! " + err);
        errorChild.appendChild(errorMSG);
        return errorChild;
    }
    // compute tileW/tileH based on size of QRCode and padding
    var qrsize = (size * dotsize * 3) / qr.getModuleCount();
    console.log(qr.getModuleCount());
    console.log("qrsize:" + qrsize);
    canvas.setAttribute('height', (qrsize * dotsize) + padding);
    canvas.setAttribute('width', (qrsize * dotsize) + padding);
    var shiftForPadding = padding / 2;
    if (canvas.getContext) {
        for (var r = 0; r < qrsize; r++) {
            for (var c = 0; c < qrsize; c++) {
                if (qr.isDark(r, c))
                    qrCanvasContext.fillStyle = black;
                else
                    qrCanvasContext.fillStyle = white;
                qrCanvasContext.fillRect((c * dotsize) + shiftForPadding, (r * dotsize) + shiftForPadding, dotsize, dotsize);   // x, y, w, h
            }
        }
    }

    var imgElement = document.createElement("img");
    imgElement.src = canvas.toDataURL("image/png");

    return imgElement;

}

