const number = new Intl.NumberFormat('es-VE', { maximumFractionDigits: 2 });

/**
 * Distingue cero real de indicadores ausentes; nunca sustituye errores por cifras.
 * @param {number | null | undefined} value Indicador recibido del backend.
 * @param {string} [unit] Sufijo opcional como porcentaje.
 * @returns {string} Valor localizado o ausencia explícita.
 */
export function metricValue(value, unit = '') {
  return Number.isFinite(value) ? `${number.format(value)}${unit}` : 'No disponible';
}

/**
 * Formatea un día del calendario del servidor, sin cambiarlo a la zona del equipo.
 * @param {string} day Fecha ISO de calendario.
 * @returns {string} Día y mes cortos para ejes y tablas.
 */
export function metricDay(day) {
  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${day}T12:00:00Z`));
}
