import { accessibleLessons, accessibleModules } from './learning-access.js';

/**
 * Lee únicamente contenido publicado y el progreso del usuario autenticado.
 * @param {object} database Prisma existente.
 * @param {string | undefined} [previewModuleId] Un módulo local explícito en borrador, fuera del runtime normal.
 * @returns {object} Lectura de catálogo; no expone cuentas ni progreso ajeno.
 */
export function createLearningRepository(database, previewModuleId) {
  return {
    modules: (userId) =>
      database.module.findMany({
        where: accessibleModules(previewModuleId),
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          publicationStatus: true,
          lessons: {
            where: accessibleLessons(previewModuleId),
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              publicationStatus: true,
              content: true,
              progress: { where: { userId }, select: { status: true } },
              exercises: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  instructions: true,
                  type: true,
                  definition: true,
                  progress: { where: { userId }, select: { status: true } },
                },
              },
            },
          },
        },
      }),
  };
}
