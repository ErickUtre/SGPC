export const API_BASE = 'http://localhost:3001/api';

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

