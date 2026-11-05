import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createAcademicEnvironment } from '../academic/environment.js';
import { createAcademicBrowser } from '../academic/browser-session.js';
import { createAcademicDriver } from '../academic/browser-driver.js';
import { seedAlphabet } from './seed-alphabet.js';
import { alphabetModuleId, alphabetId, readAlphabetSource } from './alphabet-source.js';
import { reviewAlphabetLayout } from './review-alphabet-layout.js';
import { reviewAlphabetAnswers } from './review-alphabet-answers.js';
import { reviewAlphabetAssessment } from './review-alphabet-assessment.js';

const output = fileURLToPath(new URL('../../../.local/alphabet-review/', import.meta.url));
await mkdir(output, { recursive: true });
const environment = await createAcademicEnvironment({
  port: 5284,
  previewModuleId: alphabetModuleId,
});
let browser;
const results = { database: 'isolated-PostgreSQL-WASM', screens: [] };
try {
  assert.equal((await seedAlphabet(environment.database)).created, true);
  assert.equal((await seedAlphabet(environment.database)).created, false);
  const source = await readAlphabetSource();
  // Credenciales públicas solo en memoria, ajenas a cuentas reales.
  const email = 'alphabet-review@example.invalid';
  const password = 'Alfabeto de prueba local 123!';
  await environment.authService.register({
    firstName: 'Revisión local',
    username: 'alphabet_review',
    email,
    password,
  });
  await environment.ready();
  browser = await createAcademicBrowser(output);
  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `window.__alphabetCameraCalls=0;
    if(navigator.mediaDevices)navigator.mediaDevices.getUserMedia=()=>{
      window.__alphabetCameraCalls++;return Promise.reject(new Error('Cámara excluida'));};`,
  });
  const page = createAcademicDriver(browser, environment.origin, output);
  await page.login(email, password);
  await page.navigate('/student/modules');
  await page.wait('document.querySelector(".student-module-card")');
  await page.click('Explorar módulo');
  await page.wait('document.querySelector("#curriculum-objectives")');
  assert.equal(
    await page.evaluate('location.pathname'),
    `/student/modules/${alphabetModuleId}/lessons/${alphabetId('m1-l01')}`,
  );
  const context = {
    page,
    browser,
    source,
    database: environment.database,
    results,
    moduleId: alphabetModuleId,
  };
  await reviewAlphabetLayout(context);
  await reviewAlphabetAnswers(context);
  await reviewAlphabetAssessment(context);
  await page.navigate(`/student/modules/${alphabetModuleId}/lessons/${alphabetId('m1-l01')}`);
  await page.wait('document.body.textContent.includes("Lectura registrada")');
  assert.deepEqual(browser.errors, []);
  assert.equal(
    await environment.database.module.count({ where: { publicationStatus: 'DRAFT' } }),
    1,
  );
  assert.equal(
    await environment.database.lesson.count({ where: { publicationStatus: 'DRAFT' } }),
    7,
  );
  results.completed = true;
  console.log(
    JSON.stringify({
      completed: true,
      screens: results.screens.length,
      assessmentScreens: results.assessmentScreens.length,
      ...results.answers,
    }),
  );
} finally {
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser?.close();
  await environment.close();
}
