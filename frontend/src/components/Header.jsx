import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // No mostramos la barra si el usuario está en el Login
  if (location.pathname === '/') return null;

  return (
    <header className="bg-[#1e4b8f] text-white p-4 shadow-md flex justify-between items-center px-8 z-50 sticky top-0 w-full">
      <div className="flex items-center gap-6">
        {/* Logo UV - Siempre al Menú */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-white px-2 py-1 rounded hover:bg-gray-100 transition-colors"
        >
          <span className="text-[#1e4b8f] font-bold text-sm uppercase">UV</span>
        </button>
        
        <h1 className="font-semibold text-lg border-r border-blue-400 pr-6 mr-1">SGPC</h1>
        
        {/* Accesos Directos Globales */}
        <nav className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/transparencia')}
            className={`text-sm font-semibold px-3 py-1.5 rounded-md transition-all ${
              location.pathname === '/transparencia' ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            Solicitudes de transparencia
          </button>
        </nav>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="text-xs hover:text-red-300 transition-colors uppercase tracking-wider font-bold"
      >
        Cerrar sesión
      </button>
    </header>
  );
};

export default Header;