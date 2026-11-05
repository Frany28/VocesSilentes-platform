import assert from 'node:assert/strict';
import { alphabetModuleId, alphabetId } from '../learning/alphabet-source.js';
import { syntheticDataset } from '../../tests/fixtures/lsv-synthetic.js';

/**
 * Revisa cámara desde una letra, cierre al avanzar, captura sin manos y worker matemático con fixture identificado.
 * @param {{page: object, results: object}} context Navegador sintético y servicios aislados.
 * @returns {Promise<void>} Integración educativa y preparación del modelo; no evalúa señas reales.
 */
export async function reviewCameraJourney({ page, results }) {
  await page.navigate(`/student/modules/${alphabetModuleId}/lessons/${alphabetId('m1-l02')}`);
  await page.wait('document.querySelector(".learning-journey")');
  for (let index = 0; index < 8; index += 1) {
    if (await page.evaluate('document.body.textContent.includes("Practicar A con cámara")')) break;
    await page.click('Continuar');
  }
  assert.equal(await page.evaluate('window.__cameraReview.calls'), 0);
  assert.ok(await page.evaluate('document.querySelector(".manual-reference img").naturalWidth>0'));
  await page.click('Practicar A con cámara');
  await page.wait('document.querySelector(".camera-viewport")');
  await page.click('Activar cámara');
  await page.wait('document.body.textContent.includes("Detener cámara")');
  await page.capture('lesson-vowels-camera');
  await page.click('Continuar');
  await page.wait('!document.querySelector(".camera-viewport")');
  assert.equal(
    await page.evaluate(
      'window.__reviewStream.getTracks().every(track=>track.readyState==="ended")',
    ),
    true,
  );
  await page.navigate('/student/practice/model-lab');
  await page.wait('document.querySelector(".camera-viewport")');
  await page.click('Activar cámara');
  await page.wait('document.body.textContent.includes("Detener cámara")');
  await page.fill({ 'Código de participante': 'synthetic_browser_test' });
  await page.evaluate('document.querySelector("input[type=checkbox]").click()');
  await page.click('Capturar muestra');
  await page.wait('document.body.textContent.includes("entre 16 y 60 frames")');
  assert.ok(await page.evaluate('document.body.textContent.includes("Muestras en memoria: 0")'));
  await page.evaluate(`Object.defineProperty(document,'hidden',{configurable:true,value:true});
    document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;`);
  assert.equal(
    await page.evaluate(
      'window.__reviewStream.getTracks().every(track=>track.readyState==="ended")',
    ),
    true,
  );
  const softwareWorker = await page.evaluate(`new Promise((resolve,reject)=>{
    const worker=new Worker('/src/features/student/recognition/training.worker.js',{type:'module'});
    worker.onmessage=event=>{worker.terminate();resolve({status:event.data.model?.status,
      tests:event.data.report?.total,error:event.data.error??null});};worker.onerror=reject;
    worker.postMessage({samples:${JSON.stringify(syntheticDataset())}});})`);
  assert.deepEqual(softwareWorker, { status: 'EXPERIMENTAL', tests: 2, error: null });
  results.journey = {
    lessonCamera: true,
    stoppedOnNavigation: true,
    stoppedWhenHidden: true,
    emptyCaptureRejected: true,
    workerSoftwareFixturePassed: true,
  };
}
