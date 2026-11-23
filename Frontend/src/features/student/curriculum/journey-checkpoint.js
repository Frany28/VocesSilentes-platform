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

// Admite los recorridos anteriores con una práctica única o tres grupos.
// Recalcular su huella completa evita aceptar checkpoints de otros cambios de contenido.
function previousPracticeSignature(steps) {
  const previous = steps
    .filter((step) => !['practice-IO', 'practice-U'].includes(step.id))
    .map((step) => {
      if (step.type !== 'practice' || !step.vowels) return step;
      const { id, type, phase, title, body } = step;
      return { id, type, phase, title, body };
    });
  return journeySignature(previous);
}

function splitPracticeSignature(steps) {
  const previous = steps.flatMap((step) => {
    if (step.id === 'practice-IO' && step.type === 'practice') {
      return [
        { ...step, vowels: ['I', 'O'] },
        { ...step, id: 'practice-U', vowels: ['U'] },
      ];
    }
    if (step.type === 'practice' && !step.vowels) {
      return [
        { ...step, vowels: ['A', 'E'] },
        { ...step, id: 'practice-IO', vowels: ['I', 'O'] },
        { ...step, id: 'practice-U', vowels: ['U'] },
      ];
    }
    return [step];
  });
  return journeySignature(previous);
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
    const wasSplit = saved?.signature === splitPracticeSignature(steps);
    const compatible = wasSplit || saved?.signature === previousPracticeSignature(steps);
    if ((!compatible && saved?.signature !== signature) || !Array.isArray(saved?.completed))
      return initial;
    const ids = new Set(steps.map((step) => step.id));
    const position =
      wasSplit && ['practice-IO', 'practice-U'].includes(saved.position)
        ? ids.has('practice-IO')
          ? 'practice-IO'
          : 'practice'
        : saved.position;
    if (!ids.has(position) && position !== 'summary') return initial;
    return {
      signature,
      position,
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
