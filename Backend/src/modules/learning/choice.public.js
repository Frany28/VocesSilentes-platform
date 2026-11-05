import { choiceDefinitionSchema } from './choice.validation.js';

/**
 * Determina disponibilidad sin asumir que una ruta de imagen acredita derechos o revisión lingüística.
 * @param {object} question Definición validada del servidor.
 * @param {boolean} preview Vista previa local del módulo autorizado.
 * @returns {'READY'|'PENDING_MATERIAL'|'PENDING_REVIEW'} Motivo de disponibilidad.
 */
export function choiceAvailability(question, preview) {
  if (question.type === 'MULTIPLE_CHOICE_IMAGE') return 'PENDING_MATERIAL';
  return preview || (question.state === 'PUBLISHED' && question.validationStatus === 'APPROVED_LSV')
    ? 'READY'
    : 'PENDING_REVIEW';
}

/**
 * Serializa una pregunta por lista permitida: nunca envía clave, explicación anticipada ni referencia a la letra objetivo.
 * @param {object} exercise Ejercicio persistido y progreso propio.
 * @param {boolean} preview Vista previa local autorizada por el servidor.
 * @returns {object} Contrato compatible con ejercicios manuales y preguntas sin respuestas filtradas.
 */
export function publicExercise(exercise, preview) {
  const base = {
    id: exercise.id,
    instructions: exercise.instructions,
    status: exercise.progress[0]?.status ?? 'NOT_STARTED',
  };
  if (exercise.type === 'SIGN_PRACTICE') return base;
  const question = choiceDefinitionSchema.parse(exercise.definition);
  const availability =
    question.type === exercise.type ? choiceAvailability(question, preview) : 'PENDING_REVIEW';
  return {
    ...base,
    type: exercise.type,
    prompt: question.prompt,
    availability,
    reviewStatus: question.validationStatus,
    options: availability === 'READY' ? question.options : [],
    media: null,
  };
}
