import './App.css';

import {useState, useEffect} from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

import Loader from './Loader';

import {URL_BACKEND} from "./Common";

const URL_BACKEND_GET_LIST = URL_BACKEND + "/list";
const URL_BACKEND_REMOVE_FILE = URL_BACKEND + "/deleteFile";
const URL_BACKEND_UPLOAD_FILE = URL_BACKEND + "/uploadFile";
const URL_BACKEND_DOWNLOAD_FILE = URL_BACKEND + "/downloadFile";

function ListFiles() {
  const [files, setFiles] = useState(<Loader/>);

  function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
  }

  async function deleteFile(fileId) {
    console.log("fileId to remove:", fileId);
    setFiles(<Loader/>)
    fetch(URL_BACKEND_REMOVE_FILE + "?fileId=" + fileId);

    await timeout(1000);
    await updateFiles();
  }

  async function upload() {
    var input = document.querySelector('input[type="file"]')

    var data = new FormData()
    data.append('file', input.files[0]);

    console.log(input.files);

    await fetch(URL_BACKEND_UPLOAD_FILE, 
      {
        method: 'POST',
        body: data
      });
    await timeout(1000);
    await updateFiles();
  }

  // TODO: This function is something I copied from stackoverflow, but can't get the file download working,
  // and I couldn't get to get it working to download a file.
  async function downloadFile(fetchResult) {
    var filename = fetchResult.headers.get('content-disposition').split('filename=')[1];
    var data = await fetchResult.blob();

    const blob = new Blob([data], { type: data.type || 'application/octet-stream' });
    if (typeof window.navigator.msSaveBlob !== 'undefined') {

        window.navigator.msSaveBlob(blob, filename);
        return;
    }

    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobURL;
    tempLink.setAttribute('download', filename);

    if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(blobURL);
    }, 100);
}

  async function downloadFile(fileId, fileName) {
    console.log("fileId to download:", fileId, "name=", fileName);
    let response = await fetch(URL_BACKEND_DOWNLOAD_FILE + "?fileId=" + fileId + "&" + "fileName=" + fileName);

    let blob = await response.text();
    console.log(blob);

    downloadFile(blob);
  }

  async function updateFiles() {
    let response = await fetch(URL_BACKEND_GET_LIST);
    let jsn = await response.json();

    setFiles(
      <div style= {{marginTop:"2rem"}}>
        {
        jsn.files.map
        (
          (f) =>
          <Card key={f.id} style={{width: '40rem'}} className="mb-2" bg="secondary">
            <Card.Body>
              <Card.Text>
              {f.name}
              </Card.Text>

              <ListGroup className="list-group-flush">
                <ListGroup.Item>Type: {f.mimeType}</ListGroup.Item>
                <ListGroup.Item>Last Modified Date: {f.modifiedTime}</ListGroup.Item>
              </ListGroup>
              <Button variant="danger" onClick={() => deleteFile(f.id)}> Delete</Button>
              <Button variant="secondary" onClick={() => downloadFile(f.id, f.name)}> Download </Button>
            </Card.Body>
          </Card>
        )
        }
      </div>
    )
  }

  useEffect(() => {
    updateFiles();
  }, [])

  return (
    <div className="App">
      <header className="App-header">

      <p>
          Google Files API.
      </p>

      <Card style={{width: '40rem', marginTop:"2rem"}}>
        <Card.Body>
        <div>
        <input id="file" name="file" type="file" />
        <button onClick={() => upload()}>Upload</button>
        </div>
        </Card.Body>
      </Card>

        {files}
      </header>
    </div>
  );
}

export default ListFiles;
