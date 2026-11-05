import { vi } from 'vitest';
import { jsonResponse, user } from './auth-fixture.jsx';
import { lessonId, nextId, lessonSnapshot } from './student-lesson-fixture.jsx';

export const questionId = 'a1000001-0000-4000-8000-000000000005';

/**
 * Construye una proyección API de prueba sin importar JSON privado ni claves del servidor.
 * @returns {object} Dos lecturas y preguntas reducidas para interacción frontend, no contenido de producción.
 */
export function curriculumSnapshot() {
  const snapshot = lessonSnapshot();
  const module = snapshot.modules[0];
  module.preview = true;
  module.publicationStatus = 'DRAFT';
  module.lessons = [
    {
      id: lessonId,
      title: 'Conozcamos la LSV y su alfabeto manual',
      publicationStatus: 'DRAFT',
      status: 'NOT_STARTED',
      content: {
        objectives: ['Distinguir la LSV del alfabeto manual.'],
        sections: [
          { type: 'text', heading: 'Alfabeto manual', body: 'Texto recibido de la API de prueba.' },
        ],
        practiceInstructions: 'Revisar materiales autorizados.',
        letterCards: [
          {
            letter: 'Ñ',
            studyHint: 'Revisar la demostración validada.',
            source: { file: 'manual-lsv.pdf', pdfPage: 6, credit: 'Fuente de prueba' },
            sourceIllustrationShowsMotionArrow: true,
            image: null,
            video: null,
          },
        ],
      },
      exercises: [
        {
          id: questionId,
          type: 'MULTIPLE_CHOICE_TEXT',
          prompt: 'Pregunta de comprensión',
          availability: 'READY',
          status: 'NOT_STARTED',
          options: [
            { id: 'opt1', text: 'Primera alternativa' },
            { id: 'opt2', text: 'Segunda alternativa' },
            { id: 'opt3', text: 'Tercera alternativa' },
            { id: 'opt4', text: 'Cuarta alternativa' },
          ],
        },
        {
          id: 'a1000001-0000-4000-8000-000000000006',
          type: 'MULTIPLE_CHOICE_IMAGE',
          prompt: 'Referencia visual pendiente',
          availability: 'PENDING_MATERIAL',
          status: 'NOT_STARTED',
          options: [],
          media: null,
        },
      ],
    },
    { ...module.lessons[1], id: nextId },
  ];
  module.nextLesson = { ...module.lessons[0], position: 1 };
  return snapshot;
}

/**
 * Simula respuestas HTTP identificadas; no implementa ni sustituye el corrector backend.
 * @param {Function} answer Respuesta o promesa de evaluación controlada por la prueba.
 * @returns {object} Fetch y snapshot inspeccionables, sin base de datos real.
 */
export function mockCurriculumApi(answer) {
  const snapshot = curriculumSnapshot();
  const fetchMock = vi.fn(async (url, options) => {
    if (url.endsWith('/me')) return jsonResponse({ data: { user } });
    if (url.endsWith('/csrf')) return jsonResponse({ data: { csrfToken: 'test-csrf' } });
    if (url.endsWith('/learning')) return jsonResponse({ data: snapshot });
    if (url.endsWith('/answer')) return answer(options, snapshot);
    throw new Error('Petición inesperada en la prueba');
  });
  vi.stubGlobal('fetch', fetchMock);
  return { fetchMock, snapshot };
}
