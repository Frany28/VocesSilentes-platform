// Guía pública de observación del manual aportado (Fuentes, 2022, pp. 5–6).
// Describe sus ilustraciones; no añade movimientos ni declara revisión lingüística experta.
export const vowelGuides = [
  {
    letter: 'A',
    description:
      'En la ilustración de A, cuatro dedos aparecen recogidos y el pulgar queda al costado.',
    focus: 'Observa el pulgar lateral y compáralo con la posición que tiene en E.',
    comparison: 'En A el pulgar queda al costado; en E aparece delante de la palma.',
    compareWith: 'E',
  },
  {
    letter: 'E',
    description:
      'En la ilustración de E, los cuatro dedos están curvados y el pulgar se coloca delante de la palma, por debajo de ellos.',
    focus: 'Mira las puntas de los dedos y la posición del pulgar. No confundas esta forma con A.',
    comparison:
      'En E los dedos se curvan y el pulgar queda delante de la palma; en A queda al costado.',
    compareWith: 'A',
  },
  {
    letter: 'I',
    description:
      'En la ilustración de I, el meñique permanece extendido y los demás dedos están recogidos.',
    focus: 'Identifica qué dedo está levantado. En U observarás dos dedos extendidos.',
    comparison: 'I mantiene un solo dedo extendido; U muestra dos dedos extendidos y juntos.',
    compareWith: 'U',
  },
  {
    letter: 'O',
    description:
      'En la ilustración de O, los dedos se curvan hacia el pulgar y delimitan una forma redondeada.',
    focus: 'Observa el espacio redondeado y la orientación de la mano que muestra la referencia.',
    comparison: 'O se distingue por el espacio redondeado entre los dedos y el pulgar.',
    compareWith: 'A',
  },
  {
    letter: 'U',
    description:
      'En la ilustración de U, el índice y el dedo medio están extendidos y juntos; los otros dedos aparecen recogidos.',
    focus: 'Compara estos dos dedos juntos con el único dedo extendido de I.',
    comparison: 'U muestra dos dedos extendidos y juntos; I mantiene sólo el meñique extendido.',
    compareWith: 'I',
  },
];

export const vowelLetters = Object.freeze(vowelGuides.map((guide) => guide.letter));

export const vowelActivities = Object.freeze([
  {
    id: 'identify',
    title: 'Reconoce la vocal',
    description: 'Observa una referencia sin rótulo y elige la vocal correspondiente.',
  },
  {
    id: 'differentiate',
    title: 'Diferencia las señas',
    description: 'Compara dos configuraciones y encuentra la que corresponde a la consigna.',
  },
  {
    id: 'recall',
    title: 'Recuerda sin pistas',
    description: 'Recuerda el rasgo principal antes de volver a ver la referencia.',
  },
]);

/**
 * Reconoce la lección real de vocales por su contenido, sin depender del UUID de una base concreta.
 * @param {object} lesson Lección recibida por la API.
 * @returns {boolean} Si sus tarjetas publican exactamente A, E, I, O y U.
 */
export function isVowelLesson(lesson) {
  return (
    lesson?.content?.letterCards?.map((card) => card.letter).join('') === vowelLetters.join('')
  );
}

/**
 * Recorrido unificado de la lección real. Las actividades son formativas y la cámara conserva
 * estados propios; ninguna de ellas se convierte automáticamente en una calificación académica.
 * @param {object} lesson Lección autorizada del catálogo.
 * @returns {object[]} Pasos estables para navegación y checkpoint por usuario.
 */
export function vowelExperienceSteps(lesson) {
  return [
    {
      id: 'intro',
      type: 'vowel-intro',
      phase: 'intro',
      title: 'Aprendamos las cinco vocales',
      objectives: lesson.content.objectives,
    },
    {
      id: 'microclass',
      type: 'vowel-microclass',
      phase: 'demo',
      title: 'Mira la microclase',
    },
    ...vowelGuides.map((guide) => ({
      id: `vowel-${guide.letter}`,
      type: 'vowel-study',
      phase: 'explain',
      title: `Conoce la vocal ${guide.letter}`,
      ...guide,
    })),
    ...vowelActivities.map((activity) => ({
      ...activity,
      type: 'vowel-activity',
      phase: 'assess',
    })),
    {
      id: 'camera-guided',
      type: 'vowel-camera',
      phase: 'practice',
      mode: 'guided',
      title: 'Ahora realiza la seña',
    },
    {
      id: 'camera-memory',
      type: 'vowel-camera',
      phase: 'practice',
      mode: 'memory',
      title: 'Desafío de memoria',
    },
    {
      id: 'mixed-review',
      type: 'vowel-mixed',
      phase: 'review',
      title: 'Repaso combinado',
    },
  ];
}

export const vowelLesson = {
  id: 'vowels-guided-v1',
  title: 'Las cinco vocales: A, E, I, O y U',
  exercises: [],
};
export const vowelModule = {
  id: 'vowels-learning',
  title: 'Vocales del alfabeto manual',
  lessons: [vowelLesson],
};
export const vowelLearningSteps = [
  {
    id: 'intro',
    type: 'intro',
    title: 'Aprende las vocales, una por una',
    objectives: [
      'Observar las referencias de A, E, I, O y U y reconocer sus diferencias.',
      'Leer una explicación de cada ilustración antes de intentar reproducirla.',
      'Practicar cada vocal con la cámara y revisar la letra candidata del modelo.',
    ],
  },
  ...vowelGuides.flatMap((guide) => [
    {
      id: `read-${guide.letter}`,
      type: 'vowel',
      title: `Conoce la vocal ${guide.letter}`,
      ...guide,
    },
    {
      id: `camera-${guide.letter}`,
      type: 'camera',
      title: `Practica la vocal ${guide.letter}`,
      letter: guide.letter,
    },
  ]),
];
