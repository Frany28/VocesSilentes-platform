/**
 * Comprueba un intervalo marcado, sin recortar ni extender automáticamente una ejecución.
 * @param {number} start Inicio en segundos.
 * @param {number} end Fin en segundos.
 * @param {number} duration Duración real del archivo en segundos.
 * @returns {void} Lanza ante límites incompatibles con recording.js.
 */
export function validateVideoInterval(start, end, duration) {
  if (![start, end, duration].every(Number.isFinite) || start < 0 || end > duration || end <= start)
    throw new Error('Marca un inicio y fin válidos dentro del video.');
  if (end - start < 1.5 || end - start > 6)
    throw new Error(
      'Cada ejecución debe durar entre 1,5 y 6 segundos; no repitas fotogramas para alargarla.',
    );
}

/**
 * Conserva procedencia y declaración de autorización, sin certificar derechos ni revisión lingüística.
 * @param {object} source Procedencia de una muestra importada.
 * @param {object[]} [frames] Observaciones reales validadas; se omiten para comprobar solo metadatos antes de extraer.
 * @returns {object} Metadatos permitidos para exportar, sin rutas privadas ni bytes de video.
 * @throws {Error} Autorización, huella, ejecución o tiempos incompletos.
 */
export function validateVideoSource(source, frames) {
  const text = (value) =>
    typeof value === 'string' && value.trim().length > 0 && value.length <= 240;
  if (
    !source ||
    source.type !== 'LOCAL_VIDEO' ||
    source.authorized !== true ||
    typeof source.sha256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(source.sha256) ||
    typeof source.executionId !== 'string' ||
    !/^[a-zA-Z0-9_-]{1,64}$/.test(source.executionId) ||
    !text(source.origin) ||
    !text(source.authorization) ||
    !Number.isInteger(source.startMs) ||
    !Number.isInteger(source.endMs)
  )
    throw new Error('Completa procedencia, autorización y código de ejecución del video.');
  validateVideoInterval(source.startMs / 1000, source.endMs / 1000, source.endMs / 1000);
  if (frames && (frames[0].t < 0 || frames.at(-1).t > source.endMs - source.startMs + 1))
    throw new Error('Los puntos quedan fuera del intervalo declarado.');
  return {
    type: 'LOCAL_VIDEO',
    sha256: source.sha256,
    executionId: source.executionId,
    origin: source.origin.trim(),
    authorization: source.authorization.trim(),
    authorized: true,
    startMs: source.startMs,
    endMs: source.endMs,
  };
}
