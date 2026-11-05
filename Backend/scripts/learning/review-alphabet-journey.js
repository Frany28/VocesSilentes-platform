import assert from 'node:assert/strict';
import { alphabetId } from './alphabet-source.js';
import { reviewAlphabetAssessment } from './review-alphabet-assessment.js';

/**
 * Recorre una lección, prueba regreso/recarga y registra la lectura solamente desde el resumen final.
 * @param {{page: object, source: object, moduleId: string, lesson: object, suffix: string,
 * results: object}} context Recorrido en una cuenta sintética y tamaño/tema concretos.
 * @returns {Promise<void>} Conservación local, resultados reales y siguiente lección por UUID.
 */
export async function reviewAlphabetJourney({ page, source, moduleId, lesson, suffix, results }) {
  const path = `/student/modules/${moduleId}/lessons/${alphabetId(lesson.id)}`;
  const captured = new Set();
  const letters = new Set();
  let reloaded = false;
  let questions = 0;
  const capture = async (name) => {
    if (captured.has(name)) return;
    captured.add(name);
    await page.evaluate('window.scrollTo(0,0); new Promise(done=>setTimeout(done,250))');
    assert.ok(await page.evaluate('document.documentElement.scrollWidth<=innerWidth'));
    await page.capture(`${lesson.id}-${suffix}-${name}`);
  };
  await page.navigate(path);
  await page.wait('document.querySelector(".learning-journey")');
  for (let count = 0; count < 50; count += 1) {
    const state =
      await page.evaluate(`(()=>({kind:document.querySelector('.journey-stage').dataset.step,
      position:document.querySelector('.learning-journey').dataset.position,
      percent:document.querySelector('[role=progressbar]').getAttribute('aria-valuenow'),
      letters:[...document.querySelectorAll('.journey-letters article')].map(n=>n.dataset.letter)}))()`);
    assert.ok(state.letters.length <= 2);
    for (const letter of state.letters) letters.add(letter);
    if (state.kind === 'summary') break;
    await capture(state.kind);
    if (state.kind === 'theory' && !reloaded) {
      await page.click('Volver');
      assert.equal(
        await page.evaluate(
          'document.querySelector("[role=progressbar]").getAttribute("aria-valuenow")',
        ),
        state.percent,
      );
      await page.click('Continuar');
      await page.navigate(path);
      await page.wait(
        `document.querySelector('.learning-journey')?.dataset.position===${JSON.stringify(state.position)}`,
      );
      reloaded = true;
    }
    if (state.kind === 'question') {
      const question = source.exercises.find((item) => alphabetId(item.id) === state.position);
      await reviewAlphabetAssessment({ page, question, retry: questions === 0, capture });
      questions += 1;
    } else await page.click(state.kind === 'practice' ? 'Ver mi resumen' : 'Continuar');
  }
  await page.wait('document.querySelector(".journey-stage[data-step=summary]")');
  assert.equal(
    await page.evaluate(
      'document.querySelector("[role=progressbar]").getAttribute("aria-valuenow")',
    ),
    '100',
  );
  const expectedLetters = source.letterCards
    .filter((card) => card.lessonKey === lesson.id)
    .map((card) => card.letter);
  assert.deepEqual([...letters], expectedLetters);
  const expected = source.exercises.filter(
    (item) => item.lessonKey === lesson.id && item.type === 'MULTIPLE_CHOICE_TEXT',
  ).length;
  assert.equal(questions, expected);
  await capture('summary');
  await page.click('Registrar lectura completada');
  await page.wait('document.body.textContent.includes("Lectura registrada")');
  await page.navigate(path);
  await page.wait('document.body.textContent.includes("Lectura registrada")');
  await page.click('Siguiente lección');
  const next = source.lessons[source.lessons.indexOf(lesson) + 1];
  await page.wait(`location.pathname.endsWith(${JSON.stringify(alphabetId(next.id))})`);
  results.journeys.push({
    lesson: lesson.id,
    suffix,
    questions,
    letters: [...letters],
    reload: reloaded,
    captures: [...captured],
  });
}
