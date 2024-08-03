'use strict';

const {URL_BACKEND} = require('../frontend/src/Common');

// create your own keys here.
const CLIENT_ID = "TODO";
const CLIENT_SECRET = "TODO";
const REDIRECT_URL = URL_BACKEND + "/oauth2callback";

module.exports = {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL}
