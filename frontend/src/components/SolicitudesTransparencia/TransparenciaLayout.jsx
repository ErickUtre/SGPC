import React from 'react';
import { FiltrosTransparencia } from './FiltrosTransparencia';

export const TransparenciaLayout = ({ 
  title = "Solicitudes de Transparencia",
  headerActions,
  filtro, setFiltro,
  busqueda, setBusqueda,
  conteo,
  children 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="max-w-6xl mx-auto p-4 md:p-10 w-full flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-200 pb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight text-left">{title}</h2>
          {headerActions && <div className="w-full md:w-auto shrink-0">{headerActions}</div>}
        </div>

        <FiltrosTransparencia 
          filtro={filtro} setFiltro={setFiltro}
          busqueda={busqueda} setBusqueda={setBusqueda}
          conteo={conteo}
        />

        <div className="space-y-6 md:space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
};
