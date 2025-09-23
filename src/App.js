import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Header from './components/layout/Header';
import MediadorPage from './pages/MediadorPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/pedidos" replace />} />
            <Route path="/pedidos" element={<MediadorPage />} />
            <Route path="*" element={<Navigate to="/pedidos" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;