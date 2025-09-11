# formeditor.ms
Progress Openedge Lowcode Framework

## Installation (Node + MongoDB)
To get started you will first need the following installed on your machine.
```
Node.js - https://nodejs.org/en/
MongoDB - http://docs.mongodb.org/manual/installation/
```
On Mac, it is recommended to use homebrew brew install mongodb-community
On Windows, download and install the MSI package @ https://www.mongodb.org/downloads
and after that you have to create a db, with the following name: formeditmsapp and the collection with the name: forms

## Running Progress OpenEdge Sports2000 DB

Create a copy of Sports2000 db

````
prodb /tmp/Sports2000 /OpenEdgeInstallDir/Sports2000 
````

startup mysport2000 copy with SQL Broker

````
proenv
cd /tmp
proserve Sports2000 -S 10000 -ServerType SQL -n 50 -L 8000 -c 350 -N TCP -SQLLockWaitTimeout 5
````


## Running with Node.js

You can then download this repository, navigate to the folder in your Terminal, and then type the following.

````
npm install
npm run start
````
This will walk you through the installation process. When it is done, you will have a running Form.io management application running at the following address in your browser.
```
http://localhost:3000/dashboard
http://localhost:3000/api-docs/
````
user admin password admin
The configuration can be found in appconfig.json

### MySQL configuration

Use `appconfig.json` to configure database and authentication settings. A minimal MySQL
configuration looks like the following:

```json
{
  "dbtype": "mysql",
  "port": 3000,
  "dblist": {
    "sample": {
      "ConnectionString": "mysql://user:password@localhost:3306/database"
    }
  },
  "SMTP": {
    "host": "smtp.office365.com",
    "port": 587,
    "secure": false,
    "user": "send@example.com",
    "pass": "password",
    "from": "send@example.com"
  },
  "mongoDbUrl": "mongodb://0.0.0.0:27017",
  "mongoDbName": "formeditmsapp",
  "sessionSecret": "changeme",
  "authentication": {
    "type": "azure ad" | "static" | "ldap" | "database"
  }
}
```

Key parameters:

- `dbtype`: Set to `mysql` to enable MySQL support.
- `dblist`: Map of database names to MySQL connection strings.
- `SMTP`: Outgoing mail server configuration used for notifications.
- `mongoDbUrl` / `mongoDbName`: MongoDB connection for metadata storage.
- `sessionSecret`: Secret string used to sign session cookies.
- `authentication`: Choose the authentication method (`azure ad`, `static`, `ldap` or `database`).

Adjust these values to match your environment before starting the server.


The installation process will also ask if you would like to download an application. If selected, the application can be found at the following URL.

## Adding Component

JSON elements.json, in the config folder, is a configuration file for component configuration. Each key in the JSON object represents a low-code component type.

- `"type"`: The type of the element (e.g., "submit", "reset", "image", "dataset").
- `"description"`: A human-readable description of the  element.
- `"category"`: The category to which the  element belongs. 
- `"scriptName"`: The name of the JavaScript file that contains the functions for creating and editing the element.
- `"createFunction"`: The name of the function that creates the  element. This function is expected to be defined in the JavaScript file specified by `"scriptName"`.
- `"editFunction"`: The name of the function that edits the  element. This function is also expected to be defined in the JavaScript file specified by `"scriptName"`.
- `styles: The name of the CSS file that contains styles for the component`.

- `icon: The name of the icon that represents the component in the UI`.

To add a new component to your project, you need to follow these steps:

Define the new component in the elements.json file located in the config directory. Here is an example of how a component is defined:

```
"newComponent": {
    "type": "newComponent",
    "description": "New Component",
    "category": "HTML",
    "scriptName": "newComponent.js",
    "createFunction": "createNewComponent",
    "editFunction": "editNewComponent",
    "styles": "newComponent.css",
    "icon": "fa fa-icon",
    "renderFunction": "renderNewComponent"
}
```


Create a new JavaScript file for the component in the public/js/components directory. The name of this file should match the scriptName property in the elements.json file. This file should define the createNewComponent and editNewComponent functions (or whatever you named them in the elements.json file).
Here is an example of what this file might look like:

```
function createNewComponent(type) {
    // Code to create the component goes here
}

