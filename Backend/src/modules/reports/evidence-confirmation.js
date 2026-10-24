/**
 * Confirma READY y su evento atómicamente; no duplica el historial en un reintento.
 * @param {object} database Prisma existente.
 * @param {string} id Reserva de evidencia creada por el servidor.
 * @returns {Promise<{count: number}>} Confirmaciones; un fallo de auditoría conserva PENDING.
 */
export async function confirmEvidence(database, id) {
  return database.$transaction(async (tx) => {
    const row = await tx.reportEvidence.findUnique({ where: { id } });
    if (!row) return { count: 0 };
    const result = await tx.reportEvidence.updateMany({
      where: { id, state: 'PENDING' }, data: { state: 'READY' },
    });
    if (result.count) await tx.auditLog.create({
      data: {
        actorId: row.ownerId, entityId: row.id, entityType: 'ReportEvidence',
        operation: 'REPORT_EVIDENCE_ATTACHED',
      },
    });
    return result;
  });
}
