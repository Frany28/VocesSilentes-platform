/**
 * Identifica la versión del recorrido con una huella de su contenido público; no es una firma de seguridad.
 * @param {object[]} steps Pasos y texto actuales, sin calificaciones.
 * @returns {string} Huella para descartar puntos de una edición anterior.
 */
export function journeySignature(steps) {
  let hash = 2166136261;
  for (const character of JSON.stringify(steps))
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `v1-${hash >>> 0}`;
}

/**
 * Recupera posición y lectura local, sin confiar en aciertos almacenados en el navegador.
 * @param {string} key Clave separada por usuario, módulo y lección.
 * @param {string} signature Edición vigente.
 * @param {object[]} steps Pasos actuales.
 * @returns {object} Punto validado o inicio si está ausente, corrupto o no se permite almacenamiento.
 */
export function readCheckpoint(key, signature, steps) {
  const initial = { signature, position: steps[0].id, completed: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved?.signature !== signature || !Array.isArray(saved.completed)) return initial;
    const ids = new Set(steps.map((step) => step.id));
    if (!ids.has(saved.position) && saved.position !== 'summary') return initial;
    return {
      signature,
      position: saved.position,
      completed: saved.completed.filter((id) =>
        steps.some((step) => step.id === id && step.type !== 'question'),
      ),
    };
  } catch {
    return initial;
  }
}

/**
 * Guarda únicamente navegación y pasos de lectura reconocidos, nunca respuestas, notas ni retroalimentación.
 * @param {string} key Clave de usuario y lección.
 * @param {object} checkpoint Posición y pasos no evaluados.
 * @returns {boolean} Si el navegador permitió guardar; el fallo no impide estudiar.
 */
export function writeCheckpoint(key, checkpoint) {
  try {
    localStorage.setItem(key, JSON.stringify(checkpoint));
    return true;
  } catch {
    return false;
  }
}
