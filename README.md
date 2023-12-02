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
user admin password 123

The installation process will also ask if you would like to download an application. If selected, the application can be found at the following URL.

## Adding Component

JSON elements.json, in the config folder, is a configuration file for component configuration. Each key in the JSON object represents a low-code component type.

- `"type"`: The type of the element (e.g., "submit", "reset", "image", "dataset").
- `"description"`: A human-readable description of the  element.
- `"category"`: The category to which the  element belongs. 
- `"scriptName"`: The name of the JavaScript file that contains the functions for creating and editing the element.
- `"createFunction"`: The name of the function that creates the  element. This function is expected to be defined in the JavaScript file specified by `"scriptName"`.
- `"editFunction"`: The name of the function that edits the  element. This function is also expected to be defined in the JavaScript file specified by `"scriptName"`.

This structure allows you to dynamically create and edit HTML elements based on the JSON data. By changing the JSON data, you can control which HTML elements are available, how they are created and edited, and so on.