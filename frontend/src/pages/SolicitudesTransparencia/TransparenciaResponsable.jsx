import React, { useRef, useState } from 'react';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import { useTransparencia } from '../../hooks/useTransparencia';
import { TransparenciaLayout } from '../../components/SolicitudesTransparencia/TransparenciaLayout';
import { SolicitudCard } from '../../components/SolicitudesTransparencia/SolicitudCard';

const SolicitudesTransparenciaResponsable = () => {
  const respuestaInputRef = useRef(null);
  const oficioInputRef = useRef(null);
  const state = useTransparencia(mockSolicitudes);
  const [solicitudProrroga, setSolicitudProrroga] = useState(null);

  return (
    <>
      <input type="file" ref={respuestaInputRef} className="hidden" accept=".pdf,.doc,.docx" />
      <input type="file" ref={oficioInputRef} className="hidden" accept=".pdf,.doc,.docx" />

      <TransparenciaLayout {...state}>
        {state.solicitudesFiltradas.length === 0 && (
          <div className="text-center py-16 text-gray-400 font-semibold text-sm">
            No se encontraron solicitudes.
          </div>
        )}
        {state.solicitudesFiltradas.map((sol) => (
          <SolicitudCard
            key={sol.id}
            solicitud={sol}
            onVerClick={() => { }}
            oficioButton={
              <button
                onClick={() => oficioInputRef.current.click()}
                className="px-4 py-2 text-xs font-bold bg-[#1e4b8f] text-white rounded-lg transition-all hover:bg-blue-800 active:scale-95 whitespace-nowrap w-fit shadow-md"
              >
                Ver Oficio
              </button>
            }
          >
            <button
              onClick={() => respuestaInputRef.current.click()}
              className="px-3 py-1.5 text-[10px] font-bold border-2 border-green-600 text-green-600 rounded-lg transition-all hover:bg-green-600 hover:text-white active:scale-95 whitespace-nowrap"
            >
              Subir respuesta
            </button>

            <button
              onClick={() => setSolicitudProrroga(sol)}
              className="px-3 py-1.5 text-[10px] font-bold border-2 border-gray-500 text-gray-500 rounded-lg transition-all hover:bg-gray-500 hover:text-white active:scale-95 whitespace-nowrap"
            >
              Solicitar prorroga
            </button>
          </SolicitudCard>
        ))}
      </TransparenciaLayout>

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
                onClick={() => setSolicitudProrroga(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#1e4b8f] hover:bg-blue-800 transition-all shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
