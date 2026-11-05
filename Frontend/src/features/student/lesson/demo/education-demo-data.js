// Datos de ejemplo del diseño Figma: no son contenido aprobado, respuestas corregidas ni progreso del usuario.
export const demoLesson = {
  title: 'Presentarte en LSV',
  explanationTitle: 'Del saludo a la presentación',
  description: [
    'Objetivo: Reconocer el saludo y la presentación como dos partes de un primer encuentro en Lengua de Señas Venezolana.',
    'Empieza captando la atención de tu interlocutor. Saluda y luego preséntate. Al observar una seña, presta atención a la forma de la mano, la dirección del movimiento y la expresión facial.',
  ].join('\n\n'),
};

export const demoQuestions = {
  choice: {
    prompt: '¿Cuál es el orden para iniciar una presentación?',
    options: [
      'Saludar y luego presentarte',
      'Despedirte antes de saludar',
      'Dar las gracias y retirarte',
      'Pedir ayuda sin presentarte',
    ],
  },
  visual: {
    visual: true,
    prompt: 'Observa la seña e identifica su significado.',
    options: ['Dar las gracias', 'Saludar', 'Despedirse', 'Pedir ayuda'],
  },
};

export const demoFeedback = {
  correct: {
    tone: 'success',
    title: 'Identificaste la seña de saludo.',
    explanation: 'Un saludo abre la conversación. Después del saludo, puedes presentarte.',
  },
  incorrect: {
    tone: 'error',
    title: 'Elegiste «Despedirse».',
    explanation:
      'Vuelve a observar el movimiento y piensa si ocurre al inicio o al final de una conversación.',
  },
};

export const demoResult = {
  correct: 2,
  questions: 2,
  completedLessons: 4,
  totalLessons: 5,
  nextTitle: 'Cerrar una conversación',
};

export const demoViews = {
  content: {
    label: 'Contenido de la clase',
    title: 'Presentarte en LSV',
    description: 'Lección 4 de 5 · Saludos y presentaciones',
    step: 1,
  },
  choice: {
    label: 'Selección múltiple',
    title: 'Elige la respuesta correcta',
    description: 'Ejercicio 1 de 2 · Comprensión',
    step: 2,
  },
  visual: {
    label: 'Reconocimiento visual',
    title: '¿Qué comunica esta seña?',
    description: 'Ejercicio 2 de 2 · Observación',
    step: 3,
  },
  correct: {
    label: 'Retroalimentación correcta',
    title: '¡Respuesta correcta!',
    description: 'Ejercicio 2 de 2 · Reconocimiento visual',
    step: 3,
  },
  incorrect: {
    label: 'Retroalimentación incorrecta',
    title: 'Inténtalo de nuevo',
    description: 'Ejercicio 2 de 2 · Reconocimiento visual',
    step: 3,
  },
  result: {
    label: 'Resultado final',
    title: '¡Clase completada!',
    description: 'Lección 4 de 5 · Saludos y presentaciones',
    step: 4,
  },
};
