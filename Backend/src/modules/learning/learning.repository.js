/**
 * Lee únicamente contenido publicado y el progreso del usuario autenticado.
 * @param {object} database Prisma existente.
 * @returns {object} Lectura de catálogo; no expone cuentas ni progreso ajeno.
 */
export function createLearningRepository(database) {
  return {
    modules: (userId) =>
      database.module.findMany({
        where: { publicationStatus: 'PUBLISHED' },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          lessons: {
            where: { publicationStatus: 'PUBLISHED' },
            orderBy: { order: 'asc' },
            select: {
              id: true,
              title: true,
              description: true,
              publicationStatus: true,
              progress: { where: { userId }, select: { status: true } },
              exercises: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  instructions: true,
                  progress: { where: { userId }, select: { status: true } },
                },
              },
            },
          },
        },
      }),
  };
}
