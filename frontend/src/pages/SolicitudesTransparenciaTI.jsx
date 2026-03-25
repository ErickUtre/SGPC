import React, { useState, useRef } from 'react';

const SolicitudesTransparenciaTI = () => {
  const fileInputRef = useRef(null);

  const [modalAbierta, setModalAbierta] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");

  const [solicitudes, setSolicitudes] = useState([
    { id: 1, nombre: "Solicitud de Presupuesto 2025", archivo: "presupuesto_req.pdf", folio: "UV-TR-2024-001", fecha: "25/03/2026", hora: "12:00 PM" },
    { id: 2, nombre: "Auditoría Interna Q3", archivo: "auditoria_q3.docx", folio: "UV-TR-2024-002", fecha: "24/03/2026", hora: "09:15 AM" },
    { id: 3, nombre: "Reporte de Gastos de Viaje", archivo: "gastos_viaje_anexo.pdf", folio: "UV-TR-2024-003", fecha: "23/03/2026", hora: "03:45 PM" },
  ]);

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
    setSolicitudes(solicitudes.map(sol => sol.id === id ? { ...sol, nombre: nuevoNombre } : sol));
    setEditandoId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" />

      <main className="max-w-6xl mx-auto p-4 md:p-10 w-full flex-1">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-gray-200 pb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Solicitudes de Transparencia</h2>
          <button className="w-full md:w-auto bg-[#009642] text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg active:scale-95 font-bold text-sm uppercase shrink-0">
            + Nueva Solicitud
          </button>
        </div>

        {/* Listado de Solicitudes */}
        <div className="space-y-6 md:space-y-8">
          {solicitudes.map((sol) => (
            <div key={sol.id} className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-gray-100 p-5 md:p-8 flex flex-col gap-6 relative overflow-hidden transition-all hover:shadow-lg">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 md:w-2 bg-[#1e4b8f]"></div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Folio: {sol.folio}</span>
                
                {editandoId === sol.id ? (
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
                        <button onClick={() => guardarNombre(sol.id)} className="text-green-600 font-bold text-xs hover:text-green-800 uppercase transition-colors active:scale-95">Guardar</button>
                        <button onClick={() => setEditandoId(null)} className="text-red-600 font-bold text-xs hover:text-red-800 uppercase transition-colors active:scale-95">Cancelar</button>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${nuevoNombre.length >= 60 ? 'text-red-500' : 'text-gray-400'}`}>
                      Caracteres: {nuevoNombre.length} / 70
                    </span>
                  </div>
                ) : (
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight break-words">{sol.nombre}</h3>
                )}
              </div>

              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end border-t border-gray-50 pt-6 mt-2 gap-6">
                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Archivo Original</span>
                    <span className="text-sm font-semibold text-[#1e4b8f] hover:underline cursor-pointer truncate max-w-[200px]">{sol.archivo}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Fecha y Hora</span>
                    <span className="text-sm font-medium text-gray-600 italic whitespace-nowrap">{sol.fecha} — {sol.hora}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin scrollbar-thumb-gray-200">
                  <div className="flex gap-2 min-w-max">
                    <button className="px-3 py-1.5 text-[9px] md:text-[10px] font-bold border-2 border-blue-600 text-blue-600 rounded-lg uppercase transition-all duration-200 hover:bg-blue-600 hover:text-white active:scale-95">Ver</button>
                    <button onClick={() => iniciarEdicion(sol)} className="px-3 py-1.5 text-[9px] md:text-[10px] font-bold border-2 border-yellow-500 text-yellow-500 rounded-lg uppercase transition-all duration-200 hover:bg-yellow-500 hover:text-white active:scale-95">Cambiar nombre</button>
                    <button onClick={() => fileInputRef.current.click()} className="px-3 py-1.5 text-[9px] md:text-[10px] font-bold border-2 border-green-600 text-green-600 rounded-lg uppercase transition-all duration-200 hover:bg-green-600 hover:text-white active:scale-95">Cambiar archivo</button>
                    <button className="px-3 py-1.5 text-[9px] md:text-[10px] font-bold border-2 border-red-600 text-red-600 rounded-lg uppercase transition-all duration-200 hover:bg-red-600 hover:text-white active:scale-95">Eliminar</button>
                  </div>
                  <button 
                    onClick={() => { setSolicitudSeleccionada(sol); setModalAbierta(true); }}
                    className="w-full sm:w-auto bg-[#1e4b8f] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase shadow-md flex justify-center items-center gap-2 whitespace-nowrap transition-all duration-200 hover:bg-[#153566] hover:shadow-lg active:scale-95"
                  >
                    Ver Respuesta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Ventana Modal Responsiva */}
      {modalAbierta && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300">
            <div className="bg-[#1e4b8f] p-5 text-white text-center">
              <h3 className="font-bold uppercase text-xs tracking-widest">Respuesta de la solicitud</h3>
            </div>
            
            <div className="p-6 md:p-10 text-center flex flex-col">
              <p className="text-gray-400 mb-1 uppercase text-[9px] font-bold tracking-widest">Solicitud Relacionada</p>
              <h4 className="font-bold text-gray-900 text-lg mb-6 border-b border-gray-100 pb-4 break-words">{solicitudSeleccionada?.nombre}</h4>
              
              <div className="bg-gray-50 rounded-xl p-3 md:p-4 mb-6 border border-gray-100 max-h-60 overflow-y-auto space-y-2 text-left scrollbar-thin scrollbar-thumb-gray-200">
                {respuestasMock.map(resp => (
                    <div key={resp.id} className="bg-white p-3 md:p-4 rounded-lg border border-gray-100 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 transition-colors hover:border-blue-200">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-800 truncate">{resp.archivo}</p>
                            <p className="text-[10px] text-gray-400 uppercase italic">Por: {resp.responsable}</p>
                        </div>
                        <div className="flex gap-2 w-full xs:w-auto shrink-0">
                            <button className="flex-1 xs:flex-none text-[#1e4b8f] font-bold text-[9px] border-2 border-blue-600 px-3 py-1.5 rounded-lg transition-all hover:bg-blue-600 hover:text-white uppercase active:scale-95">Ver</button>
                        </div>
                    </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 border-t border-gray-100 pt-6">
                <button onClick={() => setModalAbierta(false)} className="w-full sm:w-auto order-2 sm:order-1 px-8 py-3 text-xs font-bold text-gray-400 transition-all hover:text-red-600 hover:bg-red-50 rounded-lg uppercase active:scale-95">Cerrar ventana</button>
                <button className="w-full sm:w-auto order-1 sm:order-2 bg-[#009642] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase shadow-md flex items-center justify-center gap-2 transition-all hover:bg-green-700 active:scale-95">Descargar todo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudesTransparenciaTI;