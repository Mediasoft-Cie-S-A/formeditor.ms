/*!
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

function  loadPages () {
  
      fetch("/pages").then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      }).then(pages => {
        const pagesList = document.getElementById("pageListContainerBody");
        pagesList.innerHTML = ""; // Clear existing content
        pages.forEach(page => {
          const container = document.createElement("tr");
            container.innerHTML = `
                <td>${page.objectId}</td>
                <td>${page.slug}</td>
                <td>${page.layout}</td>
                <td>${page.title}</td>
                <td>${page.meta}</td>
                <td>${page.meta}</td>
            `;
             // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML='<i class="fa fa-trash" style="margin-left:-5px"></i>'
                deleteButton.className = 'portal-delete-button';        
                deleteButton.onclick = function(event) {
                    event.preventDefault();
                    deletePage(page.objectId);
                }; // delete button functionality

                // create edit button
                const editButton = document.createElement('button');
                editButton.innerHTML='<i class="fa fa-edit" style="margin-left:-5px"></i>'
                editButton.className = 'portal-edit-button';
                editButton.onclick = function(event) {
                    event.preventDefault();
                    loadPage(page.objectId);
                    const editTab = document.querySelector('.nav-tabs a[href="#editForm"]');
                    if (editTab) {
                        editTab.click(); // Simulate click
                    }  // Simulate click on the edit tab
                   
                }; // edit button functionality
                // create show button
                const showButton = document.createElement('button');
                showButton.innerHTML='<i class="fa fa-eye" style="margin-left:-5px"></i>'
                showButton.className = 'portal-show-button';
                showButton.onclick = function(event) {
                  event.preventDefault();
                  // call window.open with the page slug
                    const pageUrl = `/${page.slug}`;
                    window.open(pageUrl, '_blank'); // Open the page in a new tab
                }; // show button functionality
                const itemActions = document.createElement('td');
                itemActions.appendChild(showButton); // Append the show button
                itemActions.appendChild(editButton); // Append the edit button
                itemActions.appendChild(deleteButton); // Append the delete button
                container.appendChild(itemActions); // Append the actions cell to the container

            pagesList.appendChild(container);
        });
      }).catch(error => {
        console.error("Error fetching pages:", error);
        const pagesList = document.getElementById("pagesList");
        pagesList.innerHTML = "<li>Error loading pages</li>";
      });
}

function loadPage(pageId) {
    console.log("Loading page with ID:", pageId);
    fetch(`/pages/${pageId}`)
        .then(response => {
            if (!response.ok) {
                showToast("Error loading page: " + response.statusText);
            }
            return response.json();
        })
        .then(page => {
            console.log("Page data:", page);
            // Populate the form with the page data
            document.getElementById("objectId").value = page.objectId;
            document.getElementById("objectName").value = page.title;
            document.getElementById("objectSlug").value = page.slug;
            document.getElementById("userCreated").value = page.userCreated;
            document.getElementById("userModified").value = page.userModified;
             var objectType = document.getElementById('objectType');
            // select in the objecttype the value form
            objectType.value = 'form';
            // Assuming formContainer is where the page content is displayed
            const formContainer = document.getElementById("formContainer");
            formContainer.innerHTML = ""; // Clear existing content
            // Assuming page.content is a JSON object that needs to be rendered
            switch (page.layout) {
                case "raw":
                    formContainer.innerHTML = JSON.stringify(page.content, null, 2);
                    break;
                case "default":
                     jsonToDom(page.content,formContainer);
                    break;
                default:
                    console.error("Unknown layout type:", page.layout);
            }
            showToast("Page loaded successfully");
        })
        .catch(error => {
            console.error("Error loading page:", error);
            showToast("Error loading page: " + error.message);
        });
}


function registerObject(e) {
    e.preventDefault();
    console.log("submit");

    var type = document.getElementById("objectType").value;
    switch (type) { 
        case "form":
            registerForm(e);
            break;
        case "business_component":
            registerBusinessComponent(e);
            break;
        case "page":
            registerPage(e);
            break;
        default:
            console.error("Unknown object type");
    }

}

function registerPage(e) {
    e.preventDefault();
    console.log("submit");

       var objectId = document.getElementById("objectId").value;
    var objectName = document.getElementById("objectName").value;
    var objectSlug = document.getElementById("objectSlug").value;
    var userCreated = document.getElementById("userCreated").value;
    var userModified = document.getElementById("userModified").value;
    var type = document.getElementById("objectType").value;

    var formContainer = document.getElementById("formContainer");
   // var jsonData = domToJson(formContainer);
   var htmlContent = formContainer.innerHTML;
    if (type == "page") {
      // genere form data based on slug, title, layout = "default", content = "", meta = {}
        const formData = {
            objectId: objectId,
            slug: objectSlug,
            title: objectName,
            layout: "raw", // Assuming raw layout for pages
            content: htmlContent,
            meta: {
                description: "Page description",
                keywords: ["keyword1", "keyword2"]
            },
            userCreated: userCreated,
            userModified: userModified,
        };
      // post the form data to the server to store it /page
        fetch("/pages", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                showToast("Error registering page: " + response.statusText);
            }
            showToast("Page registered successfully");
           
        }).catch(error => {
            console.error("Error registering page:", error);
            showToast("Error registering page: " + error.message);
        });
    }
}

function deletePage(pageID) {
    if (confirm("Are you sure you want to delete this page?")) {
        fetch(`/pages/${pageID}`, {
            method: "DELETE"
        })
        .then(response => {
            if (!response.ok) {
                showToast("Error deleting page: " + response.statusText);
            } else {
                showToast("Page deleted successfully");
                loadPages(); // Reload the pages list
            }
        }).catch(error => {
            console.error("Error deleting page:", error);
            showToast("Error deleting page: " + error.message);
        });
    }
}

loadPages ();