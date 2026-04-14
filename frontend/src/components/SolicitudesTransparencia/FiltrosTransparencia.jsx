import React from 'react';
import { FILTROS_TRANSPARENCIA } from '../../hooks/useTransparencia';

const filtroActivo = {
  Todos:        'bg-[#1e4b8f] text-white border-[#1e4b8f]',
  Pendiente:    'bg-green-600 text-white border-green-600',
  'Por vencer': 'bg-orange-500 text-white border-orange-500',
  Vencida:      'bg-red-600 text-white border-red-600',
  Resuelto:     'bg-blue-600 text-white border-blue-600',
  Cancelada:    'bg-gray-500 text-white border-gray-500',
};
const filtroInactivo = 'bg-white text-gray-500 border-gray-200 hover:border-gray-400';

export const FiltrosTransparencia = ({ filtro, setFiltro, busqueda, setBusqueda, conteo }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div className="flex flex-wrap gap-2">
        {FILTROS_TRANSPARENCIA.map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-xs tracking-wider transition-all active:scale-95 ${filtro === f ? filtroActivo[f] : filtroInactivo}`}
          >
            {f}
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${filtro === f ? 'bg-white/25' : 'bg-gray-100 text-gray-500'}`}>
              {conteo[f]}
            </span>
          </button>
        ))}
      </div>

      <div className="relative w-full md:w-auto mt-2 md:mt-0">
        <input
          type="text"
          placeholder="Buscar por nombre o folio..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full md:w-72 pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1e4b8f] focus:border-transparent transition-all"
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
};
