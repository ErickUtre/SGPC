import { useState, useMemo } from 'react';
import { getSemaforoInfo } from '../utils/semaforo';

export const FILTROS_TRANSPARENCIA = ['Todos', 'Pendiente', 'Por vencer', 'Vencida', 'Cancelada'];

export function useTransparencia(initialSolicitudes = []) {
  const [filtro, setFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes);

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter(sol => {
      const coincideFiltro = filtro === 'Todos'
        ? true
        : filtro === 'Cancelada'
          ? sol.cancelada
          : (!sol.cancelada && getSemaforoInfo(sol.fecha).estado === filtro);
      
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = sol.nombre.toLowerCase().includes(termino) || 
                               sol.folio.toLowerCase().includes(termino);
      
      return coincideFiltro && coincideBusqueda;
    });
  }, [solicitudes, filtro, busqueda]);

  const conteo = useMemo(() => {
    return FILTROS_TRANSPARENCIA.reduce((acc, f) => {
      if (f === 'Todos') acc[f] = solicitudes.length;
      else if (f === 'Cancelada') acc[f] = solicitudes.filter(s => s.cancelada).length;
      else acc[f] = solicitudes.filter(s => !s.cancelada && getSemaforoInfo(s.fecha).estado === f).length;
      return acc;
    }, {});
  }, [solicitudes]);

  return {
    filtro, setFiltro,
    busqueda, setBusqueda,
    solicitudes, setSolicitudes,
    solicitudesFiltradas,
    conteo
  };
}
