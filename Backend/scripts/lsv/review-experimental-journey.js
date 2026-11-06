import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validateModel } from '../../../shared/lsv/classifier.js';

/**
 * Entrena/exporta/importa en React y captura metraje real reproducido como webcam de prueba.
 * @param {{page: object, browser: object, output: string}} context Navegador con archivo Y4M real.
 * @returns {Promise<object>} Evidencia técnica; no mide precisión ni usa cámara física.
 */
export async function reviewExperimentalJourney({ page, browser, output }) {
  await page.navigate('/student/practice/model-lab');
  await page.wait('document.querySelector(".camera-viewport")');
  assert.equal(await page.evaluate('window.__cameraReview.calls'), 0);
  await page.click('Cargar modelo experimental local');
  await page.wait('document.body.textContent.includes("Modelo local listo")');
  await page.click('Incorporar nueve muestras confirmadas');
  await page.wait('document.body.textContent.includes("Muestras en memoria: 9")');
  await page.click('Entrenar modelo experimental');
  await page.wait('document.body.textContent.includes("Modelo EXPERIMENTAL local creado")');
  const downloads = join(output, 'downloads');
  await mkdir(downloads, { recursive: true });
  await browser.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  await page.click('Descargar modelo');
  const path = join(downloads, 'lsv-experimental-model.json');
  await page.wait('document.body.textContent.includes("Etiquetas aprendidas")');
  // CDP informa el fin de descarga de forma asíncrona; el sondeo usa el mismo plazo que el navegador.
  const { waitForAcademic } = await import('../academic/browser-session.js');
  const exported = await waitForAcademic(async () =>
    validateModel(JSON.parse(await readFile(path, 'utf8'))),
  );
  assert.equal(exported.trainingMode, 'LOCAL_PROVISIONAL');
  assert.equal(exported.sampleAudit.length, 9);
  await page.file('.model-settings input[type=file]', path);
  await page.wait('document.body.textContent.includes("Modelo experimental cargado")');
  await page.click('Activar cámara');
  await page.wait('document.body.textContent.includes("Detener cámara")');
  await page.click('Capturar intento');
  await page.wait('document.body.textContent.includes("Intento capturado:")');
  await page.click('Analizar intento');
  await page.wait('document.body.textContent.includes("El modelo propone:")');
  const hypothesis = await page.evaluate(`Array.from(document.querySelectorAll('.vs-alert'))
    .find(node=>node.textContent.includes('Hipótesis experimental'))?.textContent`);
  assert.ok(await page.evaluate('document.body.textContent.includes("El modelo propone: A.")'));
  await page.fill({ 'Código de participante': 'replayed_training_source' });
  await page.evaluate('document.querySelector("input[type=checkbox]").click()');
  await page.click('Capturar muestra');
  await page.wait(
    'document.body.textContent.includes("Muestra lista:") || document.body.textContent.includes("Repite la muestra")',
  );
  assert.ok(
    await page.evaluate('document.body.textContent.includes("Muestra lista:")'),
    await page.evaluate(
      '[...document.querySelectorAll("[role=alert]")].map(n=>n.textContent).join("; ")',
    ),
  );
  await page.click('Guardar muestra en memoria');
  await page.wait('document.body.textContent.includes("Muestras en memoria: 10")');
  // Se descarta: reproducir la misma ejecución nunca crea una persona ni un ejemplo independiente.
  await page.evaluate(
    '[...document.querySelectorAll(".training-sample-row")].at(-1).querySelector("button:last-child").click()',
  );
  await page.wait('document.body.textContent.includes("Muestras en memoria: 9")');
  await page.click('Detener cámara');
  await page.capture('experimental-real-replay');
  assert.equal(
    await page.evaluate('window.__reviewStream.getTracks().every(t=>t.readyState==="ended")'),
    true,
  );
  assert.equal(await page.evaluate('window.__cameraReview.learningWrites'), 0);
  return {
    exported: true,
    imported: true,
    workerTrained: true,
    cameraApiOpened: true,
    capturedRealReplay: true,
    hypothesis,
    supervisedCaptureDiscarded: true,
    physicalCamera: false,
    reusedTrainingExecution: true,
    independentEvaluation: false,
    accuracy: null,
  };
}
