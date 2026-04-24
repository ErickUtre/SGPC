import React, { useState, useEffect } from 'react';
import { useTransparencia } from '../../hooks/useTransparencia';
import { TransparenciaLayout } from '../../components/SolicitudesTransparencia/TransparenciaLayout';
import { SolicitudCard } from '../../components/SolicitudesTransparencia/SolicitudCard';
import { API_BASE, normalizarSolicitudReal } from '../../utils/solicitudesTransparencia';
import { abrirArchivoPNTEnPestana } from '../../utils/solicitudesArchivos';

const SolicitudesTransparenciaSupervisor = () => {
  const state = useTransparencia([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [solicitudAEliminar, setSolicitudAEliminar] = useState(null);

  // States for 'Ver Respuesta'
  const [modalAbierta, setModalAbierta] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [listaEvidencias, setListaEvidencias] = useState([]);
  const [cargandoEvidencias, setCargandoEvidencias] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setCargandoSolicitudes(true);

    fetch(`${API_BASE}/solicitudes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) state.setSolicitudes(data.solicitudes.map(normalizarSolicitudReal));
      })
      .catch(() => {})
      .finally(() => setCargandoSolicitudes(false));
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

  const solicitarEliminarSolicitud = (sol) => {
    setSolicitudAEliminar(sol);
    setModalEliminarAbierto(true);
  };

  const handleEliminarSolicitud = async () => {
    if (!solicitudAEliminar) return;

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${solicitudAEliminar.idOriginal}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        window.alert(data.mensaje || 'No se pudo eliminar la solicitud.');
        return;
      }

      state.setSolicitudes(state.solicitudes.filter((item) => item.id !== solicitudAEliminar.id));
      setModalEliminarAbierto(false);
      setSolicitudAEliminar(null);
    } catch {
      window.alert('No se pudo conectar con el servidor.');
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
        {state.solicitudesFiltradas.length === 0 && !cargandoSolicitudes && (
          <div className="text-center py-16 text-gray-400 font-semibold text-sm">
            No se encontraron solicitudes.
          </div>
        )}

        {state.solicitudesFiltradas.map((sol) => (
          <SolicitudCard key={sol.id} solicitud={sol} onVerClick={() => abrirArchivoPNTEnPestana(sol)}>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => { setSolicitudSeleccionada(sol); setModalAbierta(true); }}
                className={`${sol.cancelada ? 'hidden' : 'bg-[#1e4b8f]'} text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md whitespace-nowrap transition-all duration-200 hover:bg-[#153566] hover:shadow-lg active:scale-95`}
              >
                Ver Respuesta
              </button>
              <button
                onClick={() => solicitarEliminarSolicitud(sol)}
                className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md transition-all hover:bg-red-700 active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar solicitud
              </button>
            </div>
          </SolicitudCard>
        ))}
      </TransparenciaLayout>


      {modalEliminarAbierto && (
        <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-red-600 p-5 text-white text-center font-bold text-xs tracking-widest">
              Eliminar Solicitud
            </div>
            <div className="p-8 text-center">
              <p className="text-gray-700 font-bold text-sm mb-4 leading-relaxed">
                ¿Seguro que quieres eliminar definitivamente esta solicitud?
              </p>
              <p className="text-gray-900 font-black text-base mb-4 break-words underline decoration-red-500">
                "{solicitudAEliminar?.nombre}"
              </p>
              <p className="text-red-600 font-bold text-[11px] uppercase tracking-tighter mb-8 bg-red-50 p-3 rounded-lg border border-red-100">
                Esta acción borrará permanentemente todos los archivos PDF, evidencias de responsables y oficios. No quedará rastro en el sistema.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => { setModalEliminarAbierto(false); setSolicitudAEliminar(null); }}
                  className="px-8 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEliminarSolicitud}
                  className="bg-red-600 text-white px-10 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-red-700 transition-all active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalAbierta && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="bg-[#1e4b8f] p-5 text-white text-center">
              <h3 className="font-bold text-xs tracking-widest">Respuesta de la solicitud</h3>
            </div>
            <div className="p-6 md:p-10 text-center flex flex-col">
              <p className="text-gray-400 mb-1 text-[9px] font-bold tracking-widest">Solicitud Relacionada</p>
              <h4 className="font-bold text-gray-900 text-lg mb-6 border-b border-gray-100 pb-4 break-words">{solicitudSeleccionada?.nombre}</h4>
              <div className="bg-gray-50 rounded-xl p-3 md:p-4 mb-6 border border-gray-100 max-h-60 overflow-y-auto space-y-2 text-left">
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
                  listaEvidencias.map((evidencia) => (
                    <div key={evidencia.IdUsuarioResponsable} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg shrink-0 ${evidencia.IdEvidencia ? 'bg-blue-50 text-[#1e4b8f]' : 'bg-orange-50 text-orange-500'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={evidencia.IdEvidencia ? "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" : "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"} /></svg>
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
              <div className="flex justify-center border-t border-gray-100 pt-6">
                <button onClick={() => setModalAbierta(false)} className="w-full px-8 py-3 bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all rounded-xl shadow-sm active:scale-95">Cerrar ventana</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SolicitudesTransparenciaSupervisor;
