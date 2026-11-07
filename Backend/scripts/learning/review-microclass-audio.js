import assert from 'node:assert/strict';
import { alphabetId } from './alphabet-source.js';

/**
 * Comprueba en Chrome que la microclase reproduce de verdad su narración grabada: clic real de ratón
 * (gesto de usuario, como exige la política de reproducción con sonido), MP3 descargado y decodificado,
 * reproducción que avanza sin error, sin silencio y con pausa efectiva. También captura el escritorio.
 * @param {{page: object, browser: object, moduleId: string, results: object}} context Entorno aislado.
 * @returns {Promise<void>} Resultado en results.microclassAudio.
 */
export async function reviewMicroclassAudio({ page, browser, moduleId, results }) {
  await browser.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 968,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await page.navigate(`/student/modules/${moduleId}/lessons/${alphabetId('m1-l02')}`);
  // Espera a que el recorrido pinte su paso (o el resumen guardado) antes de decidir cómo avanzar.
  await page.wait('document.querySelector(".journey-stage")');
  if (await page.evaluate('Boolean(document.querySelector(".journey-stage[data-step=summary]"))'))
    await page.click('Repasar desde el inicio');
  for (let step = 0; step < 10; step += 1) {
    // El paso se reconoce por su tipo: la microclase se carga en diferido y aún puede no estar montada.
    if (
      await page.evaluate('Boolean(document.querySelector(".journey-stage[data-step=resources]"))')
    )
      break;
    await page.click('Continuar');
  }
  await page.wait('document.querySelector(".mc-bigplay")');
  await page.evaluate(`(()=>{window.__mcAudio=[];const play=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){window.__mcAudio.push(this);return play.call(this);};})()`);
  const box = await page.evaluate(`(()=>{const node=document.querySelector('.mc-bigplay');
    node.scrollIntoView({block:'center'});const r=node.getBoundingClientRect();
    return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  for (const type of ['mousePressed', 'mouseReleased'])
    await browser.send('Input.dispatchMouseEvent', { type, ...box, button: 'left', clickCount: 1 });
  await page.wait(
    '(()=>{const a=window.__mcAudio?.at(-1);return a&&!a.error&&a.currentTime>0.5;})()',
  );
  const audio = await page.evaluate(`(()=>{const a=window.__mcAudio.at(-1);return {
    path:new URL(a.src).pathname,currentTime:a.currentTime,duration:a.duration,paused:a.paused,
    muted:a.muted,volume:a.volume,error:a.error?.code??null};})()`);
  assert.match(audio.path, /^\/media\/microclass\/[0-9a-f]{8}\.mp3$/);
  assert.ok(audio.duration > 1 && !audio.paused && !audio.muted && audio.volume === 1);
  assert.equal(audio.error, null);
  await page.capture('microclass-audio-desktop-1440');
  await page.evaluate('document.querySelector("[aria-label=\\"Pausar microclase\\"]").click()');
  await page.wait('window.__mcAudio.at(-1).paused');
  results.microclassAudio = { ...audio, pausedOnPause: true, trustedClick: true };
}
