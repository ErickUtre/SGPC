import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importamos el Header global
import Header from './components/Header';

// Importamos las páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SolicitudesTransparenciaTI from './pages/SolicitudesTransparencia/TransparenciaTI';
import SolicitudesTransparenciaContralora from './pages/SolicitudesTransparencia/TransparenciaContralora';
import SolicitudesTransparenciaResponsable from './pages/SolicitudesTransparencia/TransparenciaResponsable';
import SolicitudesTransparenciaSecretaria from './pages/SolicitudesTransparencia/TransparenciaSecretaria';

const decodeJwtPayload = (token) => {
  try {
    const payloadBase64 = token.split('.')[1];
    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getRoleHomePath = (role) => {
  if (role === 'TI') return '/transparencia/ti';
  if (role === 'Contralora') return '/transparencia/contralora';
  if (role === 'Responsable') return '/transparencia/responsable';
  if (role === 'Secretaria') return '/transparencia/secretaria';
  return '/dashboard';
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = sessionStorage.getItem('token');
  const roleStorage = sessionStorage.getItem('userRole');
  const authPassed = sessionStorage.getItem('authPassed') === 'true';

  if (!token || !authPassed) return <Navigate to="/" replace />;

  const payload = decodeJwtPayload(token);
  const roleToken = payload?.rol;
  const effectiveRole = roleStorage || roleToken;

  if (!effectiveRole) return <Navigate to="/" replace />;
  if (!roleStorage && roleToken) sessionStorage.setItem('userRole', roleToken);

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to={getRoleHomePath(effectiveRole)} replace />;
  }

  return children;
};

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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/transparencia/ti"
              element={
                <ProtectedRoute allowedRoles={['TI']}>
                  <SolicitudesTransparenciaTI />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transparencia/contralora"
              element={
                <ProtectedRoute allowedRoles={['Contralora']}>
                  <SolicitudesTransparenciaContralora />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transparencia/responsable"
              element={
                <ProtectedRoute allowedRoles={['Responsable']}>
                  <SolicitudesTransparenciaResponsable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transparencia/secretaria"
              element={
                <ProtectedRoute allowedRoles={['Secretaria']}>
                  <SolicitudesTransparenciaSecretaria />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;