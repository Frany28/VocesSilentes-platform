import assert from 'node:assert/strict';
import { alphabetId } from './alphabet-source.js';

/**
 * Revisa las siete lecciones reales en temas y tamaños existentes, sin descargar material del manual.
 * @param {{page: object, browser: object, source: object, results: object, moduleId: string}} context Entorno aislado.
 * @returns {Promise<void>} Registra 42 composiciones con geometría, tarjetas y referencia pendiente.
 */
export async function reviewAlphabetLayout({ page, browser, source, results, moduleId }) {
  for (const [width, height] of [
    [1440, 968],
    [834, 1108],
    [390, 1032],
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
          document.querySelector('button[aria-label="Cambiar a modo ${theme === 'light' ? 'claro' : 'oscuro'}"]').click();
          window.scrollTo(0,0);})()`);
        await page.evaluate('new Promise(done=>setTimeout(done,250))');
        const state = await page.evaluate(`(()=>{
          const visible=n=>n&&getComputedStyle(n).display!=='none'&&n.getBoundingClientRect().width>0;
          return {viewport:innerWidth,document:document.documentElement.scrollWidth,
            cards:document.querySelectorAll('.alphabet-card-grid article').length,
            sidebar:visible(document.querySelector('.student-sidebar')),
            bottom:visible(document.querySelector('.student-bottom')),
            font:getComputedStyle(document.querySelector('.education-page')).fontFamily,
            camera:window.__alphabetCameraCalls,media:document.querySelectorAll('video,iframe').length,
            images:document.querySelectorAll('.alphabet-card-grid img').length,
            preview:document.body.textContent.includes('Vista previa local · Borrador')};})()`);
        assert.equal(
          state.cards,
          source.letterCards.filter((card) => card.lessonKey === lesson.id).length,
        );
        assert.ok(state.document <= width);
        assert.equal(state.sidebar, width >= 600);
        assert.equal(state.bottom, width < 600);
        assert.match(state.font, /Manrope/);
        assert.equal(state.preview, true);
        assert.equal(state.camera, 0);
        assert.equal(state.media, 0);
        assert.equal(state.images, 0);
        await page.capture(`${lesson.id}-${theme}-${width}`);
        results.screens.push({ lesson: lesson.id, width, theme, ...state });
      }
    }
  }
}
