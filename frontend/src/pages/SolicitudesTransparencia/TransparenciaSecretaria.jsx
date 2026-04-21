import React, { useState, useEffect } from 'react';
import { useTransparencia } from '../../hooks/useTransparencia';
import { TransparenciaLayout } from '../../components/SolicitudesTransparencia/TransparenciaLayout';
import { SolicitudCard } from '../../components/SolicitudesTransparencia/SolicitudCard';
import { API_BASE, normalizarSolicitudReal } from '../../utils/solicitudesTransparencia';
import { abrirArchivoPNTEnPestana } from '../../utils/solicitudesArchivos';

const SolicitudesTransparenciaSecretaria = () => {
  const state = useTransparencia([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  const [generandoId, setGenerandoId] = useState(null);

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

  const handleGenerarPaquete = async (sol) => {
    if (generandoId) return;
    setGenerandoId(sol.id);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${sol.idOriginal}/paquete?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        window.alert(data.mensaje || 'Error al generar el paquete.');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Paquete_${sol.nombre.replace(/[^a-z0-9]/gi, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.alert('Error al conectar con el servidor.');
    } finally {
      setGenerandoId(null);
    }
  };

  return (
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
      {state.solicitudesFiltradas.length === 0 && (
        <div className="text-center py-16 text-gray-400 font-semibold text-sm">
          No se encontraron solicitudes.
        </div>
      )}

      {state.solicitudesFiltradas.map((sol) => (
        <SolicitudCard key={sol.id} solicitud={sol} onVerClick={() => abrirArchivoPNTEnPestana(sol)}>
          {!sol.cancelada && (
            <button 
              onClick={() => handleGenerarPaquete(sol)}
              disabled={generandoId === sol.id || !sol.capturaEntregaDisponible}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap shadow-md flex items-center gap-2 ${
                (generandoId === sol.id || !sol.capturaEntregaDisponible)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {generandoId === sol.id ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Generar paquete
                </>
              )}
            </button>
          )}
        </SolicitudCard>
      ))}
    </TransparenciaLayout>
  );
};

export default SolicitudesTransparenciaSecretaria;
