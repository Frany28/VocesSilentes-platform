import { accessibleLessons } from '../learning/learning-access.js';
import { choiceDefinitionSchema } from '../learning/choice.validation.js';
import { choiceAvailability } from '../learning/choice.public.js';

/**
 * Cuenta catálogo accesible y ejercicios ejecutables, reutilizando la validación educativa real.
 * @param {object} tx Instantánea Prisma de solo lectura.
 * @returns {Promise<object>} Totales actuales; los borradores y preguntas pendientes no se ofrecen como disponibles.
 */
export async function readCatalogMetrics(tx) {
  const modulesPublished = await tx.module.count({ where: { publicationStatus: 'PUBLISHED' } });
  const lessonsPublished = await tx.lesson.count({ where: accessibleLessons() });
  const manual = await tx.exercise.count({ where: { type: 'SIGN_PRACTICE', lesson: accessibleLessons() } });
  // La base compartida anterior a alphabet_curriculum no tiene definition: la fila JSON devuelve null.
  // No se consultan enums nuevos como valores de un enum PostgreSQL todavía no migrado.
  const questions = await tx.$queryRaw`
    SELECT to_jsonb(e)->'definition' AS definition FROM vocessilentes."Exercise" e
    JOIN vocessilentes."Lesson" l ON l.id = e."lessonId"
    JOIN vocessilentes."Module" m ON m.id = l."moduleId"
    WHERE l."publicationStatus" = 'PUBLISHED' AND m."publicationStatus" = 'PUBLISHED'
      AND e.type::text = 'MULTIPLE_CHOICE_TEXT'
  `;
  const ready = questions.filter(({ definition }) => {
    const parsed = choiceDefinitionSchema.safeParse(definition);
    return parsed.success && parsed.data.type === 'MULTIPLE_CHOICE_TEXT' &&
      choiceAvailability(parsed.data, false) === 'READY';
  }).length;
  return { modulesPublished, lessonsPublished, exercisesAvailable: manual + ready };
}
