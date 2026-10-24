import assert from 'node:assert/strict';

/**
 * Comprueba temas y geometría de las vistas integradas sin activar cámara ni alterar tokens.
 * @param {object} context Entorno de prueba con navegador y usuarios sintéticos.
 * @param {object[]} reports Reportes creados mediante formulario.
 * @param {object} student Usuario creado mediante formulario.
 * @returns {Promise<void>} Registra combinaciones y capturas; no acredita otros navegadores.
 */
export async function reviewAcademicResponsive(context, reports, student) {
  const { page, browser, adminEmail, password, results } = context;
  const screens = [];
  for (const role of ['ADMIN', 'USER']) {
    await page.login(role === 'ADMIN' ? adminEmail : student.email, password);
    const paths =
      role === 'ADMIN'
        ? ['/admin/audit', `/admin/reports/${reports[0].id}`, '/admin/users/new']
        : ['/student/practice', '/student/progress'];
    for (const path of paths) {
      for (const [width, height] of [
        [1440, 960],
        [834, 1100],
        [390, 920],
        [320, 620],
      ]) {
        await browser.send('Emulation.setDeviceMetricsOverride', {
          width,
          height,
          deviceScaleFactor: 1,
          mobile: false,
        });
        await page.navigate(path);
        await page.wait(
          '!document.querySelector("main [aria-busy=true]") && document.querySelector("main h1")',
        );
        for (const theme of ['light', 'dark']) {
          await page.evaluate(`document.documentElement.dataset.theme=${JSON.stringify(theme)}`);
          const metrics =
            await page.evaluate(`(()=>({overflow:document.documentElement.scrollWidth>innerWidth,
            cameraCalls:window.__academicCameraCalls||0,
            dialogs:[...document.querySelectorAll('dialog[open]')].map(n=>{const r=n.getBoundingClientRect();return {x:r.x,right:r.right,y:r.y,bottom:r.bottom};})}))()`);
          assert.equal(metrics.overflow, false, `${path} ${width} ${theme}`);
          assert.equal(metrics.cameraCalls, 0);
          assert.ok(
            metrics.dialogs.every(
              (r) => r.x >= 0 && r.right <= width && r.y >= 0 && r.bottom <= height,
            ),
          );
          screens.push({ path, width, height, theme, ...metrics });
          if (width === 390)
            await page.capture(`${role}-${path.split('/').pop()}-${theme}-${width}`);
        }
      }
    }
  }
  results.responsive = screens;
}
