/**
 * Letras que el modelo de demostración publicado (vowels-demo-v1) puede proponer.
 * Debe coincidir con las etiquetas de public/models/lsv-vowels-demo-v1.json; una prueba lo comprueba.
 * Sirve para orientar la interfaz antes de descargar el modelo, nunca como resultado.
 */
export const demoLetters = Object.freeze(['A', 'E', 'I', 'O', 'U']);

/**
 * Indica si existe clasificación experimental para una letra objetivo.
 * @param {string | undefined} letter Letra que practica el estudiante.
 * @param {object | null} [model] Modelo cargado; sin él se usa la lista de la demostración.
 * @returns {boolean} true si el modelo tiene ejemplos de esa letra.
 */
export function recognitionSupports(letter, model) {
  if (!letter) return true;
  const labels = model?.labels ?? demoLetters;
  return labels.includes(letter) && letter !== 'NONE';
}

/**
 * Lateralidades (según MediaPipe) con ejemplos en el modelo.
 * @param {object | null} model Modelo validado.
 * @returns {string[]} Por ejemplo ['Right'].
 */
export function modelHands(model) {
  return [...new Set((model?.prototypes ?? []).map((prototype) => prototype.hand))];
}

const handNames = { Right: 'derecha', Left: 'izquierda' };

/**
 * Explica una abstención con una acción concreta para el siguiente intento.
 * @param {string} reason Motivo devuelto por predictSequence.
 * @param {object} model Modelo usado.
 * @returns {string} Indicación para el estudiante, sin culparle ni calificar.
 */
export function abstentionAdvice(reason, model) {
  const hands = modelHands(model).map((hand) => handNames[hand] ?? hand);
  return (
    {
      UNSUPPORTED_HAND: `Esta mano necesita más entrenamiento. Por ahora hay ejemplos con la mano ${hands.join(' y ')}. Puedes seguir practicando por observación.`,
      OUT_OF_DISTRIBUTION:
        'El intento está lejos de los ejemplos. Centra la mano, acércala y mantén la forma quieta los tres segundos.',
      BACKGROUND:
        'No reconocimos una vocal en el intento. Forma la letra antes de que empiece la captura.',
      AMBIGUOUS:
        'El intento se parece a varias letras a la vez. Repite cuidando la posición de los dedos.',
    }[reason] ?? 'El modelo no tiene suficiente evidencia para este intento. Repite la captura.'
  );
}
