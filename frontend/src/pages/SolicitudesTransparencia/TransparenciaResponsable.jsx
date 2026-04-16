import React, { useState, useRef, useEffect } from 'react';
import { useTransparencia } from '../../hooks/useTransparencia';
import { TransparenciaLayout } from '../../components/SolicitudesTransparencia/TransparenciaLayout';
import { SolicitudCard } from '../../components/SolicitudesTransparencia/SolicitudCard';
import { API_BASE, normalizarSolicitudReal } from '../../utils/solicitudesTransparencia';
import { abrirArchivoPNTEnPestana } from '../../utils/solicitudesArchivos';

const SolicitudesTransparenciaResponsable = () => {
  const respuestaInputRef = useRef(null);
  const oficioInputRef = useRef(null);
  const state = useTransparencia([]);
  const [solicitudProrroga, setSolicitudProrroga] = useState(null);
  const [motivoProrroga, setMotivoProrroga] = useState('');
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
  
  // Estado para saber a qué solicitud le estamos subiendo/modificando la evidencia
  const [solicitudEnAccion, setSolicitudEnAccion] = useState(null);
  const [isSubiendo, setIsSubiendo] = useState(false);

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

  const abrirInputRespuesta = (sol) => {
    setSolicitudEnAccion(sol);
    respuestaInputRef.current.click();
  };

  const handleSubirRespuesta = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo || !solicitudEnAccion) return;

    // Resetear el input para permitir subir el mismo archivo si es necesario
    e.target.value = '';

    setIsSubiendo(true);
    try {
      const token = sessionStorage.getItem('token');
      const formData = new FormData();
      formData.append('evidencia', archivo);

      const response = await fetch(`${API_BASE}/solicitudes/${solicitudEnAccion.idOriginal}/evidencia-responsable/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        window.alert(data.mensaje || 'Error al subir la respuesta.');
        return;
      }

      // Actualizar estado local para reflejar que la evidencia fue subida
      state.setSolicitudes(state.solicitudes.map(s => 
        s.id === solicitudEnAccion.id ? { ...s, evidenciaSubida: true } : s
      ));

      window.alert('Respuesta subida correctamente.');
    } catch {
      window.alert('No se pudo conectar con el servidor.');
    } finally {
      setIsSubiendo(false);
      setSolicitudEnAccion(null);
    }
  };

  const verRespuestaSubida = async (sol) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${sol.idOriginal}/evidencia-responsable/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        window.alert(data?.mensaje || 'No se pudo abrir la respuesta.');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      window.alert('No se pudo conectar con el servidor.');
    }
  };

  const handleSolicitarProrroga = async () => {
    if (!solicitudProrroga) return;
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/solicitudes/${solicitudProrroga.idOriginal}/prorroga`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ motivo: motivoProrroga })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        window.alert(data.mensaje || 'Error al solicitar la prórroga.');
      } else {
        state.setSolicitudes(state.solicitudes.map(s => 
          s.id === solicitudProrroga.id ? { ...s, yaSolicitoProrroga: true } : s
        ));
        window.alert('Prórroga solicitada. La Contralora será notificada.');
      }
    } catch {
      window.alert('Error al conectar con el servidor.');
    } finally {
      setSolicitudProrroga(null);
      setMotivoProrroga('');
    }
  };

  return (
    <>
      <input type="file" ref={respuestaInputRef} className="hidden" accept=".pdf" onChange={handleSubirRespuesta} />
      <input type="file" ref={oficioInputRef} className="hidden" accept=".pdf,.doc,.docx" />

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
          <SolicitudCard
            key={sol.id}
            solicitud={sol}
            onVerClick={() => abrirArchivoPNTEnPestana(sol)}
            oficioButton={
              <button
                onClick={async () => {
                  try {
                    const token = sessionStorage.getItem('token');
                    const resp = await fetch(`${API_BASE}/solicitudes/${sol.idOriginal}/oficio`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!resp.ok) {
                      const err = await resp.json().catch(() => ({}));
                      window.alert(err.mensaje || 'Aún no se ha generado el oficio para esta solicitud.');
                      return;
                    }
                    const blob = await resp.blob();
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                  } catch (error) {
                    window.alert('Error al conectar con el servidor.');
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-[#1e4b8f] text-white rounded-lg transition-all hover:bg-blue-800 active:scale-95 whitespace-nowrap w-fit shadow-md"
              >
                Ver Oficio
              </button>
            }
          >
            {!sol.cancelada && (
              <>
                {sol.evidenciaSubida ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => verRespuestaSubida(sol)}
                      className="px-3 py-1.5 text-[10px] font-bold border-2 border-[#1e4b8f] bg-[#1e4b8f] text-white rounded-lg transition-all hover:bg-blue-800 active:scale-95 flex items-center gap-1 shadow-sm"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      Ver respuesta
                    </button>
                    <button
                      onClick={() => abrirInputRespuesta(sol)}
                      disabled={isSubiendo}
                      className="px-3 py-1.5 text-[10px] font-bold border-2 border-orange-500 text-orange-600 rounded-lg transition-all hover:bg-orange-500 hover:text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Modificar respuesta
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => abrirInputRespuesta(sol)}
                    disabled={isSubiendo}
                    className="px-3 py-1.5 text-[10px] font-bold border-2 border-emerald-600 text-emerald-600 rounded-lg transition-all hover:bg-emerald-600 hover:text-white active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubiendo && solicitudEnAccion?.id === sol.id ? 'Subiendo...' : 'Subir respuesta'}
                  </button>
                )}

                <button
                  onClick={() => {
                    if (sol.yaSolicitoProrroga) {
                      window.alert('Ya hay una prorroga en curso');
                    } else {
                      setSolicitudProrroga(sol);
                    }
                  }}
                  className="px-3 py-1.5 text-[10px] font-bold border-2 border-gray-500 text-gray-500 rounded-lg transition-all hover:bg-gray-500 hover:text-white active:scale-95 whitespace-nowrap"
                >
                  Solicitar prórroga
                </button>
              </>
            )}
          </SolicitudCard>
        ))}
      </TransparenciaLayout>

      {/* Modal de Prórroga */}
      {solicitudProrroga && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 flex flex-col gap-6 relative transform transition-all">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Solicitar prórroga</h3>
            <p className="text-gray-600 font-medium leading-relaxed text-sm">
              ¿Seguro que quieres solicitar una prórroga de la solicitud <span className="font-bold text-[#1e4b8f]">{solicitudProrroga.nombre}</span>?
            </p>
            
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Motivo de la prórroga <span className="text-red-400">*</span></label>
              <textarea
                value={motivoProrroga}
                onChange={(e) => setMotivoProrroga(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Explica brevemente por qué necesitas más tiempo... (máx 500 caracteres)"
                className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm resize-none focus:border-[#1e4b8f] outline-none transition-colors"
                required
              />
              <span className="text-[10px] text-gray-400 text-right font-medium">{motivoProrroga.length}/500</span>
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => { setSolicitudProrroga(null); setMotivoProrroga(''); }}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleSolicitarProrroga}
                disabled={!motivoProrroga.trim()}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#1e4b8f] hover:bg-blue-800 transition-all shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SolicitudesTransparenciaResponsable;
