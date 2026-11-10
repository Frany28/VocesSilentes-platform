import assert from 'node:assert/strict';
import { reviewDemoViews } from './review-demo-views.js';

/**
 * Reproduce A para comprobar avance del recorrido, cierre de cámara y ausencia de calificación/progreso.
 * @param {{page: object, browser: object}} context Driver y cámara de prueba derecha, nunca un participante nuevo.
 * @returns {Promise<object>} Continuación manual y automática, y éxito visible en ocho vistas.
 */
export async function reviewCandidateAdvance({ page, browser }) {
  await page.click('Vocal A');
  await page.wait('document.querySelector(".manual-reference img")?.alt.includes("letra A")');
  await page.click('Activar cámara');
  await page.wait('document.querySelector(".recognition-candidate")?.textContent==="A"');
  assert.equal(
    await page.evaluate('document.querySelector(".practice-result").dataset.outcome'),
    'success',
  );
  assert.ok(
    await page.evaluate(
      'document.querySelector(".practice-result").textContent.includes("¡Muy bien!")',
    ),
  );
  assert.ok(
    await page.evaluate(`Array.from(document.querySelectorAll('.practice-result button'))
    .some(button=>button.textContent.trim()==='Continuar')`),
  );
  assert.ok(
    await page.evaluate(`document.querySelector('.practice-progress [aria-current="step"]')
    .textContent.includes('Continúa')`),
  );
  await page.capture('learning-visible-success');
  await page.click('Seguir practicando aquí');
  await page.click('Detener cámara');
  const views = await reviewDemoViews({ page, browser, mirrored: false, outcome: 'success' });
  await page.click('Continuar');
  await page.wait('document.querySelector(".manual-reference img")?.alt.includes("letra E")');
  await page.click('Vocal A');
  await page.wait('document.querySelector(".manual-reference img")?.alt.includes("letra A")');
  await page.click('Activar cámara');
  await page.wait('document.querySelector(".recognition-candidate")?.textContent==="A"');
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
  await page.capture('automatic-observation-continuation');
  return { automatic: true, manual: true, views };
}
