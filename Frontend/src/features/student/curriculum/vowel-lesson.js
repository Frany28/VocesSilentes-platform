// Guía pública de observación del manual aportado (Fuentes, 2022, pp. 5–6).
// Describe sus ilustraciones; no añade movimientos ni declara revisión lingüística experta.
export const vowelGuides = [
  {
    letter: 'A',
    description:
      'En la ilustración de A, cuatro dedos aparecen recogidos y el pulgar queda al costado.',
    focus: 'Observa el pulgar lateral y compáralo con la posición que tiene en E.',
  },
  {
    letter: 'E',
    description:
      'En la ilustración de E, los cuatro dedos están curvados y el pulgar se coloca delante de la palma, por debajo de ellos.',
    focus: 'Mira las puntas de los dedos y la posición del pulgar. No confundas esta forma con A.',
  },
  {
    letter: 'I',
    description:
      'En la ilustración de I, el meñique permanece extendido y los demás dedos están recogidos.',
    focus: 'Identifica qué dedo está levantado. En U observarás dos dedos extendidos.',
  },
  {
    letter: 'O',
    description:
      'En la ilustración de O, los dedos se curvan hacia el pulgar y delimitan una forma redondeada.',
    focus: 'Observa el espacio redondeado y la orientación de la mano que muestra la referencia.',
  },
  {
    letter: 'U',
    description:
      'En la ilustración de U, el índice y el dedo medio están extendidos y juntos; los otros dedos aparecen recogidos.',
    focus: 'Compara estos dos dedos juntos con el único dedo extendido de I.',
  },
];

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
