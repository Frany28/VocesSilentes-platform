/**
 * Resume progreso ya persistido; no crea ni evalúa lecciones y no inventa actividad.
 * @param {object} database Prisma existente.
 * @param {string} userId Cuenta consultada por ADMIN.
 * @returns {Promise<object>} Finalizaciones, módulo iniciado y fecha real de actividad.
 */
export function readUserActivity(database, userId) {
  return database.$transaction(
    async (tx) => {
      const lessons = await tx.lessonProgress.count({ where: { userId, status: 'COMPLETED' } });
      const exercises = await tx.exerciseProgress.count({ where: { userId, status: 'COMPLETED' } });
      const current = await tx.lessonProgress.findFirst({
        where: { userId, status: 'IN_PROGRESS' },
        orderBy: { startedAt: 'desc' },
        select: { lesson: { select: { module: { select: { title: true } } } } },
      });
      const sessions = await tx.session.aggregate({ where: { userId }, _max: { createdAt: true } });
      const activity = await tx.auditLog.aggregate({
        where: { actorId: userId },
        _max: { createdAt: true },
      });
      const dates = [sessions._max.createdAt, activity._max.createdAt].filter(Boolean);
      return {
        lessons,
        exercises,
        currentModule: current?.lesson.module.title ?? null,
        lastActivity: dates.length ? new Date(Math.max(...dates.map(Number))) : null,
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}
