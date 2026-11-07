/**
 * Conserva todo el texto y lo agrupa en bloques breves, sin cortar frases ni inventar explicaciones.
 * @param {string} text Texto educativo recibido por la API.
 * @returns {string[]} Fragmentos de hasta aproximadamente 320 caracteres.
 */
export function readingChunks(text) {
  return text.split(/(?<=[.!?])\s+/u).reduce((chunks, sentence) => {
    const last = chunks.length - 1;
    if (last >= 0 && chunks[last].length + sentence.length < 320) chunks[last] += ` ${sentence}`;
    else chunks.push(sentence);
    return chunks;
  }, []);
}

// La lección de vocales se reconoce por sus tarjetas (A, E, I, O, U), no por IDs de base de datos.
const teachesVowels = (content) =>
  content.letterCards.map((card) => card.letter).join('') === 'AEIOU';

/**
 * Acumula pasos garantizando IDs únicos. La navegación y el checkpoint buscan por ID con findIndex:
 * un ID repetido haría volver al primer paso con ese ID. Los IDs de pregunta vienen de la API y
 * podrían coincidir con los estructurales; solo en ese caso se añade un sufijo (los demás no cambian).
 * @returns {{steps: object[], add: Function}} Lista y función para añadir.
 */
function stepList() {
  const steps = [];
  const used = new Set();
  const add = (step) => {
    let id = step.id;
    for (let copy = 2; used.has(id); copy += 1) id = `${step.id}~${copy}`;
    used.add(id);
    steps.push({ ...step, id });
  };
  return { steps, add };
}

/**
 * Ordena la lección en etapas: introducción, explicación, demostración (recursos y letras de dos en
 * dos para comparar), práctica y evaluación. El resumen final es el repaso. No inventa texto: cada
 * explicación es un fragmento del contenido de la API.
 * @param {object} lesson Contenido público de la lección, sin claves privadas de evaluación.
 * @returns {object[]} Pasos con ID único y etapa; un recurso pendiente nunca es una pregunta respondible.
 */
export function lessonSteps(lesson) {
  const { content } = lesson;
  const { steps, add } = stepList();
  add({
    id: 'intro',
    type: 'intro',
    phase: 'intro',
    title: lesson.title,
    objectives: content.objectives,
  });
  content.sections.forEach((section, index) =>
    readingChunks(section.body).forEach((body, part) =>
      add({
        id: `theory-${index}-${part}`,
        type: 'theory',
        phase: 'explain',
        title: section.heading,
        body,
      }),
    ),
  );
  const resources = { id: 'resources', type: 'resources', phase: 'demo', lessonId: lesson.id };
  add(
    teachesVowels(content)
      ? { ...resources, title: 'Mira la microclase', microclass: true }
      : { ...resources, title: 'Observa a tu ritmo' },
  );
  for (let index = 0; index < content.letterCards.length; index += 2) {
    const cards = content.letterCards.slice(index, index + 2);
    add({
      id: `letters-${index / 2}`,
      type: 'letters',
      phase: 'demo',
      title: 'Conoce estas letras',
      cards,
    });
  }
  add({
    id: 'practice',
    type: 'practice',
    phase: 'practice',
    title: 'Una pausa para practicar',
    body: content.practiceInstructions,
  });
  lesson.exercises
    .filter((item) => item.availability === 'READY')
    .forEach((question) =>
      add({
        id: question.id,
        type: 'question',
        phase: 'assess',
        title: question.prompt,
        questionId: question.id,
      }),
    );
  return steps;
}
