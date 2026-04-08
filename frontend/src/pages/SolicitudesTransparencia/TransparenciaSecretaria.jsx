import React from 'react';
import { mockSolicitudes } from '../../data/mockSolicitudes';
import { useTransparencia } from '../../hooks/useTransparencia';
import { TransparenciaLayout } from '../../components/SolicitudesTransparencia/TransparenciaLayout';
import { SolicitudCard } from '../../components/SolicitudesTransparencia/SolicitudCard';

const SolicitudesTransparenciaSecretaria = () => {
  const state = useTransparencia(mockSolicitudes);

  return (
    <TransparenciaLayout {...state}>
      {state.solicitudesFiltradas.length === 0 && (
        <div className="text-center py-16 text-gray-400 font-semibold text-sm">
          No se encontraron solicitudes.
        </div>
      )}

      {state.solicitudesFiltradas.map((sol) => (
        <SolicitudCard key={sol.id} solicitud={sol} onVerClick={() => { }}>
          {sol.paqueteGenerado ? (
            <button className="px-3 py-1.5 text-[10px] font-bold border-2 border-green-600 text-green-600 rounded-lg transition-all hover:bg-green-600 hover:text-white active:scale-95 whitespace-nowrap">
              Generar paquete
            </button>
          ) : (
            <button className="px-3 py-1.5 text-[10px] font-bold border-2 border-gray-400 text-gray-500 rounded-lg transition-all hover:bg-gray-400 hover:text-white active:scale-95 whitespace-nowrap">
              Generar paquete
            </button>
          )}
        </SolicitudCard>
      ))}
    </TransparenciaLayout>
  );
};

export default SolicitudesTransparenciaSecretaria;
