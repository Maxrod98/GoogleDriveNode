'use strict';

const express = require('express');
const fs = require('fs');
const https = require('https');
const multer  = require('multer');
const os = require('os');
const url = require('url');

const upload = multer({ dest: os.tmpdir() });
const {URL_BACKEND, URL_FRONTEND} = require('../frontend/src/Common');
const URL_FRONTEND_FILES = URL_FRONTEND + "/listFiles";

module.exports = class App {
    #port;
    #app;
    #apiController;
    constructor(port, apiController) {
        this.#port = port;
        this.#app = express();
        this.#apiController = apiController;
    }

    async start() {
        this.#app.use(function(req, res, next) {
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
          next();
        })

        console.log("Started");
        this.#app.get("/getGoogleAuthURL", async (req, res) => {
          // Store state in the session
          //req.session.state = state;

          // Generate a url that asks permissions for the Drive activity scope
          const authorizationUrl = this.#apiController.generateAuthUrl();
          res.status(200);
          res.send(authorizationUrl);
        });
        // Receive the callback from Google's OAuth 2.0 server.
        this.#app.get("/oauth2callback", async (req, res) => {
          // Handle the OAuth 2.0 server response
          let q = url.parse(req.url, true).query;
          if (q.error) {
            // An error response e.g. error=access_denied
            console.log("Error:" + q.error);
          } else {
            await this.#apiController.setCredentials(q.code);
            console.log("SET CREDENTIALS", JSON.stringify(q.code));

            /** TODO: Save credential to the global variable in case access token was refreshed.
             * ACTION ITEM: In a production app, you likely want to save the refresh token
             *              in a secure persistent database instead. */
            res.redirect(URL_FRONTEND_FILES);
          }
        });

        this.#app.get("/list", async (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          let files = await this.#apiController.getFilesList("none");
          console.log("TESTFILES", JSON.stringify(files));
          res.status(200);
          res.send(JSON.stringify(files));
        });

        this.#app.get("/deleteFile", async(req, res) => {
          if (req.query.fileId === null) {
            console.log("Error, no fileId!");
            res.send("Error");
            return;
          }
          let result = await this.#apiController.deleteFile(req.query.fileId);
          if (result == "") {
            res.status(200);
          } else {
            res.status(404);
          }
          res.send();
        })

        const apiController = this.#apiController;
        this.#app.post("/uploadFile", upload.single('file'), async function(req, res) {

          const file = req.file;
          let path = file.path;
          let mimetype = file.mimetype;
          const title = file.originalname;

          let fileCreation = await apiController.addFile(title, mimetype, fs.createReadStream(path));

          res.sendStatus(200);
        })

        this.#app.get("/downloadFile", async function (req, res) {
          if (req.query.fileId === null || req.query.fileName === null) {
            console.log("Error, no fileId or fileName!");
            res.send("Error");
            return;
          }

          let {status, fileText} = await apiController.downloadFile(req.query.fileId);
          console.log(req.query.fileName);
          //console.log(req.query.fileId);
          console.log(fileText);

          res.status(200);
          res.send(fileText);
        })

        // Example on revoking a token
        this.#app.get("/revoke", async (req, res) => {
          // Build the string for the POST request
          let postData = "token=" + userCredential.access_token; //TODO: do this

          // Options for POST request to Google's OAuth 2.0 server to revoke a token
          let postOptions = {
            host: "oauth2.googleapis.com",
            port: "443",
            path: "/revoke",
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "Content-Length": Buffer.byteLength(postData),
            },
          };

          // Set up the request
          const postReq = https.request(postOptions, function (res) {
            res.setEncoding("utf8");
            res.on("data", (d) => {
              console.log("Response: " + d);
            });
          });

          postReq.on("error", (error) => {
            console.log(error);
          });

          // Post the request with data
          postReq.write(postData);
          postReq.end();
        });
        console.log(this.#port);
        this.#app.listen(this.#port, () => {
          console.log(`App listening on port ${this.#port}`)
        });
      }
}
