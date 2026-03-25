import React, { useState } from 'react';

const SolicitudesTransparenciaContralora = () => {
  const [modalAbierta, setModalAbierta] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  // Opciones del Mockup de asignación
  const opcionesAsignacion = [
    "Directora de auditoría",
    "Director de Control y Evaluación",
    "Director de Responsabilidades Administrativas y Situación Patrimonial",
    "Coordinación Administrativa"
  ];

  const [solicitudes, setSolicitudes] = useState([
    { id: 1, nombre: "Solicitud de Presupuesto 2025", archivo: "presupuesto_req.pdf", folio: "UV-TR-2024-001", fecha: "25/03/2026", hora: "12:00 PM", asignada: false, validada: false },
    { id: 2, nombre: "Auditoría Interna Q3", archivo: "auditoria_q3.docx", folio: "UV-TR-2024-002", fecha: "24/03/2026", hora: "09:15 AM", asignada: true, validada: false },
  ]);

  const marcarComoValidada = (id) => {
    setSolicitudes(solicitudes.map(s => s.id === id ? { ...s, validada: true } : s));
  };

  const confirmarAsignacion = (id) => {
    setSolicitudes(solicitudes.map(s => s.id === id ? { ...s, asignada: true } : s));
    setModalAsignar(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="max-w-6xl mx-auto p-4 md:p-10 w-full flex-1">
        <div className="mb-10 border-b border-gray-200 pb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight text-left italic">Módulo de Contraloría</h2>
          <p className="text-gray-500 text-sm uppercase font-bold tracking-widest mt-1">Gestión y Validación de Solicitudes</p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {solicitudes.map((sol) => (
            <div key={sol.id} className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-gray-100 p-5 md:p-8 flex flex-col gap-6 relative overflow-hidden transition-all">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 md:w-2 ${sol.validada ? 'bg-green-500' : 'bg-[#1e4b8f]'}`}></div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Folio: {sol.folio}</span>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">{sol.nombre}</h3>
              </div>

              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end border-t border-gray-50 pt-6 mt-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Archivo</span>
                    <span className="text-sm font-semibold text-[#1e4b8f]">{sol.archivo}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Fecha de Ingreso</span>
                    <span className="text-sm font-medium text-gray-600 italic">{sol.fecha} — {sol.hora}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {!sol.asignada ? (
                    <button 
                      onClick={() => { setSolicitudSeleccionada(sol); setModalAsignar(true); }}
                      className="w-full sm:w-auto bg-[#009642] text-white px-10 py-3 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-green-700 transition-all active:scale-95"
                    >
                      Asignar
                    </button>
                  ) : (
                    <div className="flex gap-4 w-full sm:w-auto">
                      <button 
                        onClick={() => { setSolicitudSeleccionada(sol); setModalAsignar(true); }}
                        className="px-4 py-3 text-[10px] font-bold border-2 border-yellow-500 text-yellow-500 rounded-xl hover:bg-yellow-500 hover:text-white transition-all uppercase active:scale-95"
                      >
                        Reasignar
                      </button>
                      <button 
                        onClick={() => { setSolicitudSeleccionada(sol); setModalAbierta(true); }}
                        className="flex-1 sm:flex-none bg-[#1e4b8f] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-[#153566] transition-all active:scale-95"
                      >
                        Ver Respuesta
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL ASIGNAR RESPONSABLES */}
      {modalAsignar && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-[#1e4b8f] p-5 text-white text-center font-bold uppercase text-xs tracking-widest">
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
                <button onClick={() => setModalAsignar(false)} className="px-6 py-2 text-xs font-bold text-gray-400 uppercase hover:text-red-500 transition-colors">Cancelar</button>
                <button onClick={() => confirmarAsignacion(solicitudSeleccionada.id)} className="bg-[#009642] text-white px-10 py-3 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-green-700 transition-all active:scale-95">
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
            <div className="bg-[#1e4b8f] p-5 text-white text-center font-bold uppercase text-xs tracking-widest">Respuesta de la solicitud</div>
            <div className="p-8 md:p-12 text-center">
              <h4 className="font-bold text-gray-900 text-lg mb-8 border-b pb-4">{solicitudSeleccionada?.nombre}</h4>
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest italic">Archivo de respuesta adjunto:</p>
                <div className="bg-white p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">oficio_respuesta_final.pdf</span>
                  <button className="text-[#1e4b8f] font-bold text-[10px] uppercase border-b border-blue-600">Descargar</button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <button onClick={() => setModalAbierta(false)} className="text-xs font-bold text-gray-400 uppercase hover:text-gray-600">Cerrar</button>
                {solicitudSeleccionada?.validada ? (
                  <span className="bg-green-50 text-[#009642] px-8 py-3 rounded-xl font-black text-xs uppercase border border-green-200">
                    ✓ Respuesta validada
                  </span>
                ) : (
                  <button 
                    onClick={() => marcarComoValidada(solicitudSeleccionada.id)}
                    className="bg-[#1e4b8f] text-white px-10 py-4 rounded-xl font-bold text-xs uppercase hover:bg-blue-900 shadow-lg transition-all active:scale-95"
                  >
                    Validar respuesta
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudesTransparenciaContralora;