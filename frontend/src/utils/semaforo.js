export const getSemaforoInfo = (fechaStr, diasProrroga = 0, diasMaximos = 7) => {
  const [dia, mes, anio] = fechaStr.split('/').map(Number);
  const fechaSubida = new Date(anio, mes - 1, dia);
  const fechaMaxima = new Date(fechaSubida);
  fechaMaxima.setDate(fechaMaxima.getDate() + Number(diasMaximos) + Number(diasProrroga));

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fechaMaxima.setHours(0, 0, 0, 0);

  // Diferencia exacta en días (calendario)
  const diffDias = Math.round((fechaMaxima.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const pad = (n) => String(n).padStart(2, '0');
  const fechaMaximaStr = `${pad(fechaMaxima.getDate())}/${pad(fechaMaxima.getMonth() + 1)}/${fechaMaxima.getFullYear()}`;

  if (diffDias >= 4) {
    return { fechaMaxima: fechaMaximaStr, estado: 'Pendiente', color: 'green', texto: `Quedan ${diffDias} días` };
  } else if (diffDias >= 2) {
    return { fechaMaxima: fechaMaximaStr, estado: 'Por vencer', color: 'yellow', texto: `Quedan ${diffDias} días` };
  } else if (diffDias === 1) {
    return { fechaMaxima: fechaMaximaStr, estado: 'Por vencer', color: 'orange', texto: 'Queda 1 día' };
  } else {
    const diasRetraso = Math.abs(diffDias);
    return {
      fechaMaxima: fechaMaximaStr,
      estado: 'Vencida',
      color: 'red',
      texto: diffDias === 0 ? 'Vence hoy' : `${diasRetraso} día${diasRetraso !== 1 ? 's' : ''} de retraso`,
    };
  }
};

export const colorClasses = {
  green:  { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-300',  dot: 'bg-green-500'  },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  red:    { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-300',    dot: 'bg-red-500'    },
  gray:   { bg: 'bg-gray-100',   text: 'text-gray-500',   border: 'border-gray-300',   dot: 'bg-gray-400'   },
};
