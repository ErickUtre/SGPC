import { useState, useMemo } from 'react';
import { getSemaforoInfo } from '../utils/semaforo';

export const FILTROS_TRANSPARENCIA = ['Todos', 'Pendiente', 'Por vencer', 'Vencida', 'Resuelto', 'Cancelada'];

export function useTransparencia(initialSolicitudes = []) {
  const [filtro, setFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes);

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter(sol => {
      let coincideFiltro = false;
      
      if (filtro === 'Todos') {
        coincideFiltro = true;
      } else if (filtro === 'Cancelada') {
        coincideFiltro = !!sol.cancelada;
      } else if (filtro === 'Resuelto') {
        coincideFiltro = !!sol.resuelto && !sol.cancelada;
      } else {
        // Filtros de semáforo: solo si no está resuelta ni cancelada
        coincideFiltro = !sol.resuelto && !sol.cancelada && getSemaforoInfo(sol.fecha, sol.diasProrroga).estado === filtro;
      }
      
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
      else if (f === 'Resuelto') acc[f] = solicitudes.filter(s => s.resuelto && !s.cancelada).length;
      else acc[f] = solicitudes.filter(s => !s.resuelto && !s.cancelada && getSemaforoInfo(s.fecha, s.diasProrroga).estado === f).length;
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
