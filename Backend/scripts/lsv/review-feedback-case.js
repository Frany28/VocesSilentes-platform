import assert from 'node:assert/strict';

/**
 * Comprueba captura automática e interfaz con un video real o reflejo técnico, sin inventar una candidata.
 * @param {{page: object, browser: object, letter: string, hand: string}} context Navegador aislado y caso.
 * @returns {Promise<object>} Resultado observado, cobertura y cierre del dispositivo, sin precisión independiente.
 */
export async function reviewFeedbackCase({ page, browser, letter, hand }) {
  await page.navigate('/student/practice');
  await page.wait('document.querySelector(".sign-practice")');
  await page.click(`Vocal ${letter}`);
  await page.wait('document.body.textContent.includes("Todo listo para practicar.")');
  assert.equal(await page.evaluate('window.__feedbackReview.cameraCalls'), 0);
  await page.evaluate(`new MutationObserver(()=>{
    if(document.querySelector('.student-attempt')?.textContent.includes('Capturando…'))
      window.__feedbackReview.automaticStarted=true;
  }).observe(document.body,{childList:true,subtree:true,characterData:true})`);
  await page.click('Activar cámara');
  await page.wait(
    `document.querySelector('.detection-status[data-hand="${hand}"][data-stable="true"]')`,
  );
  // No se pulsa Capturar intento: el resultado debe proceder del flujo automático.
  await page.wait('document.querySelector(".practice-result,.practice-retry[role=alert]")');
  const state =
    await page.evaluate(`(()=>{const result=document.querySelector('.practice-result,.practice-retry');
    return {feedback:result.dataset.feedback??'CAPTURE_RETRY',outcome:result.dataset.outcome??'retry',
      heading:result.querySelector('h3').textContent,
      candidate:result.querySelector('.recognition-candidate')?.textContent.trim()??null,
      text:result.textContent,cameraCalls:window.__feedbackReview.cameraCalls,
      writes:window.__feedbackReview.writes,automaticStarted:!!window.__feedbackReview.automaticStarted};})()`);
  assert.equal(state.writes, 0);
  assert.equal(state.automaticStarted, true);
  if (hand === 'Left' && state.feedback !== 'CAPTURE_RETRY') {
    assert.equal(state.feedback, 'UNCERTAIN');
    assert.match(state.text, /no tiene cobertura para esta mano/);
  }
  if (state.feedback === 'EXPERIMENTAL_MATCH') {
    assert.equal(state.candidate, letter);
    assert.equal(state.heading, 'Coincidencia experimental');
    assert.equal(state.outcome, 'success');
  } else if (state.feedback === 'EXPERIMENTAL_DIFFERENT') {
    assert.notEqual(state.candidate, letter);
    assert.equal(state.heading, 'Buen intento');
  } else if (state.feedback !== 'CAPTURE_RETRY') {
    assert.equal(state.heading, 'Seña no reconocida');
    assert.equal(state.candidate, null);
  }
  if (state.feedback === 'CAPTURE_RETRY') assert.equal(state.candidate, null);
  assert.doesNotMatch(state.text, /correctamente|incorrect|logrado/i);
  const views = [];
  for (const width of [1440, 390]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 968,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await page.evaluate(`document.querySelector('.practice-result,.practice-retry')
      .scrollIntoView({block:'center',behavior:'instant'});new Promise(done=>setTimeout(done,300))`);
    assert.equal(await page.evaluate('document.documentElement.scrollWidth>innerWidth'), false);
    await page.capture(`feedback-${letter}-${hand}-${width}`);
    views.push(width);
  }
  await page.click('Detener cámara');
  assert.equal(
    await page.evaluate('window.__feedbackStream.getTracks().every(t=>t.readyState==="ended")'),
    true,
  );
  assert.equal(await page.evaluate('window.__feedbackReview.writes'), 0);
  return { letter, hand, derivedMirror: hand === 'Left', automaticCapture: true, ...state, views };
}
