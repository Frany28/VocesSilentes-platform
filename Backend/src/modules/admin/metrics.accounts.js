/**
 * Reutiliza el censo y prioridad del dashboard; isActive representa habilitación, no actividad reciente.
 * @param {object} tx Transacción de lectura Prisma.
 * @returns {Promise<object>} Totales actuales sin cuentas eliminadas; reportes conservados como en gestión.
 */
export async function readAccountMetrics(tx) {
  const groups = await tx.user.groupBy({ by: ['isActive'], where: { isDeleted: false }, _count: true });
  const enabledUsers = groups.find((item) => item.isActive)?._count ?? 0;
  const disabledUsers = groups.find((item) => !item.isActive)?._count ?? 0;
  const reportsByStatus = await tx.report.groupBy({ by: ['status'], _count: true });
  const count = (status) => reportsByStatus.find((item) => item.status === status)?._count ?? 0;
  const reports = await tx.report.findMany({
    where: { status: 'PENDING' }, take: 3, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, description: true, category: true, status: true, createdAt: true,
      author: { select: { firstName: true, lastName: true } } },
  });
  return {
    users: enabledUsers + disabledUsers, enabledUsers, disabledUsers,
    // Alias anteriores conservados para consumidores existentes; nunca son usuarios con actividad.
    activeUsers: enabledUsers, inactiveUsers: disabledUsers,
    pendingReports: count('PENDING'), resolvedReports: count('RESOLVED'),
    reports: reports.map((report) => ({ ...report, title: report.description.slice(0, 100),
      reference: report.id, lesson: 'Reporte general',
      author: [report.author.firstName, report.author.lastName].filter(Boolean).join(' ') })),
  };
}
