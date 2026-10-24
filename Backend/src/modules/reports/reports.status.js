import { HttpError } from '../../errors/http-error.js';
import { lockActor } from '../auth/auth-transaction.js';

/**
 * Cambia pendiente/resuelto y guarda la bitácora en la misma transacción, sin borrar reportes/evidencias.
 * @param {object} database Prisma existente.
 * @param {string} actorId ADMIN obtenido de la sesión.
 * @param {string} id Reporte validado.
 * @param {{status: string, internalComment: string}} input Estado y comentario privado validados.
 * @returns {Promise<void>} Lanza 403/404/409; un fallo de auditoría revierte la transición.
 */
export async function updateReportStatus(database, actorId, id, input) {
  await database.$transaction(async (tx) => {
    await lockActor(tx, actorId, 'ADMIN');
    await tx.$queryRaw`SELECT id FROM vocessilentes."Report" WHERE id = ${id}::uuid FOR UPDATE`;
    const current = await tx.report.findUnique({ where: { id } });
    if (!current) throw new HttpError(404, 'REPORT_NOT_FOUND', 'Reporte no encontrado');
    if (current.status === input.status) {
      if ((current.internalComment ?? '') !== input.internalComment)
        throw new HttpError(
          409,
          'REPORT_STATUS_CONFLICT',
          'El reporte cambió; vuelve a consultarlo',
        );
      return;
    }
    const resolved = input.status === 'RESOLVED';
    const now = new Date(
      Math.max(Date.now(), current.createdAt.getTime(), current.updatedAt.getTime()),
    );
    await tx.report.update({
      where: { id },
      data: {
        status: input.status,
        internalComment: input.internalComment || null,
        resolvedById: resolved ? actorId : null,
        resolvedAt: resolved ? now : null,
        updatedAt: now,
      },
    });
    await tx.auditLog.create({
      data: {
        actorId,
        entityId: id,
        entityType: 'Report',
        operation: resolved ? 'REPORT_RESOLVED' : 'REPORT_REOPENED',
      },
    });
  });
}
