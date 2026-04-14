import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import contraloriaImg from '../assets/contraloria.png';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifAbierto, setNotifAbierto] = useState(false);

  useEffect(() => {
    if (!notifAbierto) return;
    const handler = () => setNotifAbierto(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [notifAbierto]);

  if (location.pathname === '/') return null;

  const handleTransparencia = () => {
    const role = sessionStorage.getItem('userRole');
    if (role === 'TI') navigate('/transparencia/ti');
    else if (role === 'Contralora') navigate('/transparencia/contralora');
    else if (role === 'Responsable') navigate('/transparencia/responsable');
    else if (role === 'Secretaria') navigate('/transparencia/secretaria');
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('authPassed');
    navigate('/');
  };

  return (
    <header className="bg-white text-gray-800 border-b border-gray-200 flex justify-between items-center px-4 md:px-8 py-3 z-50 sticky top-0 w-full shadow-sm transition-colors">
      {/* Lado izquierdo */}
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="hover:scale-105 transition-transform shrink-0 mr-2 rounded-lg"
        >
          <img src={contraloriaImg} alt="Contraloría" className="h-8 md:h-12 object-contain drop-shadow" />
        </button>

        <h1 className="font-extrabold text-base md:text-xl border-r border-gray-300 pr-3 md:pr-6 mr-1 shrink-0 text-[#1e4b8f]">SGPC</h1>

        <nav className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-none">
          <button
            onClick={handleTransparencia}
            className={`text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              location.pathname.startsWith('/transparencia') 
                ? 'bg-[#1e4b8f] text-white shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#1e4b8f]'
            }`}
          >
            Solicitudes de transparencia
          </button>
        </nav>
      </div>

      {/* Lado derecho */}
      <div className="flex items-center gap-3 md:gap-5 shrink-0">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setNotifAbierto(!notifAbierto); }}
            className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-all ${
              notifAbierto 
                ? 'bg-gray-100 text-[#1e4b8f]' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#1e4b8f]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="hidden sm:inline">Notificaciones</span>
          </button>

          {notifAbierto && (
            <div className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="bg-[#1e4b8f] px-4 py-3 flex justify-between items-center">
                <span className="text-white font-bold text-xs uppercase tracking-widest">Notificaciones</span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">0</span>
              </div>
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="text-gray-400 font-semibold text-sm">Sin notificaciones</p>
                <p className="text-gray-300 text-xs mt-1">Aquí aparecerán tus alertas</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={cerrarSesion}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider font-bold whitespace-nowrap pl-2 border-l border-gray-200"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default Header;
