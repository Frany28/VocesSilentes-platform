/**
 * Crea catálogo sintético únicamente en PostgreSQL efímero, incluyendo contenido no ejecutable.
 * @param {object} database Prisma de pruebas.
 * @returns {Promise<object>} IDs y fechas para aserciones; no es una fuente de datos de producción.
 */
export async function metricsContent(database) {
  const modules = [];
  for (let order = 0; order < 3; order += 1) {
    modules.push(
      await database.module.create({
        data: {
          title: `Software module ${order}`,
          description: 'Synthetic metrics test',
          order,
          publicationStatus: order < 2 ? 'PUBLISHED' : 'DRAFT',
        },
      }),
    );
  }
  const lessons = [];
  for (const [index, moduleIndex] of [0, 0, 1, 0, 2].entries()) {
    lessons.push(
      await database.lesson.create({
        data: {
          moduleId: modules[moduleIndex].id,
          title: `Software lesson ${index}`,
          description: 'Synthetic test',
          order: index,
          publicationStatus: index === 3 ? 'DRAFT' : 'PUBLISHED',
        },
      }),
    );
  }
  const exercises = [];
  for (const [index, lesson] of lessons.entries()) {
    exercises.push(
      await database.exercise.create({
        data: {
          lessonId: lesson.id,
          order: 0,
          instructions: 'Software manual exercise',
          expectedSignKey: `fixture_${index}`,
        },
      }),
    );
  }
  const definition = {
    id: 'fixture',
    lessonKey: 'fixture',
    type: 'MULTIPLE_CHOICE_TEXT',
    prompt: 'Software fixture question',
    mediaRef: null,
    options: ['a', 'b', 'c', 'd'].map((id) => ({ id, text: id })),
    correctOptionId: 'a',
    explanationCorrect: 'Software fixture',
    explanationIncorrect: 'Software fixture',
    state: 'PUBLISHED',
    validationStatus: 'APPROVED_LSV',
  };
  for (const [index, changes] of [
    {},
    { state: 'DRAFT' },
    { type: 'MULTIPLE_CHOICE_IMAGE', mediaRef: 'not-a-real-image' },
    { options: [] },
  ].entries()) {
    const question = { ...definition, ...changes };
    await database.exercise.create({
      data: {
        lessonId: lessons[0].id,
        order: index + 1,
        instructions: 'Software fixture',
        expectedSignKey: 'fixture',
        type: question.type,
        definition: question,
      },
    });
  }
  return { modules, lessons, exercises };
}
