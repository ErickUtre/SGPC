import React, { useState, useEffect, useMemo } from 'react';
import { useTransparencia } from '../../hooks/useTransparencia';
import { TransparenciaLayout } from '../../components/SolicitudesTransparencia/TransparenciaLayout';
import { SolicitudCard } from '../../components/SolicitudesTransparencia/SolicitudCard';
import { API_BASE, normalizarSolicitudReal } from '../../utils/solicitudesTransparencia';
import { abrirArchivoPNTEnPestana } from '../../utils/solicitudesArchivos';

const SolicitudesTransparenciaContralora = () => {
  const [modalAbierta, setModalAbierta] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalValidar, setModalValidar] = useState(false);
  const [modalProrroga, setModalProrroga] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [solicitudACancelar, setSolicitudACancelar] = useState(null);

  const [responsables, setResponsables] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);



  const state = useTransparencia([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [cargandoResponsables, setCargandoResponsables] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  
  const [listaEvidencias, setListaEvidencias] = useState([]);
  const [cargandoEvidencias, setCargandoEvidencias] = useState(false);

  const [peticionesProrroga, setPeticionesProrroga] = useState([]);
  const [cargandoPeticiones, setCargandoPeticiones] = useState(false);
  const [diasProrrogaInput, setDiasProrrogaInput] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      console.warn("[Frontend] No hay token en sessionStorage");
      setCargandoSolicitudes(false);
      setCargandoResponsables(false);
      return;
    }

    setCargandoSolicitudes(true);
    setCargandoResponsables(true);

    // Cargar solicitudes de forma independiente
    fetch(`${API_BASE}/solicitudes`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then(res => {
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log("[Frontend] Respuesta solicitudes:", data);
      if (data.ok) {
        state.setSolicitudes(data.solicitudes.map(normalizarSolicitudReal));
        setErrorCarga('');
      } else {
        setErrorCarga(data.mensaje || 'Error al cargar solicitudes');
      }
    })
    .catch(err => {
      console.error("[Frontend] Error fetch solicitudes:", err);
      setErrorCarga('No se pudo conectar con el servidor para obtener las solicitudes.');
    })
    .finally(() => setCargandoSolicitudes(false));

    // Cargar responsables de forma independiente
    fetch(`${API_BASE}/usuarios/responsables`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
    .then(res => {
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log("[Frontend] Respuesta responsables:", data);
      if (data.ok) {
        setResponsables(data.usuarios);
      }
    })
    .catch(err => console.error("[Frontend] Error fetch responsables:", err))
    .finally(() => setCargandoResponsables(false));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (modalAbierta && solicitudSeleccionada) {
      const fetchEvidencias = async () => {
        setCargandoEvidencias(true);
        try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(`${API_BASE}/solicitudes/${solicitudSeleccionada.idOriginal}/evidencias`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.ok) {
            setListaEvidencias(data.evidencias);
          } else {
            setListaEvidencias([]);
          }
        } catch (error) {
          console.error("Error al cargar evidencias:", error);
          setListaEvidencias([]);
        } finally {
          setCargandoEvidencias(false);
        }
      };
      fetchEvidencias();
    } else {
      setListaEvidencias([]);
    }
  }, [modalAbierta, solicitudSeleccionada]);

  const todasEvidenciasSubidas = useMemo(() => {
    return listaEvidencias.length > 0 && listaEvidencias.every(ev => ev.IdEvidencia !== null);
  }, [listaEvidencias]);

  const descargarArchivoEvidencia = async (idEvidencia) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/evidencia/${idEvidencia}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        window.alert('No se pudo abrir la evidencia.');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      window.alert('Error al conectar con el servidor.');
    }
  };

  const confirmarValidacion = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${solicitudSeleccionada.idOriginal}/resolver`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        state.setSolicitudes(state.solicitudes.map(s => 
          s.id === solicitudSeleccionada.id ? { ...s, validada: true } : s
        ));
        setModalValidar(false);
        setModalAbierta(false);
      } else {
        window.alert('Error al marcar la solicitud como resuelta.');
      }
    } catch (error) {
      window.alert('Error al conectar con el servidor.');
    }
  };

  const confirmarAsignacion = async () => {
    if (seleccionados.length === 0) return;

    if (solicitudSeleccionada.asignada) {
      const confirmar = window.confirm(
        'Atención: Al reasignar responsables se eliminarán permanentemente todas las respuestas y evidencias subidas hasta el momento para esta solicitud. ¿Deseas continuar?'
      );
      if (!confirmar) return;
    }
    
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/solicitudes/${solicitudSeleccionada.idOriginal}/turnar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ idsResponsables: seleccionados }),
      });

      if (response.ok) {
        state.setSolicitudes(state.solicitudes.map(s => 
          s.id === solicitudSeleccionada.id 
            ? { ...s, asignada: true, evidenciaSubida: false, validada: false } 
            : s
        ));
        setModalAsignar(false);
        setSeleccionados([]);
      }
    } catch (error) {
      console.error("Error al asignar responsables", error);
    }
  };

  const abrirModalReasignar = async (sol) => {
    setSolicitudSeleccionada(sol);
    setSeleccionados([]); // Limpiar selección previa mientras carga
    setModalAsignar(true);
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${sol.idOriginal}/turnados`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.ok) {
        setSeleccionados(data.turnados);
      }
    } catch (error) {
      console.error("Error al cargar turnados actuales", error);
    }
  };

  const toggleSeleccion = (id) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const abrirModalCancelar = (sol) => {
    setSolicitudACancelar(sol);
    setModalCancelar(true);
  };

  const confirmarCancelacion = async () => {
    if (!solicitudACancelar) return;
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${solicitudACancelar.idOriginal}/cancelar`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.ok) {
        state.setSolicitudes(state.solicitudes.map(s => s.id === solicitudACancelar.id ? { ...s, cancelada: true } : s));
      } else {
        window.alert(data.mensaje || 'Error al cancelar la solicitud.');
      }
    } catch (error) {
      window.alert('Error al conectar con el servidor.');
    } finally {
      setModalCancelar(false);
      setSolicitudACancelar(null);
    }
  };

  useEffect(() => {
    if (modalProrroga && solicitudSeleccionada) {
      setDiasProrrogaInput('');
      const fetchPeticiones = async () => {
        setCargandoPeticiones(true);
        try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(`${API_BASE}/solicitudes/${solicitudSeleccionada.idOriginal}/prorrogas`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.ok) {
            setPeticionesProrroga(data.peticiones);
          } else {
            setPeticionesProrroga([]);
          }
        } catch {
          setPeticionesProrroga([]);
        } finally {
          setCargandoPeticiones(false);
        }
      };
      fetchPeticiones();
    } else {
      setPeticionesProrroga([]);
    }
  }, [modalProrroga, solicitudSeleccionada]);

  const confirmarAignacionProrroga = async () => {
    const dias = parseInt(diasProrrogaInput, 10);
    if (!dias || dias < 1 || dias > 100) return;

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${solicitudSeleccionada.idOriginal}/prorroga`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ dias })
      });
      const data = await response.json();
      if (response.ok && data.ok) {
        state.setSolicitudes(state.solicitudes.map(s => {
          if (s.id === solicitudSeleccionada.id) {
            return {
              ...s,
              diasProrroga: s.diasProrroga + dias,
              solicitudesProrrogaCount: 0
            };
          }
          return s;
        }));
        setModalProrroga(false);
        window.alert(`Se han asignado ${dias} días de prórroga exitosamente.`);
      } else {
        window.alert(data.mensaje || 'Error al asignar prórroga.');
      }
    } catch {
      window.alert('Error al conectar con el servidor.');
    }
  };

  return (
    <>
      <TransparenciaLayout {...state}>
        {cargandoSolicitudes && (
          <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm font-semibold">Cargando solicitudes de base de datos...</span>
          </div>
        )}

        {errorCarga && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl text-center mb-6 animate-in fade-in duration-300">
            <p className="font-bold text-sm mb-2">Hubo un problema al cargar los datos</p>
            <p className="text-xs opacity-80">{errorCarga}</p>
          </div>
        )}

        {!cargandoSolicitudes && !errorCarga && state.solicitudesFiltradas.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-semibold text-sm">
            No se encontraron solicitudes.
          </div>
        )}
        {state.solicitudesFiltradas.map((sol) => (
          <SolicitudCard key={sol.id} solicitud={sol} onVerClick={() => abrirArchivoPNTEnPestana(sol)}>
            {!sol.cancelada && (
              <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap w-full">
                <div className="relative w-full sm:w-auto">
                  <button
                    onClick={() => { setSolicitudSeleccionada(sol); setModalProrroga(true); }}
                    className="w-full sm:w-auto px-4 py-2 text-[10px] font-bold border-2 border-orange-500 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 whitespace-nowrap"
                  >
                    Ver solicitudes de prórroga
                  </button>
                  {sol.solicitudesProrrogaCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                      {sol.solicitudesProrrogaCount}
                    </span>
                  )}
                </div>
                {!sol.asignada ? (
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => { setSolicitudSeleccionada(sol); setModalAsignar(true); }}
                      className="bg-[#009642] text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-green-700 transition-all active:scale-95"
                    >
                      Asignar
                    </button>
                    <button
                      onClick={() => abrirModalCancelar(sol)}
                      className="px-3 py-2 text-[10px] font-bold border-2 border-gray-400 text-gray-500 rounded-xl hover:bg-gray-400 hover:text-white transition-all active:scale-95"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => abrirModalReasignar(sol)}
                      className="px-3 py-2 text-[10px] font-bold border-2 border-yellow-500 text-yellow-500 rounded-xl hover:bg-yellow-500 hover:text-white transition-all active:scale-95"
                    >
                      Reasignar
                    </button>
                    <button
                      onClick={() => { setSolicitudSeleccionada(sol); setModalAbierta(true); }}
                      className="bg-[#1e4b8f] text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-[#153566] transition-all active:scale-95"
                    >
                      Ver Respuesta
                    </button>
                    <button
                      onClick={() => abrirModalCancelar(sol)}
                      className="px-3 py-2 text-[10px] font-bold border-2 border-gray-400 text-gray-500 rounded-xl hover:bg-gray-400 hover:text-white transition-all active:scale-95"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            )}
          </SolicitudCard>
        ))}
      </TransparenciaLayout>

      {/* MODAL ASIGNAR RESPONSABLES */}
      {modalAsignar && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#1e4b8f] p-5 text-white text-center font-bold text-xs tracking-widest">
              Asignar Responsables
            </div>
            <div className="p-8">
              <div className="space-y-3 mb-8">
                {responsables.map(resp => (
                  <label key={resp.IdUsuario} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded accent-[#1e4b8f] cursor-pointer" 
                      checked={seleccionados.includes(resp.IdUsuario)}
                      onChange={() => toggleSeleccion(resp.IdUsuario)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1e4b8f]">{resp.nombre}</span>
                      <span className="text-[10px] text-gray-400">{resp.correo}</span>
                    </div>
                  </label>
                ))}
                
                {cargandoResponsables && (
                  <div className="flex flex-col items-center py-4 gap-2 text-gray-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <p className="text-xs font-bold tracking-wider">Buscando responsables...</p>
                  </div>
                )}

                {!cargandoResponsables && responsables.length === 0 && (
                  <p className="text-center text-gray-400 text-sm italic py-4">No se encontraron responsables registrados en el sistema.</p>
                )}
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => { setModalAsignar(false); setSeleccionados([]); }} className="px-6 py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">Cancelar</button>
                <button onClick={confirmarAsignacion} className="bg-[#009642] text-white px-10 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-green-700 transition-all active:scale-95">
                  Confirmar Asignación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER RESPUESTA CON VALIDACIÓN */}
      {modalAbierta && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-[#1e4b8f] p-5 text-white text-center font-bold text-xs tracking-widest">Respuesta de la solicitud</div>
            <div className="p-6 md:p-10 text-center flex flex-col">
              <p className="text-gray-400 mb-1 text-[9px] font-bold tracking-widest">Solicitud Relacionada</p>
              <h4 className="font-bold text-gray-900 text-lg mb-6 border-b border-gray-100 pb-4 break-words">{solicitudSeleccionada?.nombre}</h4>

              <div className="bg-gray-50 rounded-xl p-3 md:p-4 mb-6 border border-gray-100 max-h-60 overflow-y-auto space-y-2 text-left scrollbar-thin scrollbar-thumb-gray-200">
                {cargandoEvidencias ? (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-400 gap-2">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span className="text-xs font-bold tracking-widest">Cargando respuestas...</span>
                  </div>
                ) : listaEvidencias.length === 0 ? (
                  <p className="text-center py-4 text-gray-400 text-sm italic">Ningún responsable ha subido su respuesta aún.</p>
                ) : (
                  listaEvidencias.map((evidencia, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg shrink-0 ${evidencia.IdEvidencia ? 'bg-blue-50 text-[#1e4b8f]' : 'bg-orange-50 text-orange-500'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-gray-800 truncate">{evidencia.nombreResponsable}</span>
                          {evidencia.IdEvidencia ? (
                            <span className="text-[10px] text-gray-500 truncate" title={evidencia.nombreArchivo}>{evidencia.nombreArchivo}</span>
                          ) : (
                            <span className="text-[10px] text-orange-500 font-bold italic tracking-tight">Aún no ha subido evidencia</span>
                          )}
                        </div>
                      </div>
                      {evidencia.IdEvidencia ? (
                        <button 
                          onClick={() => descargarArchivoEvidencia(evidencia.IdEvidencia)}
                          className="w-full sm:w-auto px-4 py-1.5 text-[10px] font-bold border-2 border-[#1e4b8f] text-[#1e4b8f] rounded-lg hover:bg-[#1e4b8f] hover:text-white transition-all active:scale-95 whitespace-nowrap"
                        >
                          Ver Documento
                        </button>
                      ) : (
                        <div className="w-full sm:w-auto px-4 py-1.5 text-[9px] font-bold text-gray-400 bg-gray-50 rounded-lg border border-gray-100 uppercase tracking-widest text-center">
                          Pendiente
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 border-t border-gray-100 pt-6">
                <button onClick={() => setModalAbierta(false)} className="w-full sm:w-auto order-2 sm:order-1 px-8 py-3 text-xs font-bold text-gray-400 transition-all hover:text-red-600 hover:bg-red-50 rounded-lg active:scale-95">Cerrar ventana</button>
                {solicitudSeleccionada?.validada ? (
                  <span className="w-full sm:w-auto order-1 sm:order-2 bg-green-50 text-[#009642] px-8 py-3 rounded-xl font-black text-xs border border-green-200 text-center">
                    ✓ Respuesta validada
                  </span>
                ) : (
                  <button
                    onClick={() => setModalValidar(true)}
                    disabled={!todasEvidenciasSubidas}
                    className={`w-full sm:w-auto order-1 sm:order-2 px-8 py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all ${
                      todasEvidenciasSubidas 
                        ? 'bg-[#1e4b8f] text-white hover:bg-[#153566] active:scale-95' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Validar respuesta
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR VALIDACIÓN */}
      {modalValidar && (
        <div className="fixed inset-0 bg-black/60 z-[130] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#1e4b8f] p-5 text-white text-center font-bold text-xs tracking-widest">
              Validar Solicitud
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-700 font-semibold text-sm mb-2">¿Seguro que quieres validar la solicitud de transparencia</p>
              <p className="text-gray-900 font-black text-base mb-8 break-words">"{solicitudSeleccionada?.nombre}"?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setModalValidar(false)}
                  className="px-8 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarValidacion}
                  className="bg-[#1e4b8f] text-white px-10 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-[#153566] transition-all active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR CANCELACIÓN */}
      {modalCancelar && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-gray-500 p-5 text-white text-center font-bold text-xs tracking-widest">
              Cancelar Solicitud
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-700 font-semibold text-sm mb-2">¿Seguro que quieres cancelar la solicitud de transparencia</p>
              <p className="text-gray-900 font-black text-base mb-8 break-words">"{solicitudACancelar?.nombre}"?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => { setModalCancelar(false); setSolicitudACancelar(null); }}
                  className="px-8 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCancelacion}
                  className="bg-gray-500 text-white px-10 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-gray-600 transition-all active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER SOLICITUDES DE PRORROGA */}
      {modalProrroga && (
        <div className="fixed inset-0 bg-black/60 z-[140] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#1e4b8f] p-5 text-white text-center font-bold text-xs tracking-widest leading-relaxed">
              Solicitudes de prórroga de la solicitud de transparencia
              <span className="block mt-1 font-black opacity-90">{solicitudSeleccionada?.nombre}</span>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-3">Responsables que solicitaron prórroga</p>
                <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-2 bg-gray-50">
                  {cargandoPeticiones ? (
                    <div className="text-center py-4 text-xs font-semibold text-gray-400">Cargando...</div>
                  ) : peticionesProrroga.length === 0 ? (
                    <div className="text-center py-4 text-xs font-semibold text-gray-400">Nadie ha solicitado prórroga aún.</div>
                  ) : (
                    peticionesProrroga.map((pet) => (
                      <div key={pet.IdProrroga} className="bg-white border border-gray-200 p-3 rounded-lg flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-gray-800 font-bold text-sm truncate">{pet.nombre}</span>
                          <span className="text-[10px] text-gray-400">Solicitó extensión el {new Date(pet.fechaSolicitud).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {peticionesProrroga.length > 0 && !cargandoPeticiones && (
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-[#1e4b8f] tracking-widest mb-2">Deseo otorgar la siguiente cantidad de días extra:</p>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    value={diasProrrogaInput}
                    onChange={(e) => setDiasProrrogaInput(e.target.value)}
                    placeholder="Ej: 5"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-[#1e4b8f] transition-all"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-gray-100 mt-2">
                <button
                  onClick={() => setModalProrroga(false)}
                  className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors w-full sm:w-auto active:scale-95 outline-none"
                >
                  {peticionesProrroga.length === 0 ? 'Cerrar' : 'Cancelar'}
                </button>
                {peticionesProrroga.length > 0 && !cargandoPeticiones && (
                  <button
                    onClick={confirmarAignacionProrroga}
                    disabled={!diasProrrogaInput || parseInt(diasProrrogaInput, 10) < 1 || parseInt(diasProrrogaInput, 10) > 100}
                    className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-orange-600 transition-all active:scale-95 w-full sm:w-auto outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Asignar prórroga
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SolicitudesTransparenciaContralora;