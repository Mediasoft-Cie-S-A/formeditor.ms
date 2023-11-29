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
procopy /OpenEdgeInstallDir/Sports2000 /tmp/Sports2000
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
http://localhost:3000
````

The installation process will also ask if you would like to download an application. If selected, the application can be found at the following URL.


