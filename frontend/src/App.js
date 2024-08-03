import './App.css';

import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginToGoogle from './LoginToGoogle';
import ListFiles from './ListFiles';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element = {<LoginToGoogle/>} />
        <Route path='/listFiles' element ={<ListFiles/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
