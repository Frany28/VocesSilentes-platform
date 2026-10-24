import { lockActor } from '../auth/auth-transaction.js';

/**
 * Crea una sola fila por requestId y su evento; los reintentos no duplican la bitácora.
 * @param {object} database Prisma existente.
 * @param {object} actor Sesión autorizada.
 * @param {object} input Reporte validado.
 * @returns {Promise<object>} Reporte existente o nuevo; propaga fallos transaccionales.
 */
export async function persistReport(database, actor, input) {
  return database.$transaction(async (tx) => {
    await lockActor(tx, actor.id);
    const where = { authorId_requestId: { authorId: actor.id, requestId: input.requestId } };
    const existing = await tx.report.findUnique({ where });
    if (existing) return existing;
    const report = await tx.report.create({ data: { ...input, authorId: actor.id } });
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        operation: 'REPORT_CREATED',
        entityType: 'Report',
        entityId: report.id,
      },
    });
    return report;
  });
}
