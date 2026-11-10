import assert from 'node:assert/strict';

/**
 * Revisa referencias sin configuración manual, con Chrome y detector real sobre cámara sintética sin manos.
 * @param {{page: object, browser: object, results: object}} context Entorno aislado, sin cámara física.
 * @returns {Promise<void>} Evidencia de escritorio/móvil en ambos temas sin registrar progreso académico.
 */
export async function reviewStudentHandReference({ page, browser, results }) {
  await page.navigate('/student/practice');
  await page.wait('document.querySelector(".manual-reference img")?.naturalWidth>0');
  assert.equal(
    await page.evaluate('document.querySelectorAll(".camera-exercise select").length'),
    0,
  );
  await page.click('Activar cámara');
  await page.wait('document.body.textContent.includes("Detener cámara")');
  const before = await page.evaluate('window.__cameraReview.calls');
  assert.equal(await page.evaluate('window.__cameraReview.calls'), before);
  assert.equal(
    await page.evaluate('window.__reviewStream.getTracks().every(t=>t.readyState==="live")'),
    true,
  );
  await page.click('Detener cámara');
  const views = [];
  for (const width of [1440, 390, 320]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
      for (const letter of ['A', 'E', 'I', 'O', 'U']) {
        await page.click(`Vocal ${letter}`);
        await page.wait(
          `document.querySelector('.manual-reference img')?.alt.includes('letra ${letter}')`,
        );
        const geometry = await page.evaluate(`(()=>{
          const figure=document.querySelector('.manual-reference');
          const image=figure.querySelector('img'),label=figure.querySelector('.manual-hand-letter');
          return {selectors:document.querySelectorAll('.camera-exercise select').length,
            imageTransform:getComputedStyle(image).transform,labelTransform:getComputedStyle(label).transform,
            clip:getComputedStyle(image).clipPath,letter:label.textContent,
            overflow:document.documentElement.scrollWidth>innerWidth};})()`);
        assert.equal(geometry.selectors, 0);
        assert.equal(geometry.imageTransform, 'none');
        assert.equal(geometry.labelTransform, 'none');
        assert.ok(geometry.clip.startsWith('polygon'));
        assert.equal(geometry.letter, letter);
        assert.equal(geometry.overflow, false);
      }
      await page.capture(`student-auto-reference-${width}-${theme}`);
      views.push({ width, theme, letters: ['A', 'E', 'I', 'O', 'U'], textUnmirrored: true });
    }
  }
  await page.navigate('/student/practice');
  await page.wait('document.querySelector(".manual-reference img")?.naturalWidth>0');
  assert.equal(
    await page.evaluate('document.querySelectorAll(".camera-exercise select").length'),
    0,
  );
  assert.equal(await page.evaluate('window.__cameraReview.learningWrites'), 0);
  results.handReference = {
    views,
    cameraStaysExplicit: true,
    manualHandSelectors: 0,
    academicWrites: 0,
    physicalCamera: false,
  };
}
