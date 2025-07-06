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
function createQRCodeScanner(type){
    var main= document.createElement('div');
    main.classList.add('form-container');
    main.id=type+ Date.now(); // Unique ID for each new element
    main.draggable = true;
    main.tagName=type;
    const qrCodeScanner = document.createElement('div');
    qrCodeScanner.id="QRScan"+Date.now();
    qrCodeScanner.tagName="QRScan";
    qrCodeScanner.style.width="500px";
    main.appendChild(qrCodeScanner);
    const qrCodeScannerResult = document.createElement('div');
    qrCodeScannerResult.id="QRScanResult"+Date.now();
    qrCodeScannerResult.tagName="QRScanResult";
    main.appendChild(qrCodeScannerResult);
    const qrCodeScannerButton = document.createElement('button');
    qrCodeScannerButton.innerHTML="Scan QRCode";
    qrCodeScannerButton.setAttribute("onclick","startScanner('"+qrCodeScanner.id+"')");
      

    main.appendChild(qrCodeScannerButton);

    return main;
}

function editQRCodeScanner(type,element,content)
{

}
function startScanner(ID)
{
    var html5QrcodeScanner = new Html5QrcodeScanner(
        ID, { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess);
}

function onScanSuccess(decodedText, decodedResult) {
    if (decodedText !== lastResult) {
        ++countResults;
        lastResult = decodedText;
        // Handle on success condition with the decoded message.
        console.log(`Scan result ${decodedText}`, decodedResult);
    }
}