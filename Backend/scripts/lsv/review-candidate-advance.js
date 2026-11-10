import assert from 'node:assert/strict';

/**
 * Reproduce A para comprobar avance del recorrido, cierre de cámara y ausencia de calificación/progreso.
 * @param {object} page Driver productivo con cámara de prueba derecha, nunca un participante nuevo.
 * @returns {Promise<boolean>} La coincidencia experimental pasa de A a E sin un selector manual.
 */
export async function reviewCandidateAdvance(page) {
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
  return true;
}
