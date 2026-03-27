import React, { useState, useRef } from 'react';
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

const SolicitudesTransparenciaResponsable = () => {
  const respuestaInputRef = useRef(null);
  const oficioInputRef = useRef(null);

  const [filtro, setFiltro] = useState('Todos');
  const [solicitudes] = useState(mockSolicitudes);
  const [solicitudProrroga, setSolicitudProrroga] = useState(null);

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
      <input type="file" ref={respuestaInputRef} className="hidden" accept=".pdf,.doc,.docx" />
      <input type="file" ref={oficioInputRef} className="hidden" accept=".pdf,.doc,.docx" />

      <main className="max-w-6xl mx-auto p-4 md:p-10 w-full flex-1">
        <div className="mb-6 border-b border-gray-200 pb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Solicitudes de Transparencia</h2>
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

        {/* Listado */}
        <div className="space-y-6 md:space-y-8">
          {solicitudesFiltradas.length === 0 && (
            <div className="text-center py-16 text-gray-400 font-semibold text-sm">
              No hay solicitudes con estado "{filtro}".
            </div>
          )}
          {solicitudesFiltradas.map((sol) => (
            <div key={sol.id} className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-gray-100 p-5 md:p-8 flex flex-col gap-6 relative transition-all hover:shadow-lg">
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 md:w-2 ${sol.cancelada ? 'bg-gray-300' : sol.validada ? 'bg-green-500' : 'bg-[#1e4b8f]'}`}></div>
              
              <button className="absolute top-5 right-5 md:top-8 md:right-8 bg-[#2A6BCA] text-white px-4 py-2 text-xs font-bold rounded-lg uppercase transition-all hover:bg-blue-500 shadow-sm hover:shadow active:scale-95">
                Ver
              </button>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Folio: {sol.folio}</span>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight break-words">{sol.nombre}</h3>
              </div>

              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end border-t border-gray-50 pt-6 mt-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Archivo</span>
                    <span className="text-sm font-semibold text-[#1e4b8f] truncate max-w-[200px]">{sol.archivo}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Fecha y Hora</span>
                    <span className="text-sm font-medium text-gray-600 italic whitespace-nowrap">{sol.fecha} — {sol.hora}</span>
                  </div>
                  {(() => {
                    if (sol.cancelada) {
                      const c = colorClasses.gray;
                      return (
                        <>
                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-wider">Estado</span>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.bg} ${c.text} ${c.border} w-fit`}>
                              <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`}></span>
                              <span className="text-[10px] font-bold uppercase tracking-wider">Cancelada</span>
                            </div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-transparent uppercase mb-1 tracking-wider select-none">Ver Oficio</span>
                            <button
                              onClick={() => oficioInputRef.current.click()}
                              className="px-4 py-2 text-xs font-bold bg-[#1e4b8f] text-white rounded-lg uppercase transition-all hover:bg-blue-800 active:scale-95 whitespace-nowrap w-fit shadow-md"
                            >
                              Ver Oficio
                            </button>
                          </div>
                        </>
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
                        <div className="flex flex-col justify-center">
                          <span className="text-[10px] font-bold text-transparent uppercase mb-1 tracking-wider select-none">Ver Oficio</span>
                          <button
                            onClick={() => oficioInputRef.current.click()}
                            className="px-4 py-2 text-xs font-bold bg-[#1e4b8f] text-white rounded-lg uppercase transition-all hover:bg-blue-800 active:scale-95 whitespace-nowrap w-fit shadow-md"
                          >
                            Ver Oficio
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Acciones */}
                {!sol.cancelada && (
                  <div className="flex items-center gap-2 flex-wrap">

                    <button
                      onClick={() => respuestaInputRef.current.click()}
                      className="px-3 py-1.5 text-[10px] font-bold border-2 border-green-600 text-green-600 rounded-lg uppercase transition-all hover:bg-green-600 hover:text-white active:scale-95 whitespace-nowrap"
                    >
                      Subir respuesta
                    </button>

                    <button
                      onClick={() => setSolicitudProrroga(sol)}
                      className="px-3 py-1.5 text-[10px] font-bold border-2 border-gray-500 text-gray-500 rounded-lg uppercase transition-all hover:bg-gray-500 hover:text-white active:scale-95 whitespace-nowrap"
                    >
                      Solicitar prorroga
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal de Prórroga */}
      {solicitudProrroga && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-md w-full p-8 flex flex-col gap-6 relative transform transition-all">
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Solicitar prórroga</h3>
            <p className="text-gray-600 font-medium leading-relaxed text-lg">
              ¿Seguro que quieres solicitar una prorroga de la solicitud <span className="font-bold text-[#1e4b8f]">{solicitudProrroga.nombre}</span>?
            </p>
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setSolicitudProrroga(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setSolicitudProrroga(null);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#1e4b8f] hover:bg-blue-800 transition-all shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitudesTransparenciaResponsable;
