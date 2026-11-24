const normalize = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLocaleLowerCase('es');

/**
 * Reconoce la introducción por su propósito y ausencia de tarjetas de letras, sin depender del UUID.
 * @param {object} lesson Lección publicada por la API.
 * @returns {boolean} Si presenta conjuntamente la LSV y el alfabeto manual.
 */
export function isIntroductionLesson(lesson) {
  const title = normalize(lesson?.title);
  const headings = (lesson?.content?.sections ?? [])
    .map((section) => normalize(section.heading))
    .join(' ');
  const introducesBoth =
    (title.includes('lsv') && title.includes('alfabeto manual')) ||
    (headings.includes('lengua de senas venezolana') && headings.includes('alfabeto manual'));
  return introducesBoth && (lesson?.content?.letterCards?.length ?? 0) === 0;
}

/**
 * Traduce las secciones publicadas a las seis etapas de la experiencia, sin duplicar su texto.
 * @param {object} lesson Lección pública con ejercicios sanitizados.
 * @returns {object[]} Pasos estables para checkpoint, progreso y navegación.
 */
export function introductionExperienceSteps(lesson) {
  const sections = lesson.content.sections;
  const questions = lesson.exercises.filter((exercise) => exercise.availability === 'READY');
  const findSection = (term, fallback) =>
    sections.find((section) => normalize(section.heading).includes(term)) ?? sections[fallback];
  const steps = [
    {
      id: 'intro',
      type: 'introduction-welcome',
      phase: 'intro',
      objectives: lesson.content.objectives,
      section: sections[0],
      hasAssessment: questions.length > 0,
    },
    {
      id: 'what-is-lsv',
      type: 'introduction-concept',
      phase: 'lsv',
      concept: 'lsv',
      section: findSection('lengua de senas venezolana', 1),
    },
    {
      id: 'manual-alphabet',
      type: 'introduction-concept',
      phase: 'alphabet',
      concept: 'alphabet',
      section: findSection('alfabeto manual', 2),
    },
    {
      id: 'everyday-applications',
      type: 'introduction-applications',
      phase: 'practice',
      section: findSection('como aprender', 3),
      practiceInstructions: lesson.content.practiceInstructions,
    },
  ];
  questions.forEach((question) =>
    steps.push({
      id: question.id,
      type: 'question',
      phase: 'assess',
      title: question.prompt,
      questionId: question.id,
    }),
  );
  return steps;
}

export const introductionPhases = [
  { id: 'intro', label: 'Inicio' },
  { id: 'lsv', label: 'LSV' },
  { id: 'alphabet', label: 'Alfabeto' },
  { id: 'practice', label: 'Aplicaciones' },
  { id: 'assess', label: 'Comprueba' },
  { id: 'review', label: 'Repaso' },
];

export const introductionScenarios = [
  {
    id: 'name',
    title: 'Presentas tu nombre',
    prompt: '¿Cómo puede ayudarte el alfabeto manual?',
    answer: 'Puede ayudarte a deletrear las letras de tu nombre con calma y en orden.',
    cue: 'Nombre',
  },
  {
    id: 'conversation',
    title: 'Quieres mantener una conversación',
    prompt: '¿Basta con deletrear cada palabra?',
    answer:
      'No. La LSV tiene vocabulario, gramática y expresiones propias; el alfabeto manual es solo uno de sus recursos.',
    cue: 'LSV',
  },
  {
    id: 'visual',
    title: 'Estudias una demostración',
    prompt: '¿Qué información visual conviene observar?',
    answer:
      'La configuración, la orientación y el movimiento. Si hay movimiento, una demostración audiovisual validada aporta el contexto completo.',
    cue: 'Observar',
  },
];
