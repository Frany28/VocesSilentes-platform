import assert from 'node:assert/strict';

/**
 * Recorre el módulo con bundle de producción y metraje real; la referencia E nunca impone la predicción A.
 * @param {{page: object, browser: object}} context Usuario y API efímeros, cámara de prueba con video real.
 * @returns {Promise<object>} Recorrido de inferencia sin entrenamiento público ni progreso académico.
 */
export async function reviewDemoLearning({ page, browser }) {
  await page.navigate('/student/modules');
  await page.wait('document.body.textContent.includes("Practicar vocales con cámara")');
  await page.click('Practicar vocales con cámara');
  await page.wait('document.querySelector(".camera-viewport")');
  assert.equal(await page.evaluate('window.__demoReview.calls'), 0);
  assert.equal(await page.evaluate('window.__demoReview.modelRequests'), 0);
  await page.click('Cargar modelo de vocales');
  await page.wait('document.body.textContent.includes("Modelo experimental cargado")');
  await page.fill({ 'Vocal de referencia': 'E' });
  await page.wait('document.querySelector(".manual-reference img")?.naturalWidth>0');
  assert.ok(
    await page.evaluate('document.querySelector(".manual-reference img").alt.includes("letra E")'),
  );
  await page.click('Activar cámara');
  await page.wait('document.body.textContent.includes("Detener cámara")');
  await page.wait('document.body.textContent.includes("1 mano(s) detectada(s).")');
  await page.click('Capturar intento');
  await page.wait(
    'document.body.textContent.includes("Intento capturado:") || document.querySelector("[role=alert]")',
  );
  assert.ok(
    await page.evaluate('document.body.textContent.includes("Intento capturado:")'),
    await page.evaluate('document.querySelector("[role=alert]")?.textContent'),
  );
  await page.click('Analizar intento');
  await page.wait('document.body.textContent.includes("El modelo propone: A.")');
  const hypothesis = await page.evaluate(`Array.from(document.querySelectorAll('.vs-alert'))
    .find(node=>node.textContent.includes('Hipótesis experimental')).textContent`);
  await page.click('Detener cámara');
  assert.equal(
    await page.evaluate('window.__reviewStream.getTracks().every(t=>t.readyState==="ended")'),
    true,
  );
  const views = [];
  for (const width of [1440, 390]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 968,
      deviceScaleFactor: 1,
      mobile: false,
    });
    assert.ok(await page.evaluate('document.documentElement.scrollWidth<=innerWidth'));
    await page.capture(`learning-vowels-production-${width}`);
    views.push(width);
  }
  assert.equal(await page.evaluate('window.__demoReview.learningWrites'), 0);
  assert.equal(await page.evaluate('window.__demoReview.modelRequests'), 1);
  return {
    productionBundle: true,
    reference: 'E',
    replayedTrainingLabel: 'A',
    hypothesis,
    targetLabelDidNotDeterminePrediction: true,
    modelDownloaded: true,
    trainedLocally: false,
    physicalCamera: false,
    independentEvaluation: false,
    academicWrites: 0,
    views,
  };
}
