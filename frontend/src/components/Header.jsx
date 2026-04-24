import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import contraloriaImg from '../assets/contraloria.png';
import { getNotificaciones, marcarComoLeida } from '../api/notificaciones';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifAbierto, setNotifAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  
  const userRole = sessionStorage.getItem('userRole');
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [perfilCorreo, setPerfilCorreo] = useState('');
  const [perfilPassword, setPerfilPassword] = useState('');
  
  // Edit states for Profile Modal
  const [editandoCorreo, setEditandoCorreo] = useState(false);
  const [editandoPassword, setEditandoPassword] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);

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

  const abrirPerfil = async () => {
    setPerfilAbierto(true);
    setPerfilPassword('');
    setEditandoCorreo(false);
    setEditandoPassword(false);
    setMostrarPassword(false);
    setCargandoPerfil(true);
    try {
      const token = sessionStorage.getItem('token');
      // Importante usar ruta absoluta y el prefijo de la API local
      const res = await fetch(`http://localhost:3001/api/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) setPerfilCorreo(data.perfil.correo);
    } catch (e) {
      console.error('Error al cargar perfil', e);
    } finally {
      setCargandoPerfil(false);
    }
  };

  const guardarPerfil = async () => {
    try {
      setCargandoPerfil(true);
      const token = sessionStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/usuarios/perfil`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo: perfilCorreo, contrasena: perfilPassword })
      });
      const data = await res.json();
      if (data.ok) {
        window.alert('Actualizado correctamente. Usa estos datos para tu próximo inicio de sesión.');
        setEditandoCorreo(false);
        setEditandoPassword(false);
        setPerfilPassword('');
      } else {
        window.alert(data.mensaje || 'Error al guardar el perfil');
      }
    } catch (e) {
      window.alert('Ocurrió un error de red');
    } finally {
      setCargandoPerfil(false);
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

        {userRole === 'Supervisor' && (
          <button
            onClick={() => navigate('/usuarios')}
            className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              location.pathname.startsWith('/usuarios') 
                ? 'bg-gray-100 text-[#1e4b8f]' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#1e4b8f]'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            <span className="hidden sm:inline">Gestión de Usuarios</span>
          </button>
        )}

        <div className="relative">
          <button
            onClick={abrirPerfil}
            className={`flex items-center gap-1.5 text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-all relative ${
              perfilAbierto 
                ? 'bg-gray-100 text-[#1e4b8f]' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#1e4b8f]'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="hidden sm:inline">Perfil</span>
          </button>
        </div>

        <button
          onClick={cerrarSesion}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider font-bold whitespace-nowrap pl-2 border-l border-gray-200"
        >
          Cerrar sesión
        </button>
      </div>

      {perfilAbierto && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#1e4b8f] p-5 text-white flex items-center justify-between">
               <h3 className="font-bold tracking-widest text-sm flex items-center gap-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Mi Perfil
               </h3>
               <button onClick={() => setPerfilAbierto(false)} className="text-blue-200 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-6">
               {cargandoPerfil ? (
                 <div className="flex justify-center py-6"><svg className="animate-spin w-8 h-8 text-[#1e4b8f]" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg></div>
               ) : (
                 <div className="flex flex-col gap-5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Correo Electrónico</label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="email" 
                          value={perfilCorreo} 
                          onChange={(e) => setPerfilCorreo(e.target.value)} 
                          maxLength={100}
                          className={`flex-1 border rounded-lg p-3 text-sm outline-none transition-colors ${editandoCorreo ? 'border-[#1e4b8f] bg-white' : 'border-transparent bg-gray-50 text-gray-700'}`} 
                        />
                        {editandoCorreo ? (
                          <div className="flex gap-1">
                            <button onClick={guardarPerfil} disabled={cargandoPerfil} className="p-2.5 bg-[#009642] text-white rounded-lg hover:bg-green-700 transition-colors" title="Guardar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => { setEditandoCorreo(false); abrirPerfil(); }} disabled={cargandoPerfil} className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="Cancelar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setEditandoCorreo(true)} className="p-2.5 bg-blue-50 text-[#1e4b8f] rounded-lg hover:bg-blue-100 transition-colors" title="Editar Correo">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contraseña</label>
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <input 
                            type={mostrarPassword ? "text" : "password"} 
                            value={editandoPassword ? perfilPassword : "••••••••"} 
                            onChange={(e) => setPerfilPassword(e.target.value)} 
                            placeholder={editandoPassword ? "Nueva contraseña..." : ""}
                            maxLength={50}
                            className={`w-full border rounded-lg p-3 pr-10 text-sm outline-none transition-colors tracking-widest ${editandoPassword ? 'border-[#1e4b8f] bg-white' : 'border-transparent bg-gray-50 text-gray-700'}`} 
                          />
                          <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {mostrarPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        </div>
                        {editandoPassword ? (
                          <div className="flex gap-1 shrink-0">
                            <button onClick={guardarPerfil} disabled={cargandoPerfil || perfilPassword === ''} className="p-2.5 bg-[#009642] text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50" title="Guardar Contraseña">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </button>
                            <button onClick={() => { setEditandoPassword(false); setPerfilPassword(''); }} disabled={cargandoPerfil} className="p-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" title="Cancelar">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setEditandoPassword(true)} className="p-2.5 bg-blue-50 text-[#1e4b8f] rounded-lg hover:bg-blue-100 transition-colors shrink-0" title="Editar Contraseña">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
