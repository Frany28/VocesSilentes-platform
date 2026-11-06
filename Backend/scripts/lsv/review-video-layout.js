import assert from 'node:assert/strict';

/**
 * Revisa el editor local en escritorio/tablet/móvil y ambos temas, sin afirmar validación de una seña.
 * @param {{page: object, browser: object, results: object}} context Editor con archivo sintético cargado.
 * @returns {Promise<void>} Capturas y ausencia de desbordamiento horizontal.
 */
export async function reviewVideoLayout({ page, browser, results }) {
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
      await page.evaluate(`(()=>{if(document.documentElement.dataset.theme!==${JSON.stringify(theme)})
        document.querySelector('button[aria-label="Cambiar a modo ${theme === 'light' ? 'claro' : 'oscuro'}"]').click();})()`);
      await page.evaluate('new Promise(done=>setTimeout(done,250))');
      assert.ok(await page.evaluate('document.documentElement.scrollWidth<=innerWidth'));
      await page.capture(`video-import-${theme}-${width}`);
      results.views.push({ width, theme, source: 'synthetic local WebM, not LSV' });
    }
  }
}
