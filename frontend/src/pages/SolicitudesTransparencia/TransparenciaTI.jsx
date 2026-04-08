import React, { useState, useRef, useEffect } from 'react';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import { useTransparencia } from '../../hooks/useTransparencia';
import { TransparenciaLayout } from '../../components/SolicitudesTransparencia/TransparenciaLayout';
import { SolicitudCard } from '../../components/SolicitudesTransparencia/SolicitudCard';

const SolicitudesTransparenciaTI = () => {
  const fileInputRef = useRef(null);
  const capturaInputRef = useRef(null);
  const nuevaSolicitudFileInputRef = useRef(null);

  const [modalAbierta, setModalAbierta] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [dropdownAbierto, setDropdownAbierto] = useState(null);

  const [modalNuevaSolicitudAbierta, setModalNuevaSolicitudAbierta] = useState(false);
  const [nuevaSolicitudNombre, setNuevaSolicitudNombre] = useState("");
  const [nuevaSolicitudArchivo, setNuevaSolicitudArchivo] = useState(null);

  const state = useTransparencia(mockSolicitudes);

  useEffect(() => {
    if (dropdownAbierto === null) return;
    const handler = () => setDropdownAbierto(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [dropdownAbierto]);

  const respuestasMock = [
    { id: 101, responsable: "Carlos Rivera", archivo: "respuesta_carlos.pdf" },
    { id: 102, responsable: "Ana Gómez", archivo: "dictamen_legal.pdf" },
    { id: 103, responsable: "Marcos Peña", archivo: "anexo_tecnico_v1.docx" },
    { id: 104, responsable: "Sofía Islas", archivo: "oficio_validacion.pdf" },
  ];

  const iniciarEdicion = (sol) => {
    setEditandoId(sol.id);
    setNuevoNombre(sol.nombre);
  };

  const guardarNombre = (id) => {
    if (nuevoNombre.trim().length === 0) return;
    state.setSolicitudes(state.solicitudes.map(sol => sol.id === id ? { ...sol, nombre: nuevoNombre } : sol));
    setEditandoId(null);
  };

  return (
    <>
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" />
      <input type="file" ref={capturaInputRef} className="hidden" accept=".jpg,.jpeg,.png" />

      <TransparenciaLayout
        {...state}
        headerActions={
          <button
            onClick={() => setModalNuevaSolicitudAbierta(true)}
            className="w-full md:w-auto bg-[#009642] text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg active:scale-95 font-bold text-sm shrink-0"
          >
            + Nueva Solicitud
          </button>
        }
      >
        {state.solicitudesFiltradas.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-semibold text-sm">
            No se encontraron solicitudes.
          </div>
        )}

        {state.solicitudesFiltradas.map((sol) => (
          <SolicitudCard
            key={sol.id}
            solicitud={sol}
            onVerClick={editandoId === sol.id ? null : () => { }}
            titleComponent={
              editandoId === sol.id ? (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                    <input
                      type="text"
                      value={nuevoNombre}
                      maxLength={70}
                      onChange={(e) => setNuevoNombre(e.target.value)}
                      className="w-full md:flex-1 border-b-2 border-blue-500 outline-none text-lg md:text-xl font-bold text-gray-800 bg-transparent focus:border-blue-700 transition-colors"
                      autoFocus
                    />
                    <div className="flex gap-4 shrink-0">
                      <button onClick={() => guardarNombre(sol.id)} className="text-green-600 font-bold text-xs hover:text-green-800 transition-colors active:scale-95">Guardar</button>
                      <button onClick={() => setEditandoId(null)} className="text-red-600 font-bold text-xs hover:text-red-800 transition-colors active:scale-95">Cancelar</button>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold tracking-widest ${nuevoNombre.length >= 60 ? 'text-red-500' : 'text-gray-400'}`}>
                    Caracteres: {nuevoNombre.length} / 70
                  </span>
                </div>
              ) : null
            }
          >
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setDropdownAbierto(dropdownAbierto === sol.id ? null : sol.id); }}
                className="px-3 py-1.5 text-[10px] font-bold border-2 border-gray-400 text-gray-600 rounded-lg transition-all duration-200 hover:bg-gray-100 active:scale-95 flex items-center gap-1"
              >
                Operaciones
                <span className="text-[8px]">{dropdownAbierto === sol.id ? '▲' : '▼'}</span>
              </button>
              {dropdownAbierto === sol.id && (
                <div className="absolute left-0 bottom-full mb-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[200px]">
                  <button onClick={() => { iniciarEdicion(sol); setDropdownAbierto(null); }} className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cambiar nombre</button>
                  <button onClick={() => { fileInputRef.current.click(); setDropdownAbierto(null); }} className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cambiar archivo</button>
                  <button onClick={() => { capturaInputRef.current.click(); setDropdownAbierto(null); }} className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-colors">Subir captura de entrega</button>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={() => setDropdownAbierto(null)} className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors">Eliminar</button>
                </div>
              )}
            </div>

            <button
              onClick={() => { setSolicitudSeleccionada(sol); setModalAbierta(true); }}
              className="bg-[#1e4b8f] text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md whitespace-nowrap transition-all duration-200 hover:bg-[#153566] hover:shadow-lg active:scale-95"
            >
              Ver Respuesta
            </button>
          </SolicitudCard>
        ))}
      </TransparenciaLayout>

      {/* Ventana Modal Responsiva */}
      {modalAbierta && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="bg-[#1e4b8f] p-5 text-white text-center">
              <h3 className="font-bold text-xs tracking-widest">Respuesta de la solicitud</h3>
            </div>

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
                <button className="w-full sm:w-auto order-1 sm:order-2 bg-[#009642] text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all hover:bg-green-700 active:scale-95">Descargar todo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ventana Modal Nueva Solicitud */}
      {modalNuevaSolicitudAbierta && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-[#1e4b8f] p-5 text-white text-center">
              <h3 className="font-bold text-sm tracking-widest">Agregar nueva solicitud de transparencia</h3>
            </div>

            <div className="p-6 md:p-8 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex flex-col gap-2 flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre de la solicitud</label>
                    <input
                      type="text"
                      value={nuevaSolicitudNombre}
                      onChange={(e) => setNuevaSolicitudNombre(e.target.value)}
                      placeholder="Ingrese el nombre"
                      className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#1e4b8f] transition-colors"
                    />
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    <input
                      type="file"
                      ref={nuevaSolicitudFileInputRef}
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={(e) => setNuevaSolicitudArchivo(e.target.files[0])}
                    />
                    <button
                      onClick={() => nuevaSolicitudFileInputRef.current.click()}
                      className="w-full bg-[#1e4b8f] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#153566] transition-colors whitespace-nowrap shadow-sm active:scale-95 border-2 border-[#1e4b8f]"
                    >
                      Adjuntar archivo
                    </button>
                  </div>
                </div>

                {nuevaSolicitudArchivo && (
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3 animate-in fade-in zoom-in duration-200">
                    <span className="text-lg">📄</span>
                    <span className="text-sm text-gray-700 font-medium truncate flex-1">{nuevaSolicitudArchivo.name}</span>
                    <button 
                      onClick={() => setNuevaSolicitudArchivo(null)}
                      className="text-red-500 hover:text-red-700 font-bold p-1 bg-red-50 rounded-lg h-8 w-8 flex items-center justify-center transition-colors"
                      title="Quitar archivo"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end items-center gap-3 mt-4 border-t border-gray-100 pt-6">
                <button
                  onClick={() => {
                    setModalNuevaSolicitudAbierta(false);
                    setNuevaSolicitudNombre("");
                    setNuevaSolicitudArchivo(null);
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (nuevaSolicitudArchivo && nuevaSolicitudNombre.trim() !== "") {
                      setModalNuevaSolicitudAbierta(false);
                      setNuevaSolicitudNombre("");
                      setNuevaSolicitudArchivo(null);
                    }
                  }}
                  disabled={!nuevaSolicitudArchivo || nuevaSolicitudNombre.trim() === ""}
                  className={`px-8 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 ${
                    (nuevaSolicitudArchivo && nuevaSolicitudNombre.trim() !== "") 
                      ? "bg-[#009642] text-white hover:bg-green-700 cursor-pointer" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SolicitudesTransparenciaTI;