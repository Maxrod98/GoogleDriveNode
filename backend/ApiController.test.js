'use strict';

const fs = require('fs');
const { google } = require('googleapis');

const ApiController = require('./ApiController');
const { localAuth } = require('./localAuth');

const {CLIENT_ID, CLIENT_SECRET, REDIRECT_URL} = require('./ApiConstants');

// TODO: controller should rethrow on errors
test("ApiController.generateAuthUrl", () => {
    let apiController = new ApiController(
        new google.auth.OAuth2(
          CLIENT_ID,
          CLIENT_SECRET,
          REDIRECT_URL
        ),
        3);
    expect(apiController.generateAuthUrl()).not.toEqual();
})

// User opens page 1 by default, then goes to next page and then back
test("ApiController.getFilesList none,next,back", async () => {
    let apiController = new ApiController(await localAuth(), 3);

    let filesPage1 = await apiController.getFilesList();
    let filesPage2 = await apiController.getFilesList("next");
    let filesPage1AfterBacking = await apiController.getFilesList("back");

    expect(filesPage1).not.toStrictEqual(filesPage2);
    expect(filesPage1AfterBacking).toStrictEqual(filesPage1);
});

// Edge case: user tries to back multiple times when
test("ApiController.getFilesList none,back,back", async () => {
    let apiController = new ApiController(await localAuth(), 3);

    await apiController.getFilesList();
    let filesPage1BackButSame = await apiController.getFilesList("back");
    let filesPage1BackButSame2 = await apiController.getFilesList("back");

    expect(filesPage1BackButSame).toEqual(expect.objectContaining({error: true}));
    expect(filesPage1BackButSame2).toEqual(expect.objectContaining({error: true}));
});


// TODO: find a way to test this
/*
test("ApiController.getFilesList none,next,next", async () => {
    let apiController = new ApiController(await localAuth(), 3);

    await apiController.getFilesList();
    let filesPage1NextButSame = await apiController.getFilesList("next");
    let filesPage1NextButSame2 = await apiController.getFilesList("next");

    expect(filesPage1NextButSame).toStrictEqual(expect.objectContaining({error: true}));
    expect(filesPage1NextButSame2).toStrictEqual(expect.objectContaining({error: true}));
});
*/

test("ApiController.addFile create file", async () => {
    let apiController = new ApiController(await localAuth(), 3);

    let files = await apiController.getFilesList();

    let fileName = 'package.json';

    let fileCreation = await apiController.addFile(fileName, "plain/text", fs.createReadStream(fileName));

    let files2 = await apiController.getFilesList();
    expect(fileCreation).toEqual(expect.objectContaining({error: false}));
});

/*
TODO: find a way to test this accurately.
test("ApiController.deleteFile", async () => {
    let apiController = new ApiController(await localAuth(), 3);

    let fileName = 'package2.json';

    let fileCreation = await apiController.addFile(fileName, "plain/text", fs.createReadStream(fileName));

    let files2 = await apiController.getFilesList();
    expect(fileCreation).toEqual(expect.objectContaining({error: false}));

    await sleep(3000)
    await apiController.deleteFile(fileCreation.fileId);
}, 60 * 1000)
*/

test("ApiController.downloadFile", async () => {
    let apiController = new ApiController(await localAuth(), 3);

    let {status, fileText} = await apiController.downloadFile("16WfO5RgwzDXFSLWZ_botSWWtD5WS0RB1");
    expect(status).toEqual(200);
})
