import assert from 'node:assert/strict';
import { createVideoFixture } from './create-video-fixture.js';
import { reviewVideoLayout } from './review-video-layout.js';

/**
 * Prueba archivo real/decodificación/modelo reales con metraje sintético sin manos; no entrena ni reconoce LSV.
 * @param {{page: object, browser: object, results: object, output: string}} context Entorno y base efímeros.
 * @returns {Promise<void>} Anotación, validaciones, rechazo vacío y ciclo de vida comprobados en Chrome.
 */
export async function reviewVideoImport(context) {
  const { page, results, output } = context;
  await page.navigate('/student/practice/model-lab');
  await page.wait('document.querySelector(".camera-viewport")');
  const path = await createVideoFixture(page, output);
  await page.click('Importar video local');
  assert.equal(await page.evaluate('window.__cameraReview.calls'), 0);
  await page.file('input[type=file]', path);
  try {
    await page.wait('document.querySelector(".local-video-viewport video")?.duration>0');
  } catch (cause) {
    const state = await page.evaluate(`({alerts:[...document.querySelectorAll('[role=alert]')]
      .map(node=>node.textContent),video:document.querySelector('.local-video-viewport video')?.error?.code})`);
    throw new Error(`No se cargó el video sintético: ${JSON.stringify(state)}`, { cause });
  }
  await page.fill({
    'Inicio (segundos)': '0',
    'Fin (segundos)': '2',
    'Código de participante': 'software_fixture',
    'Procedencia y crédito del video': 'Local synthetic software fixture, not LSV',
    'Referencia de autorización': 'Generated shapes only for software verification',
    'Código de ejecución': 'software_take_01',
  });
  assert.equal(
    await page.evaluate(`Array.from(document.querySelectorAll('button'))
    .find(n=>n.textContent.trim()==='Extraer muestra del intervalo').disabled`),
    true,
  );
  await page.evaluate(
    `document.querySelectorAll('form input[type=checkbox]').forEach(n=>n.click())`,
  );
  await reviewVideoLayout(context);
  const decoding = await page.evaluate(`(async()=>{
    const {readVideoInterval}=await import('/src/features/student/recognition/video-playback.js');
    const times=[];const video=document.querySelector('.local-video-viewport video');
    await readVideoInterval(video,{start:0,end:2},new AbortController().signal,(_video,time)=>times.push(time));
    return {count:times.length,continuous:times.every((time,index)=>!index||time>times[index-1]),
      duration:times.at(-1)-times[0],paused:video.paused,rate:video.playbackRate};})()`);
  assert.ok(decoding.count >= 16);
  assert.ok(decoding.continuous && decoding.duration >= 1.5 && decoding.paused);
  assert.equal(decoding.rate, 1);
  await page.fill({ 'Fin (segundos)': '1' });
  await page.click('Extraer muestra del intervalo');
  await page.wait('document.body.textContent.includes("Cada ejecución debe durar")');
  assert.equal(await page.evaluate('window.__cameraReview.modelRequests'), 0);
  await page.fill({ 'Fin (segundos)': '2' });
  await page.click('Extraer muestra del intervalo');
  await page.wait('document.body.textContent.includes("no hay exactamente una mano detectable")');
  assert.equal(
    await page.evaluate('document.querySelector(".local-video-viewport video").paused'),
    true,
  );
  assert.ok(await page.evaluate('document.body.textContent.includes("Muestras en memoria: 0")'));
  assert.equal(await page.evaluate('window.__cameraReview.calls'), 0);
  assert.equal(await page.evaluate('window.__cameraReview.learningWrites'), 0);
  results.videoImport = {
    localDecode: true,
    receivedFrames: decoding.count,
    invalidIntervalBeforeModel: true,
    emptyHandRejected: true,
    cameraAcquired: false,
    gradedSamples: 0,
  };
}
