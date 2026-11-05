/**
 * Guarda estado monotónico y auditoría dentro de la transacción cuyo actor ya está bloqueado/revalidado.
 * @param {object} tx Transacción Prisma vigente.
 * @param {string} userId Actor USER revalidado.
 * @param {'lesson'|'exercise'} kind Tipo de avance.
 * @param {string} id Contenido autorizado por el consumidor.
 * @param {string} status Estado calculado o declarado manualmente según el tipo de actividad.
 * @returns {Promise<object>} Avance confirmado; revierte con la transacción si falla la bitácora.
 */
export async function saveLearningProgress(tx, userId, kind, id, status) {
  const model = kind === 'lesson' ? 'lessonProgress' : 'exerciseProgress';
  const field = kind === 'lesson' ? 'lessonId' : 'exerciseId';
  const where = { [`userId_${field}`]: { userId, [field]: id } };
  const current = await tx[model].findUnique({ where });
  if (current && (current.status === status || current.status === 'COMPLETED')) return current;
  const now = new Date(
    Math.max(
      Date.now(),
      current?.startedAt?.getTime() ?? 0,
      current?.lastActivityAt?.getTime() ?? 0,
    ),
  );
  const timestamps =
    kind === 'lesson' ? { startedAt: current?.startedAt ?? now } : { lastActivityAt: now };
  const data = { status, ...timestamps, completedAt: status === 'COMPLETED' ? now : null };
  const progress = await tx[model].upsert({
    where,
    create: { userId, [field]: id, ...data },
    update: data,
  });
  await tx.auditLog.create({
    data: {
      actorId: userId,
      entityId: progress.id,
      entityType: kind === 'lesson' ? 'LessonProgress' : 'ExerciseProgress',
      operation: kind === 'lesson' ? 'LESSON_PROGRESS_UPDATED' : 'EXERCISE_PROGRESS_UPDATED',
    },
  });
  return progress;
}
