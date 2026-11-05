import assert from 'node:assert/strict';
import { alphabetId } from './alphabet-source.js';

/**
 * Revisa los siete accesos directos en ambos temas y tres tamaños con el modo enfocado real.
 * @param {{page: object, browser: object, source: object, results: object, moduleId: string}} context Entorno aislado.
 * @returns {Promise<void>} Comprueba 42 introducciones, tokens, recursos, navegación y geometría.
 */
export async function reviewAlphabetLayout({ page, browser, source, results, moduleId }) {
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
    for (const theme of ['light', 'dark']) {
      for (const lesson of source.lessons) {
        await page.navigate(`/student/modules/${moduleId}/lessons/${alphabetId(lesson.id)}`);
        await page.wait('document.querySelector("#curriculum-objectives")');
        await page.evaluate(`(()=>{if(document.documentElement.dataset.theme!==${JSON.stringify(theme)})
          document.querySelector('button[aria-label="Cambiar a modo ${theme === 'light' ? 'claro' : 'oscuro'}"]').click();})()`);
        await page.evaluate('new Promise(done=>setTimeout(done,250))');
        const state = await page.evaluate(`(()=>({
          width:innerWidth,document:document.documentElement.scrollWidth,
          sidebar:!!document.querySelector('.student-sidebar,.student-bottom'),
          font:getComputedStyle(document.querySelector('.education-page')).fontFamily,
          camera:window.__alphabetCameraCalls,media:document.querySelectorAll('video,iframe').length,
          steps:document.querySelectorAll('.journey-stage').length,
          percent:document.querySelector('[role=progressbar]').getAttribute('aria-valuenow'),
          preview:document.body.textContent.includes('Vista previa local · Borrador')}))()`);
        assert.ok(state.document <= width);
        assert.equal(state.sidebar, false);
        assert.match(state.font, /Manrope/);
        assert.equal(state.steps, 1);
        assert.equal(state.percent, '0');
        assert.equal(state.preview, true);
        assert.equal(state.camera, 0);
        assert.equal(state.media, 0);
        await page.capture(`${lesson.id}-${theme}-${width}-intro`);
        results.screens.push({ lesson: lesson.id, theme, ...state });
      }
    }
  }
}
