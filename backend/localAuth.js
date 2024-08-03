'use strict';

const {authenticate} = require('@google-cloud/local-auth');
const fs = require('fs').promises;
const {google} = require('googleapis');
const path = require('path');
const process = require('process');

const App = require('./App');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function localAuth() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    console.log("Credentials already saved! No need to do more.")
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

if (require.main === module) {
    localAuth();
}

module.exports = { localAuth }