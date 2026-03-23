import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Pantalla temporal para el siguiente paso (Transparencia)
const Transparencia = () => (
  <div className="p-10 text-center">
    <h1 className="text-3xl font-bold text-[#1e4b8f]">Módulo de Solicitudes de Transparencia</h1>
    <p className="mt-4 text-gray-600">Aquí diseñaremos la tabla de solicitudes próximamente.</p>
    <button
      onClick={() => window.history.back()}
      className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
    >
      Volver al Menú
    </button>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transparencia" element={<Transparencia />} />
      </Routes>
    </Router>
  );
}

export default App;