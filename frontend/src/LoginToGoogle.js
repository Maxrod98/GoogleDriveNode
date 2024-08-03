import './App.css';

import {useState, useEffect} from "react";

import {URL_BACKEND} from "./Common";

const URL_BACKEND_GET_GOOGLEAUTH_URL = URL_BACKEND + "/getGoogleAuthURL"

function LoginToGoogle() {
  const [authButton, setButton] = useState(<div> </div>);

  useEffect(() => {
    fetch(URL_BACKEND_GET_GOOGLEAUTH_URL)
    .then(response =>  response.text())
    .then(text => setButton(<a href={text}> Click me </a>));
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Login to view files on google drive.
        </p>
        {authButton}

      </header>
    </div>
  );
}

export default LoginToGoogle;
