import assert from 'node:assert/strict';
import { reviewDemoViews } from './review-demo-views.js';
import { reviewCandidateAdvance } from './review-candidate-advance.js';

/**
 * Recorre la práctica opcional con bundle productivo y metraje real; la selección E no impone la predicción A.
 * @param {{page: object, browser: object, mirrored?: boolean}} context Cámara de prueba con video real o derivado.
 * @returns {Promise<object>} Recorrido de inferencia sin entrenamiento público ni progreso académico.
 */
export async function reviewDemoLearning({ page, browser, mirrored = false }) {
  const settled = () =>
    page.evaluate(`Promise.all(document.getAnimations()
    .filter(a=>a.effect?.getComputedTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))`);
  await browser.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 968,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await page.navigate('/student/modules');
  await page.wait('document.body.textContent.includes("Todavía no hay módulos")');
  assert.equal(await page.evaluate('document.querySelectorAll(".student-module-card").length'), 0);
  await page.navigate('/student/practice');
  await page.wait('document.querySelector(".sign-practice")');
  assert.equal(
    await page.evaluate('document.querySelectorAll(".camera-exercise select").length'),
    0,
  );
  assert.equal(await page.evaluate('window.__demoReview.calls'), 0);
  await settled();
  // El modelo de demostración se descarga una sola vez al abrir la práctica, sin pedir cámara.
  await page.wait('document.body.textContent.includes("Reconocimiento experimental listo")');
  await page.click('Vocal E');
  await page.wait('document.querySelector(".camera-viewport")');
  assert.equal(await page.evaluate('window.__demoReview.calls'), 0);
  assert.equal(await page.evaluate('window.__demoReview.modelRequests'), 1);
  // E está en el registro de ilustraciones autorizadas; las consonantes siguen sin servirse.
  await page.wait('document.querySelector(".manual-reference img")?.naturalWidth>0');
  assert.ok(
    await page.evaluate('document.querySelector(".manual-reference img").alt.includes("letra E")'),
  );
  await page.click('Activar cámara');
  await page.wait('document.body.textContent.includes("Detener cámara")');
  const hand = mirrored ? 'Left' : 'Right';
  await page.wait(
    `document.querySelector('.detection-status[data-hand="${hand}"][data-stable="true"]')`,
  );
  // Captura automática: con la mano quieta en el recuadro el intento empieza sin pulsar nada.
  const attempted =
    'document.body.textContent.includes("Intento capturado:") || document.querySelector("[role=alert]")';
  let automaticCapture = true;
  try {
    await page.wait(attempted);
  } catch {
    automaticCapture = false;
    await page.click('Capturar intento');
    await page.wait(attempted);
  }
  assert.ok(
    await page.evaluate('document.body.textContent.includes("Intento capturado:")'),
    await page.evaluate('document.querySelector("[role=alert]")?.textContent'),
  );
  // El análisis es automático al terminar la captura; el botón queda para reanalizar.
  await page.wait(
    mirrored
      ? 'document.body.textContent.includes("Sin evidencia suficiente.")'
      : 'document.body.textContent.includes("El modelo propone: A.")',
  );
  const hypothesis = await page.evaluate(`Array.from(document.querySelectorAll('.vs-alert'))
    .find(node=>node.textContent.includes('Hipótesis experimental')).textContent`);
  if (mirrored) assert.ok(hypothesis.includes('Esta mano necesita más entrenamiento'));
  await page.click('Detener cámara');
  assert.equal(
    await page.evaluate('window.__reviewStream.getTracks().every(t=>t.readyState==="ended")'),
    true,
  );
  const automaticObservationAdvance = !mirrored && (await reviewCandidateAdvance(page));
  const views = await reviewDemoViews({ page, browser, mirrored });
  assert.equal(await page.evaluate('window.__demoReview.learningWrites'), 0);
  assert.equal(await page.evaluate('window.__demoReview.modelRequests'), 1);
  await page.navigate('/student/modules/vowels');
  await page.wait(
    'document.body.textContent.includes("La lección de vocales está en preparación")',
  );
  await page.capture('learning-vowels-pending-publication');
  assert.equal(await page.evaluate('window.__demoReview.learningWrites'), 0);
  return {
    guidedLesson: false,
    pendingPublication: true,
    unauthorizedImagesServed: 0,
    authorizedReferenceShown: 'E',
    automaticCapture,
    automaticObservationAdvance,
    productionBundle: true,
    reference: 'E',
    detectedHand: hand,
    derivedMirrorReplay: mirrored,
    manualHandSelectors: 0,
    replayedTrainingLabel: 'A',
    hypothesis,
    targetLabelDidNotDeterminePrediction: true,
    modelDownloaded: true,
    physicalCamera: false,
    independentEvaluation: false,
    academicWrites: 0,
    views,
  };
}
