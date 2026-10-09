/**
 * Interpreta Retry-After sin exponer otras cabeceras ni inventar una ventana de bloqueo.
 * @param {string | null} value Segundos enteros o fecha HTTP.
 * @param {number} [now] Tiempo de referencia en milisegundos.
 * @returns {number | undefined} Espera no negativa; undefined si falta o es inválida.
 */
export function retryAfterSeconds(value, now = Date.now()) {
  if (value === null || value.trim() === '') return undefined;
  if (/^\d+$/.test(value)) {
    const seconds = Number(value);
    return Number.isSafeInteger(seconds) ? seconds : undefined;
  }
  if (!/^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(value)) return undefined;
  const date = Date.parse(value);
  return Number.isFinite(date) ? Math.max(0, Math.ceil((date - now) / 1000)) : undefined;
}
