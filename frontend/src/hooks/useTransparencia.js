import { useState, useMemo } from 'react';
import { getSemaforoInfo } from '../utils/semaforo';

export const FILTROS_TRANSPARENCIA = ['Todos', 'Pendiente', 'Por vencer', 'Vencida', 'Resuelto', 'Cancelada'];

export function useTransparencia(initialSolicitudes = []) {
  const currentYear = new Date().getFullYear();
  
  // Generar lista de años desde 2026 hasta el año actual
  const añosDisponibles = useMemo(() => {
    const startYear = 2026;
    const years = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const [filtro, setFiltro] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [anio, setAnio] = useState(currentYear);
  const [solicitudes, setSolicitudes] = useState(initialSolicitudes);

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter(sol => {
      // 1. Filtrar por año primero
      const añoSolicitud = sol.fecha ? parseInt(sol.fecha.split('/')[2]) : null;
      if (añoSolicitud !== anio) return false;

      // 2. Filtrar por tipo (Pendiente, Resuelto, etc.)
      let coincideFiltro = false;
      if (filtro === 'Todos') {
        coincideFiltro = true;
      } else if (filtro === 'Cancelada') {
        coincideFiltro = !!sol.cancelada;
      } else if (filtro === 'Resuelto') {
        coincideFiltro = !!sol.resuelto && !sol.cancelada;
      } else {
        coincideFiltro = !sol.resuelto && !sol.cancelada && getSemaforoInfo(sol.fecha, sol.diasProrroga).estado === filtro;
      }
      
      // 3. Filtrar por búsqueda
      const termino = busqueda.toLowerCase();
      const coincideBusqueda = sol.nombre.toLowerCase().includes(termino) || 
                               sol.folio.toLowerCase().includes(termino);
      
      return coincideFiltro && coincideBusqueda;
    });
  }, [solicitudes, filtro, busqueda, anio]);

  const conteo = useMemo(() => {
    // Los conteos solo deben considerar las solicitudes del año seleccionado
    const solicitudesDelAño = solicitudes.filter(sol => {
      const añoSolicitud = sol.fecha ? parseInt(sol.fecha.split('/')[2]) : null;
      return añoSolicitud === anio;
    });

    return FILTROS_TRANSPARENCIA.reduce((acc, f) => {
      if (f === 'Todos') acc[f] = solicitudesDelAño.length;
      else if (f === 'Cancelada') acc[f] = solicitudesDelAño.filter(s => s.cancelada).length;
      else if (f === 'Resuelto') acc[f] = solicitudesDelAño.filter(s => s.resuelto && !s.cancelada).length;
      else acc[f] = solicitudesDelAño.filter(s => !s.resuelto && !s.cancelada && getSemaforoInfo(s.fecha, s.diasProrroga).estado === f).length;
      return acc;
    }, {});
  }, [solicitudes, anio]);

  return {
    filtro, setFiltro,
    busqueda, setBusqueda,
    anio, setAnio,
    añosDisponibles,
    solicitudes, setSolicitudes,
    solicitudesFiltradas,
    conteo
  };
}
