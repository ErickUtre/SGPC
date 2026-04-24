import { API_URL } from '../config';

export const API_BASE = API_URL;

export const normalizarSolicitudReal = (solicitud) => ({
  ...solicitud,
  id: `real-${solicitud.id}`,
  idOriginal: solicitud.id,
  origen: 'real',
  diasProrroga: solicitud.diasProrroga || 0,
  solicitudesProrrogaCount: solicitud.solicitudesProrrogaCount || 0,
  yaSolicitoProrroga: !!solicitud.yaSolicitoProrroga,
  folio: solicitud.folio || '',
  diasMaximos: solicitud.diasMaximos || 7,
  cancelada: !!solicitud.cancelada,
});

