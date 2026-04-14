import React from 'react';
import { getSemaforoInfo, colorClasses } from '../../utils/semaforo';

export const SolicitudCard = ({ 
  solicitud, 
  titleComponent,
  onVerClick,
  oficioButton,
  children 
}) => {
  const sem = !solicitud.cancelada ? getSemaforoInfo(solicitud.fecha, solicitud.diasProrroga, solicitud.diasMaximos) : null;
  const c = solicitud.cancelada ? colorClasses.gray : colorClasses[sem.color];

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-md border border-gray-100 p-5 md:p-8 flex flex-col gap-6 relative overflow-hidden transition-all hover:shadow-lg">
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 md:w-2 ${solicitud.cancelada ? 'bg-gray-300' : solicitud.validada ? 'bg-green-500' : 'bg-[#1e4b8f]'}`}></div>
      
      {onVerClick && (
        <button 
          onClick={onVerClick}
          className="absolute top-5 right-5 md:top-8 md:right-8 bg-[#2A6BCA] text-white px-4 py-2 text-xs font-bold rounded-lg transition-all hover:bg-blue-500 shadow-sm hover:shadow active:scale-95 z-10"
        >
          Ver
        </button>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-gray-400 tracking-widest">Folio: {solicitud.folio}</span>
        {titleComponent ? titleComponent : (
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight break-words">{solicitud.nombre}</h3>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end border-t border-gray-50 pt-6 mt-2 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider">Archivo</span>
            <span className="text-sm font-semibold text-[#1e4b8f] truncate max-w-[200px]">{solicitud.archivo}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider">Fecha y hora de subida</span>
            <span className="text-sm font-medium text-gray-600 italic whitespace-nowrap">{solicitud.fecha} — {solicitud.hora}</span>
          </div>
          
          {solicitud.cancelada ? (
            <>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider">Estado</span>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.bg} ${c.text} ${c.border} w-fit`}>
                  <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`}></span>
                  <span className="text-[10px] font-bold tracking-wider">Cancelada</span>
                </div>
              </div>
              {oficioButton && (
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-transparent mb-1 tracking-wider select-none">Ver Oficio</span>
                  {oficioButton}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider">Fecha Máx. Respuesta</span>
                <span className="text-sm font-medium text-gray-600 italic whitespace-nowrap">{sem.fechaMaxima}</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider">Estado</span>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.bg} ${c.text} ${c.border} w-fit`}>
                  <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`}></span>
                  <span className="text-[10px] font-bold tracking-wider">{sem.estado}</span>
                  <span className="text-[10px] font-medium">· {sem.texto}</span>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider">Validación</span>
                {solicitud.validada ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-green-100 text-green-700 border-green-300 w-fit">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                    <span className="text-[10px] font-bold tracking-wider">Validada</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-gray-100 text-gray-500 border-gray-300 w-fit">
                    <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></span>
                    <span className="text-[10px] font-bold tracking-wider">Sin validar</span>
                  </div>
                )}
              </div>
              {oficioButton && (
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-transparent mb-1 tracking-wider select-none">Ver Oficio</span>
                  {oficioButton}
                </div>
              )}
            </>
          )}
        </div>

        {children && (
          <div className="flex items-center gap-2 flex-wrap">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
