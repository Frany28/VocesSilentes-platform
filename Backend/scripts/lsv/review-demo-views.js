import assert from 'node:assert/strict';

/**
 * Comprueba referencias automáticas y texto legible en producción, en ambos temas y tres tamaños.
 * @param {{page: object, browser: object, mirrored: boolean, outcome?: string}} context Navegador y resultado esperado.
 * @returns {Promise<object[]>} Evidencia responsive y orden educativo, sin desbordamiento ni selectores de mano.
 */
export async function reviewDemoViews({ page, browser, mirrored, outcome = 'retry' }) {
  const views = [];
  for (const width of [1440, 834, 390, 320]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 968,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
      await page.evaluate('new Promise(done=>setTimeout(done,250))');
      assert.ok(await page.evaluate('document.documentElement.scrollWidth<=innerWidth'));
      assert.equal(
        await page.evaluate('Boolean(document.querySelector(".manual-reference [data-mirrored]"))'),
        mirrored,
      );
      assert.equal(
        await page.evaluate('document.querySelectorAll(".camera-exercise select").length'),
        0,
      );
      assert.equal(
        await page.evaluate(
          'getComputedStyle(document.querySelector(".manual-hand-letter")).transform',
        ),
        'none',
      );
      const layout = await page.evaluate(`(()=>{
        const rect=selector=>document.querySelector(selector).getBoundingClientRect();
        const reference=rect('.practice-reference'),live=rect('.practice-live'),feedback=rect('.practice-feedback');
        return {stacked:reference.bottom<=live.top+1,feedbackBelowCamera:feedback.top>=live.bottom,
          desktopAside:reference.left>=live.right,feedbackGap:feedback.top-live.bottom,
          viewport:rect('.camera-viewport').width,liveWidth:live.width};})()`);
      assert.equal(width < 1100 ? layout.stacked : layout.desktopAside, true);
      assert.equal(layout.feedbackBelowCamera, true);
      assert.ok(layout.feedbackGap < 32);
      assert.ok(layout.viewport <= layout.liveWidth + 1);
      assert.equal(
        await page.evaluate('document.querySelector(".practice-result").dataset.outcome'),
        outcome,
      );
      assert.ok(
        await page.evaluate(`!document.querySelector('.camera-exercise').innerText
        .match(/experimental|no califica|frames reales|inferencia:/i)`),
      );
      await page.capture(
        `learning-vowels-production-${mirrored ? 'left' : 'right'}-${outcome}-${width}-${theme}`,
      );
      views.push({ width, theme, outcome, labelUnmirrored: true, ...layout });
    }
  }
  return views;
}
