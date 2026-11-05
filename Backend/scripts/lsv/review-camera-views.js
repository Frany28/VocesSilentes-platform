import assert from 'node:assert/strict';

/**
 * Ejecuta el detector oficial y WASM locales con dispositivo sintético de Chrome, sin afirmar precisión sobre LSV.
 * @param {{page: object, browser: object, results: object}} context Entorno aislado de revisión.
 * @returns {Promise<void>} Seis vistas vivas, liberación de pistas y privacidad de progreso.
 */
export async function reviewCameraViews({ page, browser, results }) {
  for (const [width, height] of [
    [1440, 968],
    [834, 1108],
    [390, 844],
  ]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await page.navigate('/student/practice/camera');
    await page.wait('document.querySelector(".camera-viewport")');
    assert.equal(await page.evaluate('window.__cameraReview.calls'), 0);
    assert.equal(await page.evaluate('window.__cameraReview.modelRequests'), 0);
    await page.click('Activar cámara');
    await page.wait('document.body.textContent.includes("Detener cámara")');
    await page.wait('document.querySelector(".camera-viewport canvas").width>0');
    for (const theme of ['light', 'dark']) {
      await page.evaluate(`(()=>{if(document.documentElement.dataset.theme!==${JSON.stringify(theme)})
        document.querySelector('button[aria-label="Cambiar a modo ${theme === 'light' ? 'claro' : 'oscuro'}"]').click();})()`);
      await page.evaluate('new Promise(done=>setTimeout(done,250))');
      assert.ok(await page.evaluate('document.documentElement.scrollWidth<=innerWidth'));
      assert.equal(await page.evaluate('window.__cameraReview.learningWrites'), 0);
      await page.capture(`camera-${theme}-${width}`);
      results.views.push({ width, theme, realDetector: true, cameraDevice: 'synthetic' });
    }
    assert.ok(await page.evaluate('window.__cameraReview.modelRequests>=1'));
    await page.click('Detener cámara');
    assert.equal(
      await page.evaluate(
        'window.__reviewStream.getTracks().every(track=>track.readyState==="ended")',
      ),
      true,
    );
  }
}
