import { z } from 'zod';

const text = z.string().trim().min(1);
export const optionIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
export const answerSchema = z.object({ optionId: optionIdSchema }).strict();

export const choiceDefinitionSchema = z
  .object({
    id: text.max(100),
    lessonKey: text.max(100),
    type: z.enum(['MULTIPLE_CHOICE_TEXT', 'MULTIPLE_CHOICE_IMAGE']),
    prompt: text,
    mediaRef: text.nullable(),
    options: z.array(z.object({ id: optionIdSchema, text })).length(4),
    correctOptionId: optionIdSchema,
    explanationCorrect: text,
    explanationIncorrect: text,
    state: z.enum(['DRAFT', 'PUBLISHED']),
    validationStatus: z.enum(['PENDING_LSV_REVIEW', 'APPROVED_LSV']),
    requiresLicensedAsset: z.boolean().optional(),
    accessibilityFallback: text.optional(),
  })
  .superRefine((question, context) => {
    const ids = question.options.map((option) => option.id);
    if (new Set(ids).size !== ids.length || !ids.includes(question.correctOptionId))
      context.addIssue({ code: 'custom', message: 'Opciones o clave de respuesta no válidas' });
    if (question.type === 'MULTIPLE_CHOICE_IMAGE' && !question.mediaRef)
      context.addIssue({ code: 'custom', message: 'Falta referencia editorial de imagen' });
  });
