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
            <button
              onClick={() => solicitarEliminarSolicitud(sol)}
              className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md transition-all hover:bg-red-700 active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar solicitud
            </button>
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
    </>
  );
};

export default SolicitudesTransparenciaSupervisor;
