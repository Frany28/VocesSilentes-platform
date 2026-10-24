/**
 * Obtiene recuentos globales y prioridad real en una instantánea, sin recorrer páginas del frontend.
 * @param {object} database Prisma existente.
 * @returns {Promise<object>} Cuentas no eliminadas, estados y últimos reportes pendientes.
 */
export function readAdminSummary(database) {
  return database.$transaction(
    async (tx) => {
      const users = await tx.user.count({ where: { isDeleted: false } });
      const activeUsers = await tx.user.count({ where: { isDeleted: false, isActive: true } });
      const pendingReports = await tx.report.count({ where: { status: 'PENDING' } });
      const resolvedReports = await tx.report.count({ where: { status: 'RESOLVED' } });
      const reports = await tx.report.findMany({
        where: { status: 'PENDING' },
        take: 3,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          description: true,
          category: true,
          status: true,
          createdAt: true,
          author: { select: { firstName: true, lastName: true } },
        },
      });
      return {
        users,
        activeUsers,
        inactiveUsers: users - activeUsers,
        pendingReports,
        resolvedReports,
        reports: reports.map((report) => ({
          ...report,
          title: report.description.slice(0, 100),
          reference: report.id,
          lesson: 'Reporte general',
          author: [report.author.firstName, report.author.lastName].filter(Boolean).join(' '),
        })),
      };
    },
    { isolationLevel: 'RepeatableRead' },
  );
}

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
