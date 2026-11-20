/**
 * Conserva la práctica de dos letras por página y las instrucciones originales de cada lección.
 * La introducción sin tarjetas mantiene el recorrido de vocales recuperado; las consonantes usan sus fichas.
 * @param {object} content Contenido público recibido de la API.
 * @returns {object[]} Pasos de práctica sin preguntas ni nuevos estados de reconocimiento.
 */
export function lessonPracticeSteps(content) {
  const cards = content.letterCards;
  const vowels = !cards.length || cards.map((card) => card.letter).join('') === 'AEIOU';
  const items = vowels ? ['A', 'E', 'I', 'O', 'U'] : cards;
  const steps = [];
  for (let index = 0; index < items.length; index += 2) {
    const group = items.slice(index, index + 2);
    const letters = vowels ? group : group.map((card) => card.letter);
    steps.push({
      id: index === 0 ? 'practice' : `practice-${letters.join('')}`,
      type: 'practice',
      phase: 'practice',
      title: 'Una pausa para practicar',
      body: content.practiceInstructions,
      ...(vowels ? { vowels: group } : { cards: group }),
    });
  }
  return steps;
}
