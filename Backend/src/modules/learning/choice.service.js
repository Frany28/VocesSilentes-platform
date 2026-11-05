import { HttpError } from '../../errors/http-error.js';
import { lockActor } from '../auth/auth-transaction.js';
import { accessibleLessons } from './learning-access.js';
import { choiceDefinitionSchema } from './choice.validation.js';
import { choiceAvailability } from './choice.public.js';
import { saveLearningProgress } from './learning-progress.persistence.js';

/**
 * Corrige una opción en servidor y guarda el mejor avance propio, de forma atómica con su auditoría.
 * @param {object} database Prisma conectado.
 * @param {string} userId Usuario de sesión; nunca tomado del cuerpo.
 * @param {string} id UUID del ejercicio autorizado.
 * @param {string} optionId Identificador de opción, sin calificaciones suministradas por el cliente.
 * @param {string | undefined} [previewModuleId] Único módulo de revisión del proceso local.
 * @returns {Promise<object>} Resultado real y avance, sin clave de respuesta ni datos de otras personas.
 * @throws {HttpError} 404 oculto/no publicado, 409 pendiente, 400 opción desconocida; rollback ante fallo SQL.
 */
export async function checkChoice(database, userId, id, optionId, previewModuleId) {
  return database.$transaction(async (tx) => {
    await lockActor(tx, userId, 'USER');
    const exercise = await tx.exercise.findFirst({
      where: {
        id,
        type: { in: ['MULTIPLE_CHOICE_TEXT', 'MULTIPLE_CHOICE_IMAGE'] },
        lesson: accessibleLessons(previewModuleId),
      },
      include: { lesson: { select: { moduleId: true } } },
    });
    if (!exercise) throw new HttpError(404, 'CONTENT_NOT_FOUND', 'Pregunta no disponible');
    const question = choiceDefinitionSchema.parse(exercise.definition);
    if (question.type !== exercise.type)
      throw new HttpError(409, 'EXERCISE_NOT_READY', 'Pregunta pendiente de revisión');
    const availability = choiceAvailability(question, exercise.lesson.moduleId === previewModuleId);
    if (availability !== 'READY')
      throw new HttpError(
        409,
        availability,
        availability === 'PENDING_MATERIAL'
          ? 'Falta material visual autorizado y validado'
          : 'Pregunta pendiente de revisión',
      );
    if (!question.options.some((option) => option.id === optionId))
      throw new HttpError(400, 'INVALID_OPTION', 'Selecciona una opción de esta pregunta');
    const isCorrect = question.correctOptionId === optionId;
    const progress = await saveLearningProgress(
      tx,
      userId,
      'exercise',
      id,
      isCorrect ? 'COMPLETED' : 'IN_PROGRESS',
    );
    return {
      isCorrect,
      progress,
      feedback: {
        tone: isCorrect ? 'success' : 'error',
        title: isCorrect ? 'Has respondido correctamente.' : 'Vuelve a intentarlo.',
        explanation: isCorrect ? question.explanationCorrect : question.explanationIncorrect,
      },
    };
  });
}
