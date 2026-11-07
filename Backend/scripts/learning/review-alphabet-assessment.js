import assert from 'node:assert/strict';

/**
 * Comprueba el corrector real desde radios nativos, sin pasar a otra actividad antes del feedback.
 * @param {{page: object, question: object, retry: boolean, capture: Function}} context Pregunta privada solo del runner.
 * @returns {Promise<void>} Reintento opcional y una respuesta correcta confirmada por Express.
 */
export async function reviewAlphabetAssessment({ page, question, retry, capture }) {
  const percent = () =>
    page.evaluate('document.querySelector("[role=progressbar]").getAttribute("aria-valuenow")');
  const before = await percent();
  await page.wait('document.querySelector(".education-options input")');
  assert.equal(
    await page.evaluate('document.querySelector(".journey-controls button[type=submit]").disabled'),
    true,
  );
  assert.equal(
    await page.evaluate('document.querySelectorAll(".letter-compare,select").length'),
    0,
  );
  await capture('question');
  if (retry) {
    const wrong = question.options.find((option) => option.id !== question.correctOptionId).id;
    await page.evaluate(
      `document.querySelector('.education-options input[value="${wrong}"]').click()`,
    );
    await page.wait('!document.querySelector(".journey-controls button[type=submit]").disabled');
    await capture('selected');
    await page.click('Comprobar respuesta');
    await page.wait('document.querySelector(".education-feedback[role=alert]")');
    assert.equal(await percent(), before);
    await capture('incorrect');
    await page.click('Reintentar');
    assert.equal(
      await page.evaluate('document.querySelectorAll(".education-options input:checked").length'),
      0,
    );
  }
  await page.evaluate(
    `document.querySelector('.education-options input[value="${question.correctOptionId}"]').click()`,
  );
  await page.wait('!document.querySelector(".journey-controls button[type=submit]").disabled');
  await page.click('Comprobar respuesta');
  await page.wait('document.querySelector(".education-feedback[role=status]")');
  assert.ok(Number(await percent()) > Number(before));
  await capture('correct');
  await page.click('Continuar');
}
