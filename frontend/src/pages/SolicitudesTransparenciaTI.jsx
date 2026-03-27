import React, { useState, useRef, useEffect } from 'react';
import { mockSolicitudes } from '../data/mockSolicitudes';

const getSemaforoInfo = (fechaStr) => {
  const [dia, mes, anio] = fechaStr.split('/').map(Number);
  const fechaSubida = new Date(anio, mes - 1, dia);
  const fechaMaxima = new Date(fechaSubida);
  fechaMaxima.setDate(fechaMaxima.getDate() + 7);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaMaxima.setHours(0, 0, 0, 0);

  const diffDias = Math.round((fechaMaxima - hoy) / (1000 * 60 * 60 * 24));
  const pad = (n) => String(n).padStart(2, '0');
  const fechaMaximaStr = `${pad(fechaMaxima.getDate())}/${pad(fechaMaxima.getMonth() + 1)}/${fechaMaxima.getFullYear()}`;

  if (diffDias >= 4) {
    return { fechaMaxima: fechaMaximaStr, estado: 'Pendiente', color: 'green', texto: `Quedan ${diffDias} días` };
  } else if (diffDias >= 2) {
    return { fechaMaxima: fechaMaximaStr, estado: 'Por vencer', color: 'yellow', texto: `Quedan ${diffDias} días` };
  } else if (diffDias === 1) {
    return { fechaMaxima: fechaMaximaStr, estado: 'Por vencer', color: 'orange', texto: 'Queda 1 día' };
  } else {
    const diasRetraso = Math.abs(diffDias);
    return {
      fechaMaxima: fechaMaximaStr,
      estado: 'Vencida',
      color: 'red',
      texto: diasRetraso === 0 ? 'Venció hoy' : `${diasRetraso} día${diasRetraso !== 1 ? 's' : ''} de retraso`,
    };
  }
};

const colorClasses = {
  green:  { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300',  dot: 'bg-green-500'  },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  red:    { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300',    dot: 'bg-red-500'    },
  gray:   { bg: 'bg-gray-100',   text: 'text-gray-500',   border: 'border-gray-300',   dot: 'bg-gray-400'   },
};

