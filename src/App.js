import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Enter from './Enter';
import MainGame from './MainGame';
import Restart from './Restart';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Enter />}/>
        <Route path="/mainGame" element={<MainGame />}/>
        <Route path="/Restart" element={<Restart />}/>
      </Routes>
    </Router>
    );
}

export default App;
