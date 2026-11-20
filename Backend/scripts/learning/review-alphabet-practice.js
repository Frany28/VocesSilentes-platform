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
      const groups = [['A', 'E'], ['I', 'O'], ['U']];
      for (const [group, expected] of groups.entries()) {
        await page.wait(
          `document.querySelectorAll(".vowel-practice-block img").length===${expected.length}&&` +
            '[...document.querySelectorAll(".vowel-practice-block img")].every(img=>img.naturalWidth>0)',
        );
        await page.wait(
          '[...document.querySelectorAll(".letter-card")].every(node=>getComputedStyle(node).opacity==="1")',
        );
        const state = await page.evaluate(`(()=>({
        letters:[...document.querySelectorAll('.vowel-practice-block')].map(node=>node.dataset.letter),
        images:[...document.querySelectorAll('.vowel-practice-block img')].map(img=>({
          path:new URL(img.src).pathname,width:img.naturalWidth,height:img.naturalHeight})),
        overflow:document.documentElement.scrollWidth>innerWidth,
        camera:window.__alphabetCameraCalls,
        loadedCamera:!!document.querySelector('.camera-exercise'),
        position:document.querySelector('.learning-journey').dataset.position}))()`);
        assert.deepEqual(state.letters, expected);
        assert.equal(state.overflow, false);
        assert.equal(state.camera, 0);
        assert.equal(state.loadedCamera, false);
        assert.equal(state.position, group === 0 ? 'practice' : `practice-${expected.join('')}`);
        for (const image of state.images) {
          assert.match(image.path, /ficha-[a-f0-9]{12}\.webp$/);
          assert.ok(image.width >= 720 && image.height === image.width);
        }
        await page.capture(`practice-pair-${expected.join('')}-lesson-${lesson}-${width}-${theme}`);
        if (group === 0) {
          await page.click('Practicar E con cámara');
          await page.wait(
            'document.querySelector(".camera-exercise h2")?.textContent==="Practica la letra E"',
          );
          await page.wait('document.querySelector(".camera-exercise img")?.naturalWidth>0');
          assert.equal(await page.evaluate('window.__alphabetCameraCalls'), 0);
          assert.equal(
            await page.evaluate(
              'new URL(document.querySelector(".camera-exercise img").src).pathname',
            ),
            state.images[1].path,
          );
          assert.equal(
            await page.evaluate('document.documentElement.scrollWidth>innerWidth'),
            false,
          );
          await page.capture(`practice-selected-E-lesson-${lesson}-${width}-${theme}`);
          await page.click('Volver a los bloques de vocales');
          assert.equal(
            await page.evaluate('document.querySelectorAll(".vowel-practice-block").length'),
            2,
          );
          assert.equal(await page.evaluate('!!document.querySelector(".camera-exercise")'), false);
        }
        if (group === 1) {
          await page.click('Volver');
          assert.equal(
            await page.evaluate('document.querySelector(".learning-journey").dataset.position'),
            'practice',
          );
          await page.click('Continuar');
          await page.navigate(await page.evaluate('location.pathname'));
          await page.wait(
            'document.querySelector(".learning-journey")?.dataset.position==="practice-IO"',
          );
        }
        views.push({ lesson, width, theme, ...state, paired: true, reload: group === 1 });
        if (group < groups.length - 1) await page.click('Continuar');
      }
    }
  }
  results.vowelPractice = { views };
}
