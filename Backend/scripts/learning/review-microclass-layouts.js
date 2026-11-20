import assert from 'node:assert/strict';

/**
 * Revisa la clase original en Introducción, Vocales y la guía, sin añadir recursos ni iniciar audio.
 * @param {{page: object, browser: object, moduleId: string, results: object}} context Entorno local aislado.
 * @returns {Promise<void>} Dieciocho vistas con ancho legible, capítulos, transcripción y controles.
 */
export async function reviewMicroclassLayouts({ page, browser, moduleId, results }) {
  const views = [];
  for (const width of [1440, 834, 390]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 968,
      deviceScaleFactor: 1,
      mobile: false,
    });
    for (const theme of ['light', 'dark']) {
      for (const lesson of [1, 2, 'guide']) {
        await page.navigate(`/student/modules/${moduleId}`);
        await page.wait('document.querySelector("ol[aria-label=\\"Lecciones del módulo\\"]")');
        if (lesson === 'guide') await page.click('Comenzar módulo de vocales');
        else
          await page.evaluate(`(()=>{
          const row=document.querySelector('ol[aria-label="Lecciones del módulo"]').children[${lesson - 1}];
          [...row.querySelectorAll('a')].find(a=>a.textContent.trim()==='Ver microclase de las vocales').click();
        })()`);
        await page.wait('document.querySelector(".mc-stage")');
        await page.evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
        await page.evaluate('document.fonts.ready');
        await page.evaluate(`Promise.all(document.getAnimations().filter(a=>
          a.playState==='running'&&a.effect?.getComputedTiming().iterations!==Infinity)
          .map(a=>a.finished.catch(()=>{})))`);
        const state = await page.evaluate(`(()=>{
          const stage=document.querySelector('.mc-stage').getBoundingClientRect();
          const wrapper=document.querySelector('.journey-video-lesson');
          return {path:location.pathname,stageWidth:stage.width,stageHeight:stage.height,
            padding:getComputedStyle(wrapper).padding,overflow:document.documentElement.scrollWidth>innerWidth,
            chapters:document.querySelectorAll('.mc-chapters button').length,
            transcript:[...document.querySelectorAll('summary')].some(n=>n.textContent==='Transcripción completa'),
            controls:!!document.querySelector('.mc-controls'),camera:window.__alphabetCameraCalls};})()`);
        assert.ok(state.stageWidth > (width >= 1200 ? 700 : width - 130));
        assert.ok(state.stageHeight > 200);
        assert.equal(state.padding, '0px');
        assert.equal(state.overflow, false);
        assert.ok(state.chapters >= 7 && state.transcript && state.controls);
        assert.equal(state.camera, 0);
        await page.capture(`restored-microclass-${lesson}-${width}-${theme}`);
        views.push({ lesson, width, theme, ...state });
      }
    }
  }
  results.microclassLayouts = views;
}
