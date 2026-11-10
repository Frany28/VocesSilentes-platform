import assert from 'node:assert/strict';

/**
 * Comprueba referencias automáticas y texto legible en producción, en ambos temas y tres tamaños.
 * @param {{page: object, browser: object, mirrored: boolean}} context Navegador productivo y tipo de replay.
 * @returns {Promise<object[]>} Evidencia de seis vistas sin desbordamiento ni selectores de mano.
 */
export async function reviewDemoViews({ page, browser, mirrored }) {
  const views = [];
  for (const width of [1440, 390, 320]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 968,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
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
      await page.capture(
        `learning-vowels-production-${mirrored ? 'left' : 'right'}-${width}-${theme}`,
      );
      views.push({ width, theme, labelUnmirrored: true });
    }
  }
  return views;
}
