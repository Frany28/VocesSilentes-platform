import { randomUUID } from 'node:crypto';
import { registered } from './fixture.js';
import { metricsContent } from './metrics-content.fixture.js';

/**
 * Prepara actores y actividad de prueba; jamás lee entorno ni conecta a Supabase.
 * @param {object} fixture authFixture aislado.
 * @returns {Promise<object>} Actores y catálogo con progresos deliberados para comprobar cálculos.
 */
export async function seedMetrics(fixture) {
  const db = fixture.database;
  await db.$executeRaw`SET TIME ZONE 'UTC'`;
  const admin = await registered(fixture);
  const student = await registered(fixture);
  await db.user.updateMany({ data: { createdAt: new Date('2026-09-01T12:00:00Z') } });
  const { passwordHash } = await db.user.findUnique({ where: { id: student.user.id }, select: { passwordHash: true } });
  await db.user.update({ where: { id: admin.user.id }, data: { role: 'ADMIN' } });
  const others = [];
  for (const [index, flags] of [
    { isActive: false },
    { isDeleted: true, deletedAt: new Date() },
    {},
  ].entries()) {
    others.push(
      await db.user.create({
        data: {
          firstName: 'Software fixture',
          username: `metrics_${index}`,
          email: `metrics_${index}@example.invalid`,
          passwordHash,
          createdAt: new Date('2026-09-01T12:00:00Z'),
          ...flags,
        },
      }),
    );
  }
  const [disabled, deleted, quiet] = others;
  await db.session.createMany({
    data: ['2026-10-30T15:00:00Z', '2026-10-31T03:59:59.999Z', '2026-10-31T04:00:00Z'].map(
      (date) => ({
        userId: student.user.id,
        tokenHash: randomUUID().replaceAll('-', '').padEnd(64, '0'),
        createdAt: new Date(date),
        expiresAt: new Date('2026-11-01T12:00:00Z'),
        revokedAt: new Date('2026-10-31T12:00:00Z'),
      }),
    ),
  });
  await db.auditLog.createMany({
    data: [
      [disabled.id, '2026-10-10T12:00:00Z'],
      [admin.user.id, '2026-10-20T12:00:00Z'],
      [student.user.id, '2026-10-31T15:00:00Z'],
      [deleted.id, '2026-10-31T15:00:00Z'],
    ].map(([actorId, date]) => ({
      actorId,
      entityId: quiet.id,
      operation: 'USER_UPDATED',
      createdAt: new Date(date),
    })),
  });
  return { admin, student, disabled, deleted, quiet, ...(await metricsContent(db)) };
}

/**
 * Registra progresos reales en memoria; incluye otra cohorte, roles excluidos y finalizaciones posteriores.
 * @param {object} db Prisma efímero.
 * @param {object} data Actores y catálogo de seedMetrics.
 * @returns {Promise<void>} Filas persistidas para las pruebas de agregación.
 */
export async function seedMetricProgress(db, data) {
  const { student, disabled, deleted, admin, lessons, exercises } = data;
  const cases = [
    [student.user.id, 0, '2026-10-02', '2026-10-05'],
    [student.user.id, 1, '2026-09-20', '2026-10-10'],
    [disabled.id, 0, '2026-10-06', null],
    [disabled.id, 2, '2026-10-07', '2026-11-02'],
    [deleted.id, 0, '2026-10-02', '2026-10-04'],
    [admin.user.id, 0, '2026-10-02', '2026-10-04'],
    [student.user.id, 3, '2026-10-02', '2026-10-04'],
    [student.user.id, 4, '2026-10-02', '2026-10-04'],
  ];
  await db.lessonProgress.createMany({
    data: cases.map(([userId, index, start, end]) => ({
      userId,
      lessonId: lessons[index].id,
      status: end ? 'COMPLETED' : 'IN_PROGRESS',
      startedAt: new Date(`${start}T12:00:00Z`),
      completedAt: end ? new Date(`${end}T12:00:00Z`) : null,
    })),
  });
  await db.exerciseProgress.createMany({
    data: [
      [student.user.id, 0, '2026-10-05'],
      [disabled.id, 1, '2026-10-11'],
      [deleted.id, 0, '2026-10-04'],
      [admin.user.id, 0, '2026-10-04'],
    ].map(([userId, index, date]) => ({
      userId,
      exerciseId: exercises[index].id,
      status: 'COMPLETED',
      lastActivityAt: new Date(`${date}T12:00:00Z`),
      completedAt: new Date(`${date}T12:00:00Z`),
    })),
  });
}
