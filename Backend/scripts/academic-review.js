import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createAcademicEnvironment } from './academic/environment.js';
import { createAcademicBrowser } from './academic/browser-session.js';
import { createAcademicDriver } from './academic/browser-driver.js';
import { reviewAcademicUsers } from './academic/review-users.js';
import { reviewAcademicReports } from './academic/review-reports.js';
import { reviewAcademicLearning } from './academic/review-learning.js';
import { reviewAcademicAudit } from './academic/review-audit.js';
import { reviewAcademicResponsive } from './academic/review-responsive.js';

// No carga el seed: todas las cuentas y reportes evaluados se crean mediante los formularios.
const output = fileURLToPath(new URL('../../.local/module-ii-review/', import.meta.url));
await mkdir(output, { recursive: true });
const environment = await createAcademicEnvironment({ port: 5281 });
let browser;
const results = { database: 'isolated-PostgreSQL-WASM-over-TCP', independentFromSeed: true };
try {
  await environment.ready();
  const password = `Prueba UI ${randomBytes(24).toString('base64url')}!`;
  const adminEmail = 'academic_operator@example.invalid';
  // Provisionamiento inicial del operador, separado de las cinco altas de usuarios bajo prueba.
  const operator = await environment.authService.register({
    firstName: 'Operador de prueba',
    username: 'academic_operator',
    email: adminEmail,
    password,
  });
  await environment.database.user.update({
    where: { id: operator.user.id },
    data: { role: 'ADMIN' },
  });
  browser = await createAcademicBrowser(output);
  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__academicCameraCalls=0;
    if(navigator.mediaDevices) navigator.mediaDevices.getUserMedia=()=>{
      window.__academicCameraCalls++;return Promise.reject(new Error('Cámara excluida de esta prueba'));};`,
  });
  const page = createAcademicDriver(browser, environment.origin, output);
  results.captures = page.captures;
  results.inputImage = 'evidencia-academica.png';
  const context = { ...environment, page, browser, output, password, adminEmail, results };
  await page.login(adminEmail, password);
  const users = await reviewAcademicUsers(context);
  const reports = await reviewAcademicReports(context, users[0]);
  await reviewAcademicLearning(context, users[0]);
  await page.login(adminEmail, password);
  await reviewAcademicAudit(context);
  await reviewAcademicResponsive(context, reports, users[0]);
  assert.deepEqual(browser.errors, []);
  results.completed = true;
  console.log(
    JSON.stringify({
      completed: true,
      users: 5,
      reports: 5,
      localImages: 5,
      auditedEvents: results.audit.count,
      screens: results.responsive.length,
      storage: 'test-adapter-not-S3',
      runtimeErrors: browser.errors.length,
    }),
  );
} catch (error) {
  if (browser) {
    const diagnostic = await browser
      .send('Runtime.evaluate', {
        expression: `({path:location.pathname,headings:[...document.querySelectorAll('h1,h2')].map(n=>n.textContent),
        alerts:[...document.querySelectorAll('[role=alert]')].map(n=>n.textContent)})`,
        returnByValue: true,
      })
      .catch(() => null);
    results.failure = diagnostic?.result?.value;
  }
  throw error;
} finally {
  await writeFile(resolve(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  await browser?.close();
  await environment.close();
}
