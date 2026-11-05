import { z } from 'zod';

const text = z.string();
const contentSchema = z.object({
  objectives: z.array(text),
  sections: z.array(z.object({ type: z.literal('text'), heading: text, body: text })),
  practiceInstructions: text,
  reviewStatus: text,
  source: z.object({ title: text, edition: text, illustrationCredit: text, assetPolicy: text }),
  letterCards: z.array(
    z.object({
      letter: text,
      studyHint: text,
      source: z.object({ file: text, pdfPage: z.number(), credit: text }),
      imageStatus: text,
      videoStatus: text,
      validationStatus: text,
      sourceIllustrationShowsMotionArrow: z.boolean(),
    }),
  ),
});

/**
 * Publica exclusivamente teoría y tarjetas permitidas; no sirve archivos del manual ni recursos sin aprobación.
 * @param {unknown} content JSON de Lesson, nullable para lecturas anteriores.
 * @returns {object | null} Proyección permitida sin claves privadas ni rutas de material pendiente.
 */
export function publicLessonContent(content) {
  if (!content) return null;
  const parsed = contentSchema.parse(content);
  return {
    ...parsed,
    letterCards: parsed.letterCards.map((card) => ({ ...card, image: null, video: null })),
  };
}
