import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import contraloriaImg from '../assets/contraloria.png';
import { getNotificaciones, marcarComoLeida } from '../api/notificaciones';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifAbierto, setNotifAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);

  const cargarNotificaciones = async () => {
    try {
      const data = await getNotificaciones();
      if (data.ok) {
        setNotificaciones(data.notificaciones);
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  useEffect(() => {
    if (location.pathname !== '/') {
      cargarNotificaciones();
      const interval = setInterval(cargarNotificaciones, 30000); // Actualizar cada 30s
      return () => clearInterval(interval);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!notifAbierto) return;
    const handler = (e) => {
      if (!e.target.closest('#notif-dropdown') && !e.target.closest('#notif-btn')) {
        setNotifAbierto(false);
      }
    };
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
    else if (role === 'Supervisor') navigate('/transparencia/supervisor');
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('authPassed');
    navigate('/');
  };

  const handleMarcarLeida = async (idNotificacion, e) => {
    if (e) e.stopPropagation();
    try {
      await marcarComoLeida(idNotificacion);
      await cargarNotificaciones();
    } catch (error) {
      console.error('Error al marcar leída:', error);
    }
  };

  const formatearFechaHora = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleString('es-MX', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  return (
    <header className="bg-white text-gray-800 border-b border-gray-200 flex justify-between items-center px-4 md:px-8 py-3 z-50 sticky top-0 w-full shadow-sm transition-colors">

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

      <div className="flex items-center gap-3 md:gap-5 shrink-0">

        <div className="relative">
          <button
            id="notif-btn"
            onClick={(e) => { e.stopPropagation(); setNotifAbierto(!notifAbierto); }}
            className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-all relative ${
              notifAbierto 
                ? 'bg-gray-100 text-[#1e4b8f]' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#1e4b8f]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="hidden sm:inline">Notificaciones</span>
            {noLeidas > 0 && (
              <span className="absolute top-0 right-1 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
                {noLeidas}
              </span>
            )}
          </button>

          {notifAbierto && (
            <div id="notif-dropdown" className="absolute right-0 top-full mt-3 w-80 md:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="bg-[#1e4b8f] px-4 py-3 flex justify-between items-center">
                <span className="text-white font-bold text-xs uppercase tracking-widest">Notificaciones</span>
                <div className="flex items-center gap-2">
                  {noLeidas > 0 && (
                    <button 
                      onClick={(e) => handleMarcarLeida('todas', e)}
                      className="text-white hover:text-gray-200 text-[10px] underline"
                    >
                      Marcar leídas
                    </button>
                  )}
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{noLeidas}</span>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
                {notificaciones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-gray-400 font-semibold text-sm">Sin notificaciones</p>
                    <p className="text-gray-300 text-xs mt-1">Aquí aparecerán tus alertas</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notificaciones.map((notif) => (
                      <div 
                        key={notif.IdNotificacion} 
                        className={`p-4 transition-colors relative group cursor-pointer ${notif.leida ? 'bg-white opacity-70' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                        onClick={() => !notif.leida && handleMarcarLeida(notif.IdNotificacion)}
                      >
                        {!notif.leida && (
                          <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-[#1e4b8f] rounded-full"></div>
                        )}
                        <div className="pl-3">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${notif.leida ? 'font-semibold text-gray-700' : 'font-bold text-[#1e4b8f]'}`}>
                              {notif.nombreNotificacion}
                            </h4>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                              {formatearFechaHora(notif.fechaEnvio)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-3">
                            {notif.descripcion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
