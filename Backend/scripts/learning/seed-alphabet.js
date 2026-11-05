import { alphabetId, readAlphabetSource } from './alphabet-source.js';

/**
 * Inserta el paquete como borrador en una base local aislada; repetir no actualiza ninguna fila existente.
 * @param {object} database Prisma local autorizado, proporcionado por el procedimiento aislado.
 * @returns {Promise<object>} Identificador y si se creó; no publica ni crea avances o ejercicios de cámara.
 * @throws {Error} Si hay colisión de claves/IDs o un paquete incompleto previamente cargado.
 */
export async function seedAlphabet(database) {
  const source = await readAlphabetSource();
  const moduleId = alphabetId(source.moduleKey);
  return database.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(611050001)`;
      const existing = await tx.module.findFirst({
        where: { OR: [{ id: moduleId }, { contentKey: source.moduleKey }] },
        include: { lessons: { select: { id: true, exercises: { select: { id: true } } } } },
      });
      if (existing) {
        const lessons = new Set(existing.lessons.map((item) => item.id));
        const questions = new Set(
          existing.lessons.flatMap((item) => item.exercises.map((row) => row.id)),
        );
        if (
          existing.id !== moduleId ||
          existing.contentKey !== source.moduleKey ||
          lessons.size !== 7 ||
          questions.size !== 34 ||
          source.lessons.some((item) => !lessons.has(alphabetId(item.id))) ||
          source.exercises.some((item) => !questions.has(alphabetId(item.id)))
        )
          throw new Error('Carga previa incompatible; no se modificó el contenido existente');
        return { moduleId, created: false };
      }
      const last = await tx.module.aggregate({ _max: { order: true } });
      await tx.module.create({
        data: {
          id: moduleId,
          contentKey: source.moduleKey,
          title: source.moduleTitle,
          description: source.moduleDescription,
          order: (last._max.order ?? 0) + 1,
          publicationStatus: 'DRAFT',
          lessons: {
            create: source.lessons.map((lesson) => ({
              id: alphabetId(lesson.id),
              title: lesson.title,
              order: lesson.order,
              publicationStatus: 'DRAFT',
              description: lesson.summary,
              content: {
                objectives: lesson.objectives,
                sections: lesson.sections,
                practiceInstructions: lesson.practiceInstructions,
                reviewStatus: lesson.contentReviewStatus,
                letterCards: source.letterCards.filter((card) => card.lessonKey === lesson.id),
                source: source.source,
              },
              exercises: {
                create: source.exercises
                  .filter((item) => item.lessonKey === lesson.id)
                  .map((item, index) => ({
                    id: alphabetId(item.id),
                    type: item.type,
                    instructions: item.prompt,
                    order: index + 1,
                    expectedSignKey: item.id,
                    definition: item,
                  })),
              },
            })),
          },
        },
      });
      return { moduleId, created: true };
    },
    { timeout: 20000 },
  );
}
