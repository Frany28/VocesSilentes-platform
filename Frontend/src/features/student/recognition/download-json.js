/**
 * Descarga deliberadamente un artefacto local sin subirlo a ningún servicio y libera su URL temporal.
 * @param {object} data Muestras consentidas, modelo o evaluación identificados.
 * @param {string} name Nombre fijo de archivo, sin datos personales.
 * @returns {void} Solicita la descarga mediante el navegador.
 */
export function downloadJson(data, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
