import assert from 'node:assert/strict';

/**
 * Comprueba los bloques por vocal en las rutas reales de introducción y vocales, sin pedir cámara.
 * @param {{page: object, browser: object, moduleId: string, results: object}} context Entorno aislado.
 * @returns {Promise<void>} Evidencia adaptable, selección individual y retorno sin completar la lectura.
 */
export async function reviewAlphabetPractice({ page, browser, moduleId, results }) {
  const views = [];
  for (const width of [1440, 390, 320]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 968,
      deviceScaleFactor: 1,
      mobile: false,
    });
    for (const lesson of [1, 2]) {
      await page.navigate(`/student/modules/${moduleId}`);
      await page.wait('document.querySelector("ol[aria-label=\\"Lecciones del módulo\\"]")');
      await page.click(`Estudiar lección ${lesson} desde el inicio`);
      await page.wait('document.querySelector("#curriculum-objectives")');
      const theme = width === 1440 ? 'light' : 'dark';
      await page.evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
      for (let step = 0; step < 35; step += 1) {
        if (await page.evaluate('!!document.querySelector(".vowel-practice-blocks")')) break;
        await page.click('Continuar');
      }
      await page.wait(
        'document.querySelectorAll(".vowel-practice-block img").length===5&&' +
          '[...document.querySelectorAll(".vowel-practice-block img")].every(img=>img.naturalWidth>0)',
      );
      const state = await page.evaluate(`(()=>({
        letters:[...document.querySelectorAll('.vowel-practice-block')].map(node=>node.dataset.letter),
        images:[...document.querySelectorAll('.vowel-practice-block img')].map(img=>({
          path:new URL(img.src).pathname,width:img.naturalWidth,height:img.naturalHeight})),
        overflow:document.documentElement.scrollWidth>innerWidth,
        camera:window.__alphabetCameraCalls,
        loadedCamera:!!document.querySelector('.camera-exercise'),
        position:document.querySelector('.learning-journey').dataset.position}))()`);
      assert.deepEqual(state.letters, ['A', 'E', 'I', 'O', 'U']);
      assert.equal(state.overflow, false);
      assert.equal(state.camera, 0);
      assert.equal(state.loadedCamera, false);
      assert.equal(state.position, 'practice');
      for (const image of state.images) {
        assert.match(image.path, /ficha-[a-f0-9]{12}\.webp$/);
        assert.ok(image.width >= 720 && image.height === image.width);
      }
      await page.capture(`practice-blocks-lesson-${lesson}-${width}-${theme}`);
      await page.click('Practicar E con cámara');
      await page.wait(
        'document.querySelector(".camera-exercise h2")?.textContent==="Practica la letra E"',
      );
      await page.wait('document.querySelector(".camera-exercise img")?.naturalWidth>0');
      assert.equal(await page.evaluate('window.__alphabetCameraCalls'), 0);
      assert.equal(
        await page.evaluate('new URL(document.querySelector(".camera-exercise img").src).pathname'),
        state.images[1].path,
      );
      assert.equal(await page.evaluate('document.documentElement.scrollWidth>innerWidth'), false);
      await page.capture(`practice-selected-E-lesson-${lesson}-${width}-${theme}`);
      await page.click('Volver a los bloques de vocales');
      assert.equal(
        await page.evaluate('document.querySelectorAll(".vowel-practice-block").length'),
        5,
      );
      assert.equal(await page.evaluate('!!document.querySelector(".camera-exercise")'), false);
      views.push({ lesson, width, theme, ...state, selected: 'E', returned: true });
    }
  }
  results.vowelPractice = { views };
}