function editNewComponent(type, element, content) {
    // Code to edit the component goes here
}

function renderNewComponent(main) {
  // Code to render the compontent goes here
}
```

Create a new CSS file for the component in the public/css/components directory. The name of this file should match the styles property in the elements.json file.

After you've added the new component, you may need to restart your server to see the changes.

## Webserver

The file webserver.js, located in the js folder, serves as the configuration file for the web server. It initializes the web server and converts Swagger documentation into a draggable and droppable API list.

```
const apiUrl = "http://localhost:8080/docs.json"
```

The constant apiUrl is set to "http://localhost:8080/docs.json". This hardcoded string represents the URL for the deployed web server file. During development, we utilize the following demo web server, which must be running for the web server to connect and function properly.

```
DemoWebServerLink = https://drive.google.com/file/d/1_RQkyKHcw-VINnu0-bS_nh5ktUp4mM9J/view?usp=sharing
```

```
function fetchAndParseOpenApiJson(apiUrl) {
    // Code to Fetch and Parse OpenApi Json
    // return parsedControllers
}
parsedControllers: [
    {
      controllerName: "Controller Name",
      serverUrl: "Server Url",
      apis: [
        {
          id: "Api ID",
          method: "Api Method",
          path: "Api Path",
          name: "Path Name",
          queryParameters: false,
          pathParameters: false,
          requestBody: false,
          response: {
            200: {
              content: {
                type: "object",
                properties: [
                  {
                    name: "property name",
                    type: "string",
                    format: false,
                  },
                  {
                    name: "array name",
                    type: "array",
                    properties: [
                      {
                        name: "property name",
                        type: "string",
                        format: false,
                      },
                      {
                        name: "property name",
                        type: "string",
                        format: "date-time",
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      ],
    },
  ]
```

The function "fetchAndParseOpenApiJson" currently fetches and parses OpenAPI version 3.0.0. It retrieves the entire Swagger JSON file and then converts it into parsedControllers. These parsedControllers are utilized to create form components and make API calls accordingly, facilitating the mapping of data back and forth. This function holds significant importance as it is the first and foremost import function of the web server.

```
function dragDropApiList(list) {
    // Code to create the component goes here
    // Calls fetchAndParseOpenApiJson()
    // Creates APIs based on parsedControllers
}
```

The function "dragDropApiList" is tasked with calling the "fetchAndParseOpenApiJson" function and utilizing the parsed controllers to create API list components containing api data fields.

```
function fetchApiFields() {
    // Code to feach field of API
    // Calls apiDataInputs()
    // Calls apiDataOutputs()
}
```

The "fetchApiFields" function is responsible for invoking the "dragDropApiList" function and using the apiDataInputs and apiDataOutputs to generate components for field lists containing API data fields.

```
async function callApi(apiUrl, apiMethod, body = {}) {
  try {
    let response;
    switch (apiMethod) {
      case "GET":
        response = await fetch(apiUrl, {
          method: "GET",
        });
        break;

      case "POST":
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        break;

      case "PUT":
        response = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        break;

      case "PATCH":
        response = await fetch(apiUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        break;

      case "Delete":
        response = await fetch(apiUrl, {
          method: "DELETE",
        });
        break;
    }
    if (!response) return;
    return response;
  } catch (error) {
    console.error("Error during calling an API:", error);
    return null;
  }
}
```

The "callApi" function is a generic function that takes three parameters: apiUrl, apiMethod, and body. By using this function, we can make API calls in our project by passing these three arguments.

## dataSetConponenetWeb

The file dataSetConponenetWeb.js, located in the js/components folder, serves as the configuration file for the web server. It initializes the web server and converts Swagger documentation into a draggable and droppable API list.

The constant apiUrl is set to "http://localhost:8080/docs.json". This hardcoded string represents the URL for the deployed web server file. During development, we utilize the following demo web server, which must be running for the web server to connect and function properly.

```
DemoWebServerLink = https://drive.google.com/file/d/1_RQkyKHcw-VINnu0-bS_nh5ktUp4mM9J/view?usp=sharing
```

```
function fetchAndParseOpenApiJson(apiUrl) {
    // Code to Fetch and Parse OpenApi Json
    // return parsedControllers
}
parsedControllers: [
    {
      controllerName: "Controller Name",
      serverUrl: "Server Url",
      apis: [
        {
          id: "Api ID",
          method: "Api Method",
          path: "Api Path",
          name: "Path Name",
          queryParameters: false,
          pathParameters: false,
          requestBody: false,
          response: {
            200: {
              content: {
                type: "object",
                properties: [
                  {
                    name: "property name",
                    type: "string",
                    format: false,
                  },
                  {
                    name: "array name",
                    type: "array",
                    properties: [
                      {
                        name: "property name",
                        type: "string",
                        format: false,
                      },
                      {
                        name: "property name",
                        type: "string",
                        format: "date-time",
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      ],
    },
  ]
```

The function "fetchAndParseOpenApiJson" currently fetches and parses OpenAPI version 3.0.0. It retrieves the entire Swagger JSON file and then converts it into parsedControllers. These parsedControllers are utilized to create form components and make API calls accordingly, facilitating the mapping of data back and forth. This function holds significant importance as it is the first and foremost import function of the web server.

```
function dragDropApiList(list) {
    // Code to create the component goes here
    // Calls fetchAndParseOpenApiJson()
    // Creates APIs based on parsedControllers
}
```

The function "dragDropApiList" is tasked with calling the "fetchAndParseOpenApiJson" function and utilizing the parsed controllers to create API list components containing api data fields.

```
function fetchApiFields() {
    // Code to feach field of API
    // Calls apiDataInputs()
    // Calls apiDataOutputs()
}
```

The "fetchApiFields" function is responsible for invoking the "dragDropApiList" function and using the apiDataInputs and apiDataOutputs to generate components for field lists containing API data fields.

```
async function callApi(apiUrl, apiMethod, body = {}) {
  try {
    let response;
    switch (apiMethod) {
      case "GET":
        response = await fetch(apiUrl, {
          method: "GET",
        });
        break;

      case "POST":
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        break;

      case "PUT":
        response = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        break;

      case "PATCH":
        response = await fetch(apiUrl, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        break;

      case "Delete":
        response = await fetch(apiUrl, {
          method: "DELETE",
        });
        break;
    }
    if (!response) return;
    return response;
  } catch (error) {
    console.error("Error during calling an API:", error);
    return null;
  }
}
```

The "callApi" function is a generic function that takes three parameters: apiUrl, apiMethod, and body. By using this function, we can make API calls in our project by passing these three arguments.

## dataSetComponenetWeb

The file dataSetComponentWeb.js, found in the js/components folder, allows dropping API endpoints and their fields. This section includes various components for interacting with the data and is designed to manage CRUD operations.

```
function createMultiSelectItemWeb("Data", "Array-Outputs", "data", id=false)
    // Code to create the component goes here
    // Calls allowDrop(event)
    // drop the field which exist in outputArray list
}
```

This function creates a section in dataSetComponentWeb named "array-outputs". In this section, only fields that exist in the "array-output" list can be dropped.

```
function createMultiSelectItemWeb("Data", "Array-Outputs", "data", id=true)
 {
    // Code to create the component goes here
    // Calls allowDrop(event)
    // drop the field which exist in outputArray list
}
```

This function creates a section in dataSetComponentWeb named "Id". In this section, only a single field can be dropped, which is the primary key of that API. Operations such as getById, delete, and update will be performed based on this field.

```
function createSelectApiWeb("Data", 'CreateApi')
 {
    // Code to create the component goes here
    // Calls dropSelectApiWeb()
    // drop the API endpoint for creating the record and save in database
}
```

This function creates a section in dataSetComponentWeb named "CreateApi". In this section, the createApi endpoint should be dropped, which inserts a new record into the database web. In this section, fields cannot be dropped.

```
function createSelectApiWeb("Data", 'GetById')
 {
    // Code to create the component goes here
    // Calls dropSelectApiWeb()
    // drop the API endpoint for GetById the record from database
}
```

This function creates a section in dataSetComponentWeb named "GetById". In this section, the GetById endpoint should be dropped, which returns a record depending on the ID.

```
function     createSelectApiWeb("Data", 'UpdateById')
 {
    // Code to create the component goes here
    // Calls dropSelectApiWeb()
    // drop the API endpoint for update the record and save in database
}
```

This function creates a section in dataSetComponentWeb named "UpdateById". In this section, the UpdateById endpoint should be dropped, which updates a record depending on the ID.

```
function moveFirstWeb() {
    //This function is located in the dataSetComponentWeb.js file.
    //calls updateInputsWeb()
}
```

The function "moveFirstWeb" is invoked when the "First" button is pressed. It retrieves the first record and displays it on the screen.

```
function moveLastWeb() {
    //This function is located in the dataSetComponentWeb.js file.
    //calls updateInputsWeb()
}
```

The function "moveLastWeb" is invoked when the "Last" button is pressed. It retrieves the last record and displays it on the screen.

```
function movePrevWeb() {
    //This function is located in the dataSetComponentWeb.js file.
    //calls updateInputsWeb()
}
```

The function "movePrevtWeb" is invoked when the "Previous" button is pressed. It retrieves the Previous record and displays it on the screen.

```
function moveNextWeb() {
    //This function is located in the dataSetComponentWeb.js file.
    //calls updateInputsWeb()
}
```

The function "moveNextWeb" is invoked when the "Next" button is pressed. It retrieves the Next record and displays it on the screen.

function is responsible for making the field editable.

```
function EditRecordWeb() {
    //This function is located in the dataSetComponentWeb.js file.
}
```

"EditRecordWeb" function enables users to modify specific fields within a dataset via a web server. On clicking Edit button UpdateRecordWeb() function is called.

```
function InsertRecordWeb() {
    //This function is located in the dataSetComponentWeb.js file.
}
```

"InsertRecordWeb" function enables users to add new records to a dataset. On clicking create button UpdateRecordWeb() function is called.

```
function UpdateRecordWeb() {
    //This function is located in the dataSetComponentWeb.js file.
}
```

"UpdateRecordWeb" function provides an efficient way to update existing records in a dataset via a web server. On clicking Update Record button UpdateRecordWeb() function is called.

## dataGridWeb

The file databaseGridWeb.js, located in the js/components folder, enables the dropping of API endpoints. This section contains various components for interacting with the data and is designed to manage and display records from the database.

```
function createMultiSelectItemWeb("Data", "data", "data", false){
    // Code to create the component goes here
    // Calls dropSelectApiWeb()
    // drop the API endpoint for getting record from database
}
```

"createMultiSelectItemWeb" function creates a section in dataSetComponentWeb named "data". In this section, the getAll endpoint fields should be dropped.

```
function renderGridWeb(){
    // Code to create the grid goes here
    // Calls createGridWeb()
    // Calls insertNavBarWeb()
}
```

"renderGridWeb" function creates two sections of the grid web: one for displaying records in the form of a table and the other for the navigation bar.

```
function insertNavBarWeb(){
// Code to create the navbar component goes here
//This function is located in the dataSetComponentWeb.js file.
}
```

The function "renderGridWeb" is responsible for invoking the "insertNavBarWeb" function. This function creates a navigation bar section containing options for page size, filters, navigation to the next or previous page and refresh.

- `"searchGridWeb"`:This function is executed when a value is entered into the search input field.
- `"grid_page_sizeWeb"`: This function is executed when a value is selected for the page size.
- `"gridPrevWeb"`: This function is executed when a button is clicked. It is responsible for navigating to the previous page.
- `"gridNextWeb"`: This function is executed when a button is clicked. It is responsible for navigating to the next page.
- `"refreshWeb"`: This function is executed when a button is clicked. It is responsible for navigating to the first page.



