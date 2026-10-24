import { createLearningRepository } from './learning.repository.js';
import { persistLearningProgress } from './learning.progress.js';

/**
 * Adapta contenido real al contrato visual existente sin inventar bloqueos ni actividad.
 * @param {object} database Prisma existente.
 * @returns {object} Snapshot y mutaciones de avance manual, sin cámara ni clasificación.
 */
export function createLearningService(database) {
  const repository = createLearningRepository(database);
  return {
    async snapshot(userId) {
      const modules = await repository.modules(userId);
      return {
        source: 'api',
        modules: modules.map((module, index) => {
          const lessons = module.lessons.map(({ progress, exercises, ...lesson }) => ({
            ...lesson,
            status: progress[0]?.status ?? 'NOT_STARTED',
            exercises: exercises.map(({ progress: rows, ...exercise }) => ({
              ...exercise,
              status: rows[0]?.status ?? 'NOT_STARTED',
            })),
          }));
          const next = lessons.find((lesson) => lesson.status !== 'COMPLETED') ?? lessons[0];
          return {
            ...module,
            lessons,
            access: lessons.length ? 'available' : 'locked',
            lockReason: lessons.length ? null : 'Todavía no hay lecciones publicadas',
            illustration: ['secondary', 'tertiary', 'accent'][index % 3],
            nextLesson: next ? { ...next, position: lessons.indexOf(next) + 1 } : null,
          };
        }),
      };
    },
    progress: (userId, kind, id, status) =>
      persistLearningProgress(database, userId, kind, id, status),
  };
}
