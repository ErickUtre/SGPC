import React from 'react';
import { getSemaforoInfo, colorClasses } from '../../utils/semaforo';

export const SolicitudCard = ({ 
  solicitud, 
  titleComponent,
  onVerClick,
  oficioButton,
  isContraloraView,
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


      <div className="flex flex-col xl:flex-row justify-between xl:items-start gap-6 pt-10 md:pt-0 pr-16 md:pr-24">
        <div className="flex flex-col gap-1 xl:w-5/12">
          <span className="text-[10px] font-bold text-gray-400 tracking-widest">Folio: {solicitud.folio}</span>
          {titleComponent ? titleComponent : (
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight break-words pr-2">{solicitud.nombre}</h3>
          )}
        </div>

        <div className="flex flex-wrap gap-4 xl:justify-end xl:w-7/12 mt-2 xl:mt-0 xl:pt-1">
           <div className="flex flex-col bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg">
             <span className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider">Fecha y hora de subida</span>
             <span className="text-xs font-medium text-gray-700 italic whitespace-nowrap">{solicitud.fecha} — {solicitud.hora}</span>
           </div>
           
           {!solicitud.cancelada && (
             <div className="flex flex-col bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
               <span className="text-[10px] font-bold text-blue-400 mb-1 tracking-wider">Máx. Respuesta</span>
               <span className="text-xs font-medium text-[#1e4b8f] italic whitespace-nowrap">{sem.fechaMaxima} — {solicitud.hora}</span>
             </div>
           )}

           {isContraloraView && solicitud.fechaValidacion && (
             <div className="flex flex-col bg-green-50 border border-green-100 px-3 py-2 rounded-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-8 h-8 bg-green-500/10 rounded-bl-full"></div>
               <span className="text-[10px] font-bold text-green-500 mb-1 tracking-wider">Fecha Validación</span>
               <span className="text-xs font-medium text-green-700 italic whitespace-nowrap">{solicitud.fechaValidacion}</span>
             </div>
           )}

           {isContraloraView && solicitud.fechaAsignacionProrroga && (
             <div className="flex flex-col bg-orange-50 border border-orange-100 px-3 py-2 rounded-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-8 h-8 bg-orange-500/10 rounded-bl-full"></div>
               <span className="text-[10px] font-bold text-orange-400 mb-1 tracking-wider">Asignación Prórroga</span>
               <span className="text-xs font-medium text-orange-600 italic whitespace-nowrap">{solicitud.fechaAsignacionProrroga}</span>
             </div>
           )}
        </div>
      </div>


      <div className="flex flex-col xl:flex-row xl:items-end justify-between border-t border-gray-50 pt-6 gap-6">
        

        <div className="flex flex-col gap-5 flex-1 min-w-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 mb-1 tracking-wider">Documento Principal</span>
            <span className="text-sm font-semibold text-[#1e4b8f] truncate block" title={solicitud.archivo}>{solicitud.archivo}</span>
            {oficioButton && (
              <div className="mt-3">
                {oficioButton}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-6">

             <div className="flex flex-col">
               <span className="text-[9px] font-bold text-gray-400 mb-1 tracking-widest uppercase">Estado</span>
               {solicitud.cancelada ? (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.bg} ${c.text} ${c.border} w-fit`}>
                    <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`}></span>
                    <span className="text-[10px] font-bold tracking-wider">Cancelada</span>
                  </div>
               ) : (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.bg} ${c.text} ${c.border} w-fit`}>
                    <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`}></span>
                    <span className="text-[10px] font-bold tracking-wider">{sem.estado}</span>
                    <span className="text-[10px] font-medium">· {sem.texto}</span>
                  </div>
               )}
             </div>


             {!solicitud.cancelada && (
               <div className="flex flex-col">
                 <span className="text-[9px] font-bold text-gray-400 mb-1 tracking-widest uppercase">Estatus de Validación</span>
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
             )}
          </div>
        </div>


        {children && (
          <div className="flex items-center flex-wrap justify-end gap-2 w-full xl:w-auto shrink-0 mt-2 xl:mt-0">
            {children}
          </div>
        )}
      </div>

    </div>
  );
};
