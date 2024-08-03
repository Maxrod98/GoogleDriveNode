'use strict';

const {google} = require('googleapis');

const ApiController = require('./ApiController');
const App = require('./App');

const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL} = require('./ApiConstants');
const {PORT_BACKEND} = require('../frontend/src/Common');

async function run() {
  console.log("Running backend on: ", PORT_BACKEND)
  let apiController = new ApiController(
    new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URL
    ),
    100);

  let app = new App(PORT_BACKEND, apiController);

  await app.start();
}

run();
