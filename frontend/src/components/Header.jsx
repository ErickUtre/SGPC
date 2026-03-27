import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    const role = localStorage.getItem('userRole');
    if (role === 'TI') navigate('/transparencia/ti');
    else if (role === 'Contralora') navigate('/transparencia/contralora');
    else if (role === 'Responsable') navigate('/transparencia/responsable');
    else if (role === 'Secretaria') navigate('/transparencia/secretaria');
  };

  return (
    <header className="bg-[#1e4b8f] text-white shadow-md flex justify-between items-center px-4 md:px-8 py-3 z-50 sticky top-0 w-full">
      {/* Lado izquierdo */}
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-white px-2 py-1 rounded hover:bg-gray-100 transition-colors shrink-0"
        >
          <span className="text-[#1e4b8f] font-bold text-sm uppercase">UV</span>
        </button>

        <h1 className="font-semibold text-base md:text-lg border-r border-blue-400 pr-3 md:pr-6 mr-1 shrink-0">SGPC</h1>

        <nav className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-none">
          <button
            onClick={handleTransparencia}
            className={`text-xs md:text-sm font-semibold px-2 md:px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              location.pathname.startsWith('/transparencia') ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            Solicitudes de transparencia
          </button>
        </nav>
      </div>

      {/* Lado derecho */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setNotifAbierto(!notifAbierto); }}
            className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold px-2 md:px-3 py-1.5 rounded-md transition-all ${
              notifAbierto ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="hidden sm:inline">Notificaciones</span>
          </button>

          {notifAbierto && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
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
          onClick={() => navigate('/')}
          className="text-xs hover:text-red-300 transition-colors uppercase tracking-wider font-bold whitespace-nowrap"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default Header;
