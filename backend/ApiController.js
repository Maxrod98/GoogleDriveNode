'use strict';

const { google } = require('googleapis');

const END_PAGE = "EndPage";

const scopes = [
    'https://www.googleapis.com/auth/drive'
];

// TODO: Modify class to throw errors at the higher level instead of sending {error: true} flag.

module.exports = class ApiController {
    #authClient;
    #pageNum = 1;
    #pageSize;
    #pageTokens = [""];
    constructor(authClient, pageSize) {
        this.#pageSize = pageSize;
        this.#authClient = authClient;
    }

    #getDriveApi() {
        return google.drive({version: "v3", auth: this.#authClient});
    }

    async setCredentials(code) {
        let { tokens } = await this.#authClient.getToken(code);
        console.log("TOKENS:", JSON.stringify(tokens));
        this.#authClient.setCredentials(tokens);
    }

    generateAuthUrl() {
        return this.#authClient.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: "offline",
            /** Pass in the scopes array defined above.
             * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
            scope: scopes,
            // Enable incremental authorization. Recommended as a best practice.
            include_granted_scopes: true,
            // Include the state parameter to reduce the risk of CSRF attacks.
            //state: crypto.randomBytes(32).toString("hex"),
          });
    }

    async getFilesList(direction="none") {
        let requestBody =
        {
            pageSize: this.#pageSize,
            fields: "nextPageToken, files(id, name, mimeType, modifiedTime)"
        };

        if (direction === "next") {
            let pageToken = this.#pageTokens[this.#pageTokens.length - 1];
            if (pageToken !== END_PAGE) {
                requestBody.pageToken = pageToken;
                this.#pageNum += 1;
            } else {
                return {error: true, errorMessage: "There is no next page.", files: "", pageNum: this.#pageNum}
            }
        } else if (direction === "back") {
            if (this.#pageNum > 1) {
                this.#pageTokens.pop();
                this.#pageTokens.pop();
                let pageToken = this.#pageTokens[this.#pageTokens.length - 1];
                if (pageToken != "") {
                    requestBody.pageToken = pageToken;
                }
                this.#pageNum -= 1;
            } else {
                return {error: true, errorMessage: "There is no previous page.", files: "", pageNum: this.#pageNum}
            }
        }

        const res2 = await this.#getDriveApi().files.list(requestBody);

        const files = res2.data.files;
        if (res2.data.nextPageToken !== undefined || res2.data.nextPageToken != "") {
            this.#pageTokens.push(res2.data.nextPageToken);
        } else {
            this.#pageTokens.push(END_PAGE);
        }

        return {error: false, errorMessage: "", files: files, pageNum: this.#pageNum};
    }

    async addFile(fileName, mimeType, readStream) {
        const media = {
            mimeType: mimeType,
            body: readStream,
        };

        const requestBody = {
            name: fileName,
            fields: 'id',
        };

        try {
            const file = await this.#getDriveApi().files.create({
              requestBody,
              media: media,
            });
            return {error: false, errorMessage: "", fileId: file.data.id };
          } catch (err) {
            return {error: true, errorMessage: "Error creating file"};;
          }
    }

    async deleteFile(fileId) {
        console.log("Deleting file", fileId)
        try {
            const response = await this.#getDriveApi().files.delete({
                fileId: fileId,
            });
            return response;
        } catch (err) {
            throw("Error deleting file!");
        }
    }

    async downloadFile(fileId) {
        try {
          const file = await this.#getDriveApi().files.get({
            fileId: fileId,
            alt: 'media',
          });

          return {status: file.status, fileText: file.data};
        } catch (err) {
          // TODO(developer) - Handle error
          throw err;
        }
    }
}
