import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Enter from './Enter';
import MainGame from './MainGame';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Enter />}/>
        <Route path="/mainGame" element={<MainGame />}/>
      </Routes>
    </Router>
    );
}

export default App;
