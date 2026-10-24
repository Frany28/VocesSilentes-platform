import { HttpError } from '../../errors/http-error.js';
import { lockActor } from '../auth/auth-transaction.js';

/**
 * Persiste avance declarado por el alumno; jamás representa una evaluación automática de LSV.
 * @param {object} database Prisma existente.
 * @param {string} userId Identidad de sesión, revalidada bajo bloqueo.
 * @param {'lesson'|'exercise'} kind Tipo validado por la ruta.
 * @param {string} id UUID del contenido publicado.
 * @param {string} status IN_PROGRESS o COMPLETED; no permite retroceder progreso completado.
 * @returns {Promise<object>} Fila persistida; lanza 403/404 y revierte si falla la bitácora.
 */
export async function persistLearningProgress(database, userId, kind, id, status) {
  return database.$transaction(async (tx) => {
    await lockActor(tx, userId, 'USER');
    const published = {
      publicationStatus: 'PUBLISHED',
      module: { publicationStatus: 'PUBLISHED' },
    };
    const content = await tx[kind].findFirst({
      where: { id, ...(kind === 'lesson' ? published : { lesson: published }) },
    });
    if (!content)
      throw new HttpError(404, 'CONTENT_NOT_FOUND', 'Contenido publicado no encontrado');
    const model = kind === 'lesson' ? 'lessonProgress' : 'exerciseProgress';
    const field = kind === 'lesson' ? 'lessonId' : 'exerciseId';
    const where = { [`userId_${field}`]: { userId, [field]: id } };
    const current = await tx[model].findUnique({ where });
    if (current && (current.status === status || current.status === 'COMPLETED')) return current;
    const now = new Date();
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
  });
}
