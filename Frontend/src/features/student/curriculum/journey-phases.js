/**
 * Etapas pedagógicas de cada lección, en el orden en que se recorren.
 * `review` corresponde al resumen final, que no es un paso de `lessonSteps`.
 */
export const lessonPhases = [
  { id: 'intro', label: 'Introducción' },
  { id: 'explain', label: 'Explicación' },
  { id: 'demo', label: 'Demostración' },
  { id: 'practice', label: 'Práctica' },
  { id: 'assess', label: 'Evaluación' },
  { id: 'review', label: 'Repaso' },
];

const phaseByType = {
  intro: 'intro',
  theory: 'explain',
  resources: 'demo',
  letters: 'demo',
  vowel: 'demo',
  camera: 'practice',
  practice: 'practice',
  question: 'assess',
};

/**
 * Etapa de un paso; los pasos sin tipo conocido conservan la etapa declarada.
 * @param {object | undefined} step Paso actual, o undefined en el resumen.
 * @returns {string} Identificador de etapa.
 */
export function phaseOf(step) {
  if (!step) return 'review';
  return step.phase ?? phaseByType[step.type] ?? 'explain';
}

/**
 * Etapas que realmente contiene un recorrido, para no mostrar «Evaluación» si no hay preguntas.
 * @param {object[]} steps Pasos del recorrido.
 * @returns {object[]} Etapas presentes en orden, siempre con el repaso final.
 */
export function presentPhases(steps) {
  const used = new Set([...steps.map(phaseOf), 'review']);
  return lessonPhases.filter((phase) => used.has(phase.id));
}