const SolicitudesTransparenciaTI = () => {
  const fileInputRef = useRef(null);
  const capturaInputRef = useRef(null);

  const [modalAbierta, setModalAbierta] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [filtro, setFiltro] = useState('Todos');
  const [dropdownAbierto, setDropdownAbierto] = useState(null);

  useEffect(() => {
    if (dropdownAbierto === null) return;
    const handler = () => setDropdownAbierto(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [dropdownAbierto]);

  const [solicitudes, setSolicitudes] = useState(mockSolicitudes);

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

  const FILTROS = ['Todos', 'Pendiente', 'Por vencer', 'Vencida', 'Cancelada'];

  const solicitudesFiltradas = filtro === 'Todos'
    ? solicitudes
    : filtro === 'Cancelada'
      ? solicitudes.filter(sol => sol.cancelada)
      : solicitudes.filter(sol => !sol.cancelada && getSemaforoInfo(sol.fecha).estado === filtro);

  const conteo = FILTROS.reduce((acc, f) => {
    if (f === 'Todos') acc[f] = solicitudes.length;
    else if (f === 'Cancelada') acc[f] = solicitudes.filter(s => s.cancelada).length;
    else acc[f] = solicitudes.filter(s => !s.cancelada && getSemaforoInfo(s.fecha).estado === f).length;
    return acc;
  }, {});

  const filtroActivo = {
    Todos:        'bg-[#1e4b8f] text-white border-[#1e4b8f]',
    Pendiente:    'bg-green-600 text-white border-green-600',
    'Por vencer': 'bg-orange-500 text-white border-orange-500',
    Vencida:      'bg-red-600 text-white border-red-600',
    Cancelada:    'bg-gray-500 text-white border-gray-500',
  };
  const filtroInactivo = 'bg-white text-gray-500 border-gray-200 hover:border-gray-400';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" />
      <input type="file" ref={capturaInputRef} className="hidden" accept=".jpg,.jpeg,.png" />

      <main className="max-w-6xl mx-auto p-4 md:p-10 w-full flex-1">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-200 pb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Solicitudes de Transparencia</h2>
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full md:w-auto bg-[#009642] text-white px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:bg-green-700 hover:shadow-lg active:scale-95 font-bold text-sm uppercase shrink-0"
          >
            + Nueva Solicitud
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTROS.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${filtro === f ? filtroActivo[f] : filtroInactivo}`}
            >
              {f}
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${filtro === f ? 'bg-white/25' : 'bg-gray-100 text-gray-500'}`}>
                {conteo[f]}
              </span>
            </button>
          ))}
        </div>

        {/* Listado de Solicitudes */}
        <div className="space-y-6 md:space-y-8">
          {solicitudesFiltradas.length === 0 && (
            <div className="text-center py-16 text-gray-400 font-semibold text-sm">
              No hay solicitudes con estado "{filtro}".
            </div>
          )}
          {solicitudesFiltradas.map((sol) => (
            <div key={sol.id} className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-gray-100 p-5 md:p-8 flex flex-col gap-6 relative transition-all hover:shadow-lg">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 md:w-2 ${sol.cancelada ? 'bg-gray-300' : sol.validada ? 'bg-green-500' : 'bg-[#1e4b8f]'}`}></div>
              <button className="absolute top-5 right-5 md:top-8 md:right-8 bg-[#2A6BCA] text-white px-4 py-2 text-xs font-bold rounded-lg uppercase transition-all hover:bg-blue-500 shadow-sm hover:shadow active:scale-95 z-10">
                Ver
              </button>

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
                  {(() => {
                    if (sol.cancelada) {
                      const c = colorClasses.gray;
                      return (
                        <div className="flex flex-col justify-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Estado</span>
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.bg} ${c.text} ${c.border} w-fit`}>
                            <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`}></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Cancelada</span>
                          </div>
                        </div>
                      );
                    }
                    const sem = getSemaforoInfo(sol.fecha);
                    const c = colorClasses[sem.color];
                    return (
                      <>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Fecha Máx. Respuesta</span>
                          <span className="text-sm font-medium text-gray-600 italic whitespace-nowrap">{sem.fechaMaxima}</span>
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Estado</span>
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.bg} ${c.text} ${c.border} w-fit`}>
                            <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`}></span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{sem.estado}</span>
                            <span className="text-[10px] font-medium">· {sem.texto}</span>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Validación</span>
                          {sol.validada ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-green-100 text-green-700 border-green-300 w-fit">
                              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                              <span className="text-[10px] font-bold uppercase tracking-wider">Validada</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-gray-100 text-gray-500 border-gray-300 w-fit">
                              <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                              <span className="text-[10px] font-bold uppercase tracking-wider">Sin validar</span>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Acciones */}
                {!sol.cancelada && <div className="flex items-center gap-2 flex-wrap">


                  {/* Dropdown Operaciones */}
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDropdownAbierto(dropdownAbierto === sol.id ? null : sol.id); }}
                      className="px-3 py-1.5 text-[10px] font-bold border-2 border-gray-400 text-gray-600 rounded-lg uppercase transition-all duration-200 hover:bg-gray-100 active:scale-95 flex items-center gap-1"
                    >
                      Operaciones
                      <span className="text-[8px]">{dropdownAbierto === sol.id ? '▲' : '▼'}</span>
                    </button>
                    {dropdownAbierto === sol.id && (
                      <div className="absolute left-0 bottom-full mb-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[200px]">
                        <button onClick={() => { iniciarEdicion(sol); setDropdownAbierto(null); }} className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase hover:bg-gray-50 transition-colors">Cambiar nombre</button>
                        <button onClick={() => { fileInputRef.current.click(); setDropdownAbierto(null); }} className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase hover:bg-gray-50 transition-colors">Cambiar archivo</button>
                        <button onClick={() => { capturaInputRef.current.click(); setDropdownAbierto(null); }} className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase hover:bg-gray-50 transition-colors">Subir captura de entrega</button>
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={() => setDropdownAbierto(null)} className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-red-600 uppercase hover:bg-red-50 transition-colors">Eliminar</button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { setSolicitudSeleccionada(sol); setModalAbierta(true); }}
                    className="bg-[#1e4b8f] text-white px-5 py-2 rounded-xl font-bold text-xs uppercase shadow-md whitespace-nowrap transition-all duration-200 hover:bg-[#153566] hover:shadow-lg active:scale-95"
                  >
                    Ver Respuesta
                  </button>
                </div>}
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
                    <div key={resp.id} className="relative bg-white p-3 md:p-4 rounded-lg border border-gray-100 transition-colors hover:border-blue-200">
                        <div className="min-w-0 pr-10">
                            <p className="text-sm font-bold text-gray-800 truncate">{resp.archivo}</p>
                            <p className="text-[10px] text-gray-400 uppercase italic">Por: {resp.responsable}</p>
                        </div>
                        <button className="absolute top-2 right-2 text-[#1e4b8f] font-bold text-[10px] border border-blue-400 px-2 py-1 rounded transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 uppercase active:scale-95">Ver</button>
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