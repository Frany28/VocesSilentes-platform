import { z } from 'zod';
import { choiceDefinitionSchema } from '../../src/modules/learning/choice.validation.js';

const text = z.string().trim().min(1);
const lesson = z.object({
  id: text.max(100),
  title: text.max(200),
  summary: text,
  letters: z.array(text),
  objectives: z.array(text).min(1),
  sections: z.array(z.object({ type: z.literal('text'), heading: text, body: text })).min(1),
  practiceInstructions: text,
  order: z.number().int().min(1).max(7),
  contentReviewStatus: z.literal('PENDING_LSV_REVIEW'),
  video: z.null(),
});
const card = z.object({
  key: text,
  letter: text,
  lessonKey: text,
  source: z.object({ file: text, pdfPage: z.number().int().min(1), section: text, credit: text }),
  image: z.null(),
  imageStatus: text,
  video: z.null(),
  videoStatus: text,
  sourceIllustrationShowsMotionArrow: z.boolean(),
  signExecutionDescription: z.null(),
  validationStatus: z.literal('PENDING_LSV_REVIEW'),
  studyHint: text,
});

export const alphabetPackageSchema = z
  .object({
    schemaVersion: z.literal('1.0.0'),
    moduleKey: text.max(100),
    moduleTitle: text.max(200),
    moduleDescription: text,
    publicationStatus: z.literal('DRAFT'),
    source: z.object({ title: text, edition: text, illustrationCredit: text, assetPolicy: text }),
    lessons: z.array(lesson).length(7),
    letterCards: z.array(card).length(27),
    exercises: z.array(choiceDefinitionSchema).length(34),
  })
  .superRefine((data, context) => {
    const lessonIds = data.lessons.map((item) => item.id);
    const unique = (items) => new Set(items).size === items.length;
    const cards = new Map(data.letterCards.map((item) => [item.key, item]));
    if (
      !unique(lessonIds) ||
      !unique(data.lessons.map((item) => item.order)) ||
      !unique(data.letterCards.map((item) => item.key)) ||
      !unique(data.letterCards.map((item) => item.letter)) ||
      !unique(data.exercises.map((item) => item.id))
    )
      context.addIssue({ code: 'custom', message: 'El contenido tiene claves duplicadas' });
    for (const item of [...data.letterCards, ...data.exercises]) {
      if (!lessonIds.includes(item.lessonKey))
        context.addIssue({ code: 'custom', message: 'Referencia de lección desconocida' });
    }
    for (const question of data.exercises) {
      if (
        question.state !== 'DRAFT' ||
        question.validationStatus !== 'PENDING_LSV_REVIEW' ||
        (question.mediaRef && cards.get(question.mediaRef)?.lessonKey !== question.lessonKey)
      )
        context.addIssue({ code: 'custom', message: 'Estado o referencia editorial no válidos' });
    }
  });
