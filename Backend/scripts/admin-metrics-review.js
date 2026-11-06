import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createAcademicEnvironment } from './academic/environment.js';
import { createAcademicBrowser } from './academic/browser-session.js';
import { createAcademicDriver } from './academic/browser-driver.js';
import { seedMetrics, seedMetricProgress } from '../tests/auth/metrics.fixture.js';

// Entorno exclusivamente efímero: datos sintéticos de prueba, sin .env ni conexiones a Supabase.
const output = fileURLToPath(new URL('../../.local/admin-metrics-review/', import.meta.url));
await mkdir(output, { recursive: true });
const environment = await createAcademicEnvironment({ port: 5286 });
const results = { source: 'ISOLATED_POSTGRESQL_SYNTHETIC_TEST_ONLY', screens: [] };
let browser;
try {
  const data = await seedMetrics(environment);
  await seedMetricProgress(environment.database, data);
  await environment.ready();
  browser = await createAcademicBrowser(output);
  await browser.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  const page = createAcademicDriver(browser, environment.origin, output);
  await page.login(data.admin.input.email, data.admin.input.password);
  await page.navigate('/admin');
  await page.wait('document.querySelectorAll(".admin-metrics-plot").length===2');
  await page.fill({ Período: 'custom' });
  await page.wait('document.querySelector("input[name=from]")');
  await page.fill({ Desde: '2026-10-01', Hasta: '2026-10-31' });
  await page.click('Aplicar período');
  await page.wait('document.body.textContent.includes("33,33%")');
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['tablet', 834, 1112],
    ['mobile', 375, 812],
  ]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
      const geometry = await page.evaluate(`(()=>({
        overflow:document.documentElement.scrollWidth>innerWidth,
        plots:[...document.querySelectorAll('.admin-metrics-plot')].map(node=>({
          width:node.getBoundingClientRect().width,
          panel:node.parentElement.getBoundingClientRect().width,
          stroke:getComputedStyle(node.querySelector('polyline')).stroke})),
        percentage:document.body.textContent.includes('33,33%')
      }))()`);
      assert.equal(geometry.overflow, false);
      assert.equal(geometry.plots.length, 2);
      assert.ok(
        geometry.plots.every(
          (plot) => plot.width > 0 && plot.width < plot.panel && plot.stroke !== 'none',
        ),
      );
      assert.equal(geometry.percentage, true);
      await page.capture(`metrics-${name}-${theme}`);
      results.screens.push({ name, width, height, theme, ...geometry });
    }
  }
  await environment.database.user.update({
    where: { id: data.disabled.id },
    data: { isActive: true },
  });
  await page.click('Actualizar');
  await page.wait('document.body.textContent.includes("4 habilitadas · 0 deshabilitadas")');
  results.persistedUpdateReflected = true;
  await page.fill({ Desde: '2020-01-01', Hasta: '2020-01-01' });
  await page.click('Aplicar período');
  await page.wait('document.body.textContent.includes("Sin actividad registrada")');
  assert.equal(await page.evaluate('document.body.textContent.includes("No disponible")'), true);
  assert.deepEqual(browser.errors, []);
  results.emptyPeriodVerified = true;
  results.completed = true;
  console.log(
    JSON.stringify({ completed: true, screens: results.screens.length, writesToSharedDatabase: 0 }),
  );
} finally {
  await writeFile(
    new URL('../../.local/admin-metrics-review/browser-results.json', import.meta.url),
    JSON.stringify(results, null, 2),
  );
  await browser?.close();
  await environment.close();
}
