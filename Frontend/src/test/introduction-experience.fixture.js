import alphabet from '../../../Backend/content/alphabet/module-01.json';

/**
 * Convierte la fixture pública en la introducción real sin copiar claves privadas al frontend.
 * @param {object} snapshot Catálogo de aprendizaje editable de la prueba.
 * @returns {object} El mismo catálogo con el contenido académico de la Lección 1.
 */
export function prepareIntroduction(snapshot) {
  const lesson = snapshot.modules[0].lessons[0];
  const source = alphabet.lessons[0];
  lesson.content = {
    ...lesson.content,
    objectives: source.objectives,
    sections: source.sections,
    practiceInstructions: source.practiceInstructions,
    letterCards: [],
  };
  return snapshot;
}

export const introductionSource = alphabet.lessons[0];
