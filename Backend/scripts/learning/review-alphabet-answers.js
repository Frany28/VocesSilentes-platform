import assert from 'node:assert/strict';
import { alphabetId } from './alphabet-source.js';

/**
 * Envía respuestas desde controles reales a Express y verifica persistencia con Prisma local.
 * @param {{page: object, source: object, database: object, results: object, moduleId: string}} context Entorno aislado.
 * @returns {Promise<void>} Comprueba incorrecta/reintento, siete correctas, pendientes y lectura manual.
 */
export async function reviewAlphabetAnswers({ page, source, database, results, moduleId }) {
  const texts = source.exercises.filter((item) => item.type === 'MULTIPLE_CHOICE_TEXT');
  for (const [index, question] of texts.entries()) {
    await page.navigate(`/student/modules/${moduleId}/lessons/${alphabetId(question.lessonKey)}`);
    await page.wait('document.querySelector("#curriculum-objectives")');
    if (index === 0) {
      await page.click('Registrar lectura completada');
      await page.wait('document.body.textContent.includes("Lectura registrada")');
    }
    await page.click('Ir a los ejercicios');
    const position = source.exercises
      .filter((item) => item.lessonKey === question.lessonKey)
      .findIndex((item) => item.id === question.id);
    await page.fill({ 'Pregunta de la lección': String(position) });
    await page.wait('document.querySelector(".education-options input")');
    if (index === 0) {
      const wrong = question.options.find((option) => option.id !== question.correctOptionId).id;
      await page.evaluate(
        `document.querySelector('.education-options input[value="${wrong}"]').click()`,
      );
      await page.click('Comprobar respuesta');
      await page.wait('document.querySelector(".education-feedback[role=alert]")');
      await page.capture('answer-incorrect');
      await page.click('Reintentar pregunta');
      assert.equal(
        await page.evaluate('document.querySelectorAll(".education-options input:checked").length'),
        0,
      );
    }
    await page.evaluate(
      `document.querySelector('.education-options input[value="${question.correctOptionId}"]').click()`,
    );
    await page.click('Comprobar respuesta');
    await page.wait('document.querySelector(".education-feedback[role=status]")');
    if (index === 0) await page.capture('answer-correct');
  }
  assert.equal(await database.exerciseProgress.count({ where: { status: 'COMPLETED' } }), 7);
  assert.equal(await database.lessonProgress.count({ where: { status: 'COMPLETED' } }), 1);
  const pendingLesson = source.lessons.find((item) => item.id === 'm1-l02');
  await page.navigate(`/student/modules/${moduleId}/lessons/${alphabetId(pendingLesson.id)}`);
  await page.wait('document.querySelector("#curriculum-objectives")');
  await page.click('Ir a los ejercicios');
  await page.wait('document.querySelector("#pending-question")');
  assert.equal(
    await page.evaluate(
      'document.querySelectorAll(".education-options input,.alphabet-card-grid").length',
    ),
    0,
  );
  await page.capture('question-pending');
  for (let n = 0; n < 5; n += 1) await page.click('Ver siguiente pregunta');
  await page.wait('document.querySelector(".education-result-progress")');
  assert.equal(
    await page.evaluate(
      'document.querySelector("[role=progressbar]").getAttribute("aria-valuenow")',
    ),
    '0',
  );
  await page.capture('pending-summary');
  results.answers = { correctPersisted: 7, imageQuestionsPending: 27, manualReading: 1 };
}
