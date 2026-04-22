const BASE_URL = 'http://localhost:3001/api/notificaciones';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const getNotificaciones = async () => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("Error in getNotificaciones:", error);
    return { ok: false };
  }
};

export const marcarComoLeida = async (idNotificacion) => {
  try {
    const response = await fetch(`${BASE_URL}/${idNotificacion}/leer`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return await response.json();
  } catch (error) {
    console.error("Error in marcarComoLeida:", error);
    return { ok: false };
  }
};
