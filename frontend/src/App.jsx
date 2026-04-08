import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importamos el Header global
import Header from './components/Header';

// Importamos las páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SolicitudesTransparenciaTI from './pages/SolicitudesTransparencia/TransparenciaTI';
import SolicitudesTransparenciaContralora from './pages/SolicitudesTransparencia/TransparenciaContralora';
import SolicitudesTransparenciaResponsable from './pages/SolicitudesTransparencia/TransparenciaResponsable';
import SolicitudesTransparenciaSecretaria from './pages/SolicitudesTransparencia/TransparenciaSecretaria';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* LA BARRA GLOBAL: Vive aquí para que se vea en todo el sistema */}
        <Header />
        
        {/* EL CONTENIDO DINÁMICO */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/transparencia/ti" element={<SolicitudesTransparenciaTI />} />
            <Route path="/transparencia/contralora" element={<SolicitudesTransparenciaContralora />} />
            <Route path="/transparencia/responsable" element={<SolicitudesTransparenciaResponsable />} />
            <Route path="/transparencia/secretaria" element={<SolicitudesTransparenciaSecretaria />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;