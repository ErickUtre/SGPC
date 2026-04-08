import React, { useState } from 'react';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import { useTransparencia } from '../../hooks/useTransparencia';
import { TransparenciaLayout } from '../../components/SolicitudesTransparencia/TransparenciaLayout';
import { SolicitudCard } from '../../components/SolicitudesTransparencia/SolicitudCard';

const SolicitudesTransparenciaContralora = () => {
  const [modalAbierta, setModalAbierta] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalValidar, setModalValidar] = useState(false);
  const [modalProrroga, setModalProrroga] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [solicitudACancelar, setSolicitudACancelar] = useState(null);

  const opcionesAsignacion = [
    "Directora de auditoría",
    "Director de Control y Evaluación",
    "Director de Responsabilidades Administrativas y Situación Patrimonial",
    "Coordinación Administrativa"
  ];

  const respuestasMock = [
    { id: 101, responsable: "Carlos Rivera", archivo: "respuesta_carlos.pdf" },
    { id: 102, responsable: "Ana Gómez", archivo: "dictamen_legal.pdf" },
    { id: 103, responsable: "Marcos Peña", archivo: "anexo_tecnico_v1.docx" },
    { id: 104, responsable: "Sofía Islas", archivo: "oficio_validacion.pdf" },
  ];

  const state = useTransparencia(mockSolicitudes);

  const confirmarValidacion = () => {
    state.setSolicitudes(state.solicitudes.map(s => s.id === solicitudSeleccionada.id ? { ...s, validada: true } : s));
    setModalValidar(false);
    setModalAbierta(false);
  };

  const confirmarAsignacion = (id) => {
    state.setSolicitudes(state.solicitudes.map(s => s.id === id ? { ...s, asignada: true } : s));
    setModalAsignar(false);
  };

  const abrirModalCancelar = (sol) => {
    setSolicitudACancelar(sol);
    setModalCancelar(true);
  };

  const confirmarCancelacion = () => {
    state.setSolicitudes(state.solicitudes.map(s => s.id === solicitudACancelar.id ? { ...s, cancelada: true } : s));
    setModalCancelar(false);
    setSolicitudACancelar(null);
  };

  return (
    <>
      <TransparenciaLayout {...state}>
        {state.solicitudesFiltradas.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-semibold text-sm">
            No se encontraron solicitudes.
          </div>
        )}
        {state.solicitudesFiltradas.map((sol) => (
          <SolicitudCard key={sol.id} solicitud={sol} onVerClick={() => { }}>
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-wrap w-full">
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => { setSolicitudSeleccionada(sol); setModalProrroga(true); }}
                  className="w-full sm:w-auto px-4 py-2 text-[10px] font-bold border-2 border-orange-500 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 whitespace-nowrap"
                >
                  Ver solicitudes de prorroga
                </button>
                {sol.id === 1 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                    1
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
                    onClick={() => { setSolicitudSeleccionada(sol); setModalAsignar(true); }}
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
                {opcionesAsignacion.map(opcion => (
                  <label key={opcion} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group">
                    <input type="checkbox" className="w-5 h-5 rounded accent-[#1e4b8f] cursor-pointer" />
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1e4b8f]">{opcion}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <button onClick={() => setModalAsignar(false)} className="px-6 py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">Cancelar</button>
                <button onClick={() => confirmarAsignacion(solicitudSeleccionada.id)} className="bg-[#009642] text-white px-10 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-green-700 transition-all active:scale-95">
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
                {respuestasMock.map(resp => (
                  <div key={resp.id} className="relative bg-white p-3 md:p-4 rounded-lg border border-gray-100 transition-colors hover:border-blue-200">
                    <div className="min-w-0 pr-10">
                      <p className="text-sm font-bold text-gray-800 truncate">{resp.archivo}</p>
                      <p className="text-[10px] text-gray-400 italic">Por: {resp.responsable}</p>
                    </div>
                    <button className="absolute top-2 right-2 text-[#1e4b8f] font-bold text-[10px] border border-blue-400 px-2 py-1 rounded transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95">Ver</button>
                  </div>
                ))}
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
                    className="w-full sm:w-auto order-1 sm:order-2 bg-[#1e4b8f] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:bg-[#153566] active:scale-95"
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
              Solicitudes de prorroga de la solicitud de transparencia
              <span className="block mt-1 font-black opacity-90">{solicitudSeleccionada?.nombre}</span>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-3">Responsables que solicitaron prorroga</p>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-800 font-bold text-sm">Directora de auditoría</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-gray-100 mt-2">
                <button
                  onClick={() => setModalProrroga(false)}
                  className="px-6 py-3 text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors w-full sm:w-auto active:scale-95 outline-none"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setModalProrroga(false);
                  }}
                  className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md hover:bg-orange-600 transition-all active:scale-95 w-full sm:w-auto outline-none"
                >
                  Asignar prorroga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SolicitudesTransparenciaContralora;