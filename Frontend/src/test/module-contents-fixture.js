import { vi } from 'vitest';
import { curriculumSnapshot } from './student-curriculum-fixture.jsx';
import { jsonResponse, user } from './auth-fixture.jsx';
import { moduleId } from './student-lesson-fixture.jsx';
import { alphabetLessonIds } from '../features/student/resources/lesson-videos.js';
import { lessonSteps } from '../features/student/curriculum/lesson-steps.js';
import { journeySignature } from '../features/student/curriculum/journey-checkpoint.js';

export const modulePath = `/student/modules/${moduleId}`;

/**
 * Simula siete lecturas publicadas y puntos en resumen para reproducir el acceso perdido al contenido.
 * @returns {object} Catálogo de prueba y transporte que rechaza cualquier escritura o cámara.
 */
export function mockCompletedAlphabet() {
  const snapshot = curriculumSnapshot();
  const module = snapshot.modules[0];
  const template = module.lessons[0];
  Object.assign(module, {
    title: 'Abecedario LSV',
    contentKey: 'modulo-01-alfabeto-manual-lsv',
    preview: false,
    publicationStatus: 'PUBLISHED',
  });
  module.lessons = Object.values(alphabetLessonIds).map((id, index) => ({
    ...template,
    id,
    order: index + 1,
    status: 'COMPLETED',
    publicationStatus: 'PUBLISHED',
    title: index === 1 ? 'Las cinco vocales' : `Lección de prueba ${index + 1}`,
    exercises: [],
    content: {
      ...template.content,
      letterCards:
        index === 1
          ? ['A', 'E', 'I', 'O', 'U'].map((letter) => ({
              ...template.content.letterCards[0],
              letter,
            }))
          : [],
    },
  }));
  module.nextLesson = module.lessons[0];
  for (const lesson of module.lessons) {
    const steps = lessonSteps(lesson);
    localStorage.setItem(
      `vs:lesson-journey:${user.id}:${module.id}:${lesson.id}`,
      JSON.stringify({
        signature: journeySignature(steps),
        position: 'summary',
        completed: steps.map((step) => step.id),
      }),
    );
  }
  const fetchMock = vi.fn(async (url, options = {}) => {
    if ((options.method ?? 'GET') !== 'GET') throw new Error('El repaso no admite escrituras');
    if (url.endsWith('/me')) return jsonResponse({ data: { user } });
    if (url.endsWith('/learning')) return jsonResponse({ data: snapshot });
    throw new Error('Petición inesperada en el repaso');
  });
  vi.stubGlobal('fetch', fetchMock);
  return { snapshot, fetchMock };
}
