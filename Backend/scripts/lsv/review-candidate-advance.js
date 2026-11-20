import assert from 'node:assert/strict';
import { reviewDemoViews } from './review-demo-views.js';

/**
 * Reproduce A para comprobar que una coincidencia experimental exige navegación voluntaria, sin notas.
 * @param {{page: object, browser: object}} context Driver y cámara de prueba derecha, nunca un participante nuevo.
 * @returns {Promise<object>} Continuación manual, ausencia de avance automático y ocho vistas de coincidencia.
 */
export async function reviewCandidateAdvance({ page, browser }) {
  await page.click('Vocal A');
  await page.wait('document.querySelector(".manual-reference img")?.alt.includes("letra A")');
  await page.click('Activar cámara');
  await page.wait(
    'document.querySelector(".practice-result")?.dataset.feedback==="EXPERIMENTAL_MATCH"',
  );
  assert.equal(
    await page.evaluate('document.querySelector(".practice-result").dataset.outcome'),
    'success',
  );
  assert.ok(
    await page.evaluate(
      '!document.querySelector(".practice-result").textContent.includes("¡Muy bien!")',
    ),
  );
  assert.ok(
    await page.evaluate(`Array.from(document.querySelectorAll('.practice-result button'))
    .some(button=>button.textContent.trim()==='Continuar práctica')`),
  );
  assert.ok(
    await page.evaluate(`document.querySelector('.practice-progress [aria-current="step"]')
    .textContent.includes('Continúa')`),
  );
  await page.evaluate('new Promise(done=>setTimeout(done,3500))');
  assert.ok(
    await page.evaluate('document.querySelector(".manual-reference img")?.alt.includes("letra A")'),
  );
  await page.capture('learning-visible-experimental-match');
  await page.click('Detener cámara');
  const views = await reviewDemoViews({ page, browser, mirrored: false, outcome: 'success' });
  await page.click('Continuar práctica');
  await page.wait('document.querySelector(".manual-reference img")?.alt.includes("letra E")');
  assert.equal(
    await page.evaluate('window.__reviewStream.getTracks().every(t=>t.readyState==="ended")'),
    true,
  );
  assert.equal(await page.evaluate('window.__demoReview.learningWrites'), 0);
  assert.equal(
    await page.evaluate('document.querySelectorAll(".camera-exercise select").length'),
    0,
  );
  await page.capture('manual-observation-continuation');
  return { automatic: false, manual: true, views };
}
