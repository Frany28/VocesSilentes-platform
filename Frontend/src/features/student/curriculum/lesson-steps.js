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
 * Intercala explicaciones, pequeños grupos de letras y preguntas disponibles; reúne pendientes una sola vez.
 * En la lección de vocales, el paso de recursos abre la microclase en lugar del marcador pendiente.
 * @param {object} lesson Contenido público de la lección, sin claves privadas de evaluación.
 * @returns {object[]} Pasos estables; un recurso pendiente nunca es una pregunta respondible.
 */
export function lessonSteps(lesson) {
  const { content } = lesson;
  const questions = lesson.exercises.filter((item) => item.availability === 'READY');
  const groups = [];
  for (let index = 0; index < content.letterCards.length; index += 2)
    groups.push(content.letterCards.slice(index, index + 2));
  const steps = [
    { id: 'intro', type: 'intro', title: lesson.title, objectives: content.objectives },
  ];
  const sections = content.sections;
  const boundary = (index, total) => Math.ceil(((index + 1) * sections.length) / total) - 1;
  sections.forEach((section, index) => {
    readingChunks(section.body).forEach((body, part) => {
      steps.push({ id: `theory-${index}-${part}`, type: 'theory', title: section.heading, body });
    });
    if (index === 0)
      steps.push(
        teachesVowels(content)
          ? { id: 'resources', type: 'resources', title: 'Mira la microclase', microclass: true }
          : { id: 'resources', type: 'resources', title: 'Observa a tu ritmo' },
      );
    groups.forEach((cards, group) => {
      if (boundary(group, groups.length) === index)
        steps.push({
          id: `letters-${group}-${cards.map((card) => card.letter).join('')}`,
          type: 'letters',
          title: 'Conoce estas letras',
          cards,
        });
    });
    questions.forEach((question, position) => {
      if (boundary(position, questions.length) === index)
        steps.push({
          id: question.id,
          type: 'question',
          title: question.prompt,
          questionId: question.id,
        });
    });
  });
  steps.push({
    id: 'practice',
    type: 'practice',
    title: 'Una pausa para practicar',
    body: content.practiceInstructions,
  });
  return steps;
}
