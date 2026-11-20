import assert from 'node:assert/strict';

/**
 * Recorre las seis lecciones con letras y comprueba las 27 fichas reales en escritorio y móvil.
 * @param {{page: object, browser: object, source: object, moduleId: string, results: object}} context Entorno aislado.
 * @returns {Promise<void>} Evidencia de referencias completas y controles accesibles, sin activar cámara.
 */
export async function reviewAlphabetReferences({ page, browser, source, moduleId, results }) {
  const views = [];
  for (const [width, theme] of [
    [1440, 'light'],
    [390, 'dark'],
  ]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 968,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const letters = new Set();
    for (const [index, lesson] of source.lessons.entries()) {
      const expected = source.letterCards.filter((card) => card.lessonKey === lesson.id);
      if (!expected.length) continue;
      await page.navigate(`/student/modules/${moduleId}`);
      await page.wait('document.querySelector("ol[aria-label=\\"Lecciones del módulo\\"]")');
      await page.click(`Estudiar lección ${index + 1} desde el inicio`);
      await page.wait('document.querySelector("#curriculum-objectives")');
      await page.evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
      const seen = new Set();
      for (let step = 0; step < 40 && seen.size < expected.length; step += 1) {
        const kind = await page.evaluate('document.querySelector(".journey-stage")?.dataset.step');
        if (kind === 'letters') {
          await page.wait(
            '[...document.querySelectorAll(".letter-card img")].every(img=>img.naturalWidth>0)',
          );
          await page.wait(
            '[...document.querySelectorAll(".letter-card")].every(node=>getComputedStyle(node).opacity==="1")',
          );
          const state = await page.evaluate(`(()=>({
            letters:[...document.querySelectorAll('.letter-card')].map(node=>node.dataset.letter),
            images:[...document.querySelectorAll('.letter-card img')].map(img=>({
              path:new URL(img.src).pathname,width:img.naturalWidth,height:img.naturalHeight})),
            overflow:document.documentElement.scrollWidth>innerWidth,
            camera:window.__alphabetCameraCalls}))()`);
          assert.ok(state.letters.length > 0 && state.letters.length <= 2);
          assert.equal(state.images.length, state.letters.length);
          assert.equal(state.overflow, false);
          assert.equal(state.camera, 0);
          for (const image of state.images) {
            assert.match(image.path, /ficha-[a-f0-9]{12}\.webp$/);
            assert.ok(image.width >= 720 && image.height === image.width);
          }
          for (const letter of state.letters) {
            seen.add(letter);
            letters.add(letter);
          }
          if (seen.size === state.letters.length || state.letters.includes('Ñ'))
            await page.capture(
              `references-${lesson.id}-${width}-${theme}-${state.letters.join('')}`,
            );
        }
        if (seen.size < expected.length) await page.click('Continuar');
      }
      assert.deepEqual(
        [...seen],
        expected.map((card) => card.letter),
      );
    }
    assert.equal(letters.size, 27);
    views.push({ width, theme, letters: [...letters], camera: false, overflow: false });
  }
  results.references = { style: 'VocesSilentes-existing-cards', views };
}
