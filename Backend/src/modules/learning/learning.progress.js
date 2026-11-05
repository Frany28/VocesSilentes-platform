import { HttpError } from '../../errors/http-error.js';
import { lockActor } from '../auth/auth-transaction.js';
import { accessibleLessons } from './learning-access.js';
import { saveLearningProgress } from './learning-progress.persistence.js';

/**
 * Persiste avance declarado por el alumno; jamás representa una evaluación automática de LSV.
 * @param {object} database Prisma existente.
 * @param {string} userId Identidad de sesión, revalidada bajo bloqueo.
 * @param {'lesson'|'exercise'} kind Tipo validado por la ruta.
 * @param {string} id UUID del contenido publicado.
 * @param {string} status IN_PROGRESS o COMPLETED; no permite retroceder progreso completado.
 * @param {string | undefined} [previewModuleId] Único módulo de revisión local; nunca enviado por el navegador.
 * @returns {Promise<object>} Fila persistida; lanza 403/404 y revierte si falla la bitácora.
 */
export async function persistLearningProgress(database, userId, kind, id, status, previewModuleId) {
  return database.$transaction(async (tx) => {
    await lockActor(tx, userId, 'USER');
    const published = accessibleLessons(previewModuleId);
    const content = await tx[kind].findFirst({
      where: { id, ...(kind === 'lesson' ? published : { lesson: published }) },
    });
    if (!content)
      throw new HttpError(404, 'CONTENT_NOT_FOUND', 'Contenido publicado no encontrado');
    if (kind === 'exercise' && content.type !== 'SIGN_PRACTICE')
      throw new HttpError(
        409,
        'ASSESSMENT_REQUIRED',
        'Esta pregunta requiere comprobación de respuesta',
      );
    return saveLearningProgress(tx, userId, kind, id, status);
  });
}
