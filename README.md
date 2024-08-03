## Overview

The app is separated into backend (nodejs) and front end (react).
The backend serves as a REST API endpoint.

Functionality:

Aunthenticate user to google api.
View files.
Upload file.
Remove file.
Download file (partially, couldn't figure out how to download on frontend);

## How to install

Git doesn't let me add secrets to these files so you will have to create your own project here:
https://console.cloud.google.com/welcome?project=sage-ripple-431217-h7

On Google Cloud console go to, create api key and oath key for:
https://developers.google.com/drive/api/quickstart/nodejs

Then add the client secret and client id into backend/ApiConstans.js.

On linux environments you can run:

```
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## How to run

On a terminal do
```
cd backend && node index.js
```

On a different terminal do
```
cd frontend && npm start
```

On browser go to http://localhost:3000 where the react app is hosted at.

## How to test

Only the backend has tests, which belong to the ApiController class. To run them do the following:

```
# authenticate to your google account
node localAuth.js
# run tests
npm test
```
