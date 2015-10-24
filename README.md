# Realtime Game Framework

## Install

* `npm install`
* `tsd install`

## Build

* `tsc -p . [-w]` in root

## MongoDB
* Install mongodb
* run mongod.exe BEFORE running app.js 
* (you might want to set up a default database on the same drive as mongodb is installed as e.g.: 'e:/data/db/', or either use the command line argument to set up yours, e.g: mongod.exe -dbpath 'path/to/your/db')
* DO NOT restart mongodb during app.js is running, due to reconnection is not implemented yet

## Notes on backend user management
* /auth/:user/:token GET REST call can be used to authenticate clients. Answers can be:
  * {status: "success"} OR
  * {status: "error"}
* index.html is served only, when authentication is done on login page
* login.html on page load is checking localStorage for 'token' and 'user' to authenticate with
* Once the client is authenticated, the generated 'token', and 'user' (username) should be stored in localStorage (as login.html does)