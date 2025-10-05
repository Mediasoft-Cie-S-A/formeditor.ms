
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
 * - This explorer reads the filesystem dynamically and does not persist configuration data on the element.
 */



function createElementFileExplorer(type) {
    fileExplorer = document.createElement(type);
    fileExplorer.textContent = type;
    fileExplorer.id = type + Date.now(); // Unique ID for each new element
    fileExplorer.tagName = type;
    fileExplorer.className = 'button';


    readFolder("/tmp/GED", fileExplorer);
    return fileExplorer;
}

function editElementFileExplorer(type, element, content) {

}

function readFolder(path, fileExplorer, filter) {
    // get the file explorer json fileExplorer?directory=/
    fileExplorer.innerHTML = "";
    // recive file drop event in order to upload files
    fileExplorer.ondrop = function (event) { uploadFile(event, path, fileExplorer) };

    const table = document.createElement('table');
    fileExplorer.appendChild(table);
    table.className = "fileExplorerTable";
    fileExplorer.appendChild(table);
    const thead = document.createElement('thead');
    thead.className = "fileExplorerThead";
    var tr = document.createElement('tr');
    tr.className = "fileExplorerTr";
    const th0 = document.createElement('th');
    // directory path up
    th0.innerHTML = "<i class='fas fa-folder-open' style='color:#FFC300'></i>";
    th0.title = "Go to parent folder";

    th0.onclick = function () { readFolder(path.substring(0, path.lastIndexOf("/")), fileExplorer) };
    const th1 = document.createElement('th');
    // file filter input
    th1.innerHTML = "<input type='text' id='fileFilter' placeholder='Filter files' onkeyup='readFolder(path,fileExplorer,this.value)'>";
    const th2 = document.createElement('th');
    th2.innerHTML = "Size";
    const th3 = document.createElement('th');
    th3.innerHTML = "Created Date";
    tr.appendChild(th0);
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    thead.appendChild(tr);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    tbody.className = "fileExplorerTbody";
    table.appendChild(tbody);

    const url = '/fileExplorer?directory=' + path;
    apiFetch(url)
        .then(response => {
            if (!response.ok) {
                showToast('Error: ' + response.statusText);
            }
            return response.json();
        }).catch(error => {
            showToast('Error: ' + error);
        }).then(data => {


            // add the files to the list
            data.forEach(element => {
                // create the list of files
                const tr = document.createElement('tr');


                switch (element.fileType) {
                    case "file":
                        // extract the file extension
                        var extension = element.fileName.split('.').pop();
                        // assign the icon in the icon variable for each extension
                        var icon = 'fa-file';
                        var iconColor = 'color: #000;';
                        switch (extension) {
                            case 'pdf':
                                icon = 'fa-file-pdf';
                                iconColor = 'color: #d9534f;';
                                break;
                            case 'doc':
                            case 'docx':
                            case 'odt':
                                icon = 'fa-file-word';
                                iconColor = 'color: #5bc0de;';
                                break;
                            case 'xls':
                            case 'xlsx':
                            case 'csv':
                                icon = 'fa-file-excel';
                                iconColor = 'color: #5cb85c;';
                                break;
                            case 'ppt':
                            case 'pptx':
                                icon = 'fa-file-powerpoint';
                                iconColor = 'color: #f0ad4e;';
                                break;
                            case 'jpg':
                            case 'jpeg':
                            case 'png':
                            case 'gif':
                                icon = 'fa-file-image';
                                iconColor = 'color: #d9534f;';
                                break;
                            case 'txt':
                                icon = 'fa-file-alt';
                                iconColor = 'color: #5bc0de;';
                                break;
                            case 'zip':
                            case 'rar':
                                icon = 'fa-file-archive';
                                iconColor = 'color: #f0ad4e;';
                                break;
                            default:
                                icon = 'fa-file';
                                iconColor = 'color: #bbb;';
                                break;
                        }
                        // create div with icon, file name and file size, created date
                        const divFile = `<td><i class="fas ${icon}" style="${iconColor}"></i></td><td>${element.fileName}</td><td>${element.size} bytes</td><td>${element.createdDate}</td>`;
                        tr.innerHTML = divFile;
                        break;
                    case "folder":
                        tr.innerHTML = "<td><i class='fas fa-folder' style='color:#FFC300'></i></td><td colspan='3' >" + element.fileName + "</td>";
                        const newpath = path + "/" + element.fileName;
                        tr.onclick = function () { readFolder(newpath, fileExplorer) };
                        break;
                    default:
                        break;

                }

                tbody.appendChild(tr);
            });
        });


}


function uploadFile(event, path, fileExplorer) {
    // upload file to the server with multipart/form-data
    event.preventDefault();
    event.stopPropagation();
    var files = event.dataTransfer.files;
    var formData = new FormData();
    var url = '/uploadMultiFile?path=' + path;

    for (var i = 0; i < files.length; i++) {
        formData.append('fileupload', files[i], files[i].name);

    }
    apiFetch(url, {
        method: 'POST',
        body: formData
    }).then(response => {
        if (!response.ok) {
            showToast('Error: ' + response.statusText);
        }
        return response.json();
    }).catch(error => {
        showToast('Error: ' + error);
    }).then(data => {
        readFolder(path, fileExplorer);
    });
}