import { API_BASE } from './solicitudesTransparencia';

export const abrirArchivoPNTEnPestana = async (solicitud) => {
  if (solicitud.origen !== 'real') {
    window.alert('Los mockups no tienen documento real para visualizar.');
    return;
  }

  try {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE}/solicitudes/${solicitud.idOriginal}/archivo-pnt`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      window.alert(data.mensaje || 'No se pudo abrir el documento de la solicitud.');
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch {
    window.alert('No se pudo conectar con el servidor.');
  }
};
