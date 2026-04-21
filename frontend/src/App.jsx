import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Letters from './pages/Letters'
import Gifts from './pages/Gifts'
import Elves from './pages/Elves'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
        <Routes>
          <Route path="/" element={<Letters />} />
           <Route path="/cadouri" element={<Gifts />} />
          <Route path="/elfi" element={<Elves />} /> 
        </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App