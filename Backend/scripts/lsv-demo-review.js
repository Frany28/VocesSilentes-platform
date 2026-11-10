import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHandClip } from './lsv/create-hand-clip.js';
import { createHash } from 'node:crypto';
import { createAcademicEnvironment } from './academic/environment.js';
import { createAcademicBrowser } from './academic/browser-session.js';
import { createAcademicDriver } from './academic/browser-driver.js';
import { reviewDemoLearning } from './lsv/review-demo-learning.js';

const output = resolve('.local/lsv-demo-review', String(Date.now()));
const mirrored = process.argv.includes('--mirror-camera');
await mkdir(output, { recursive: true });
const manifest = JSON.parse(await readFile('datos-entrenamiento/manifest.json', 'utf8'));
const source = manifest.sources.find((item) => item.id === 'video_01');
const file = resolve('datos-entrenamiento', source.file);
assert.equal(
  createHash('sha256')
    .update(await readFile(file))
    .digest('hex'),
  source.sha256,
);
const fakeVideoPath = join(output, 'real-training-replay.y4m');
createHandClip(
  file,
  { startMs: 76000, endMs: 79000 },
  fakeVideoPath,
  mirrored ? 'MIRROR' : 'ORIGINAL',
);
const environment = await createAcademicEnvironment({ port: 5288, productionFrontend: true });
let browser;
let page;
const results = { physicalCamera: false, independentEvaluation: false, accuracy: null };
try {
  const email = 'demo-production@example.invalid';
  const password = 'Production-demo-local-123!';
  const account = await environment.authService.register({
    firstName: 'Prueba producción',
    username: 'demo_production',
    email,
    password,
  });
  await environment.authService.logout(account.token);
  await environment.ready();
  browser = await createAcademicBrowser(output, { fakeCamera: true, fakeVideoPath });
  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
    window.__demoReview={calls:0,learningWrites:0,modelRequests:0};
    const acquire=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia=async options=>{window.__demoReview.calls++;
      return window.__reviewStream=await acquire(options);};
    const originalFetch=window.fetch.bind(window);window.fetch=(input,options={})=>{
      const path=typeof input==='string'?input:input.url;
      if(path.includes('/models/lsv-vowels-demo'))window.__demoReview.modelRequests++;
      if(path.includes('/learning')&&['POST','PUT','PATCH'].includes(options.method))
        window.__demoReview.learningWrites++;return originalFetch(input,options);};`,
  });
  page = createAcademicDriver(browser, environment.origin, output);
  await page.login(email, password);
  results.journey = await reviewDemoLearning({ page, browser, mirrored });
  assert.deepEqual(browser.errors, []);
  assert.equal(await environment.database.exerciseProgress.count(), 0);
  assert.equal(await environment.database.lessonProgress.count(), 0);
  results.completed = true;
  console.log(JSON.stringify(results));
} catch (error) {
  results.error = error.message;
  results.alerts = await page?.evaluate(
    '[...document.querySelectorAll("[role=alert]")].map(n=>n.textContent)',
  );
  await page?.capture('failure');
  throw error;
} finally {
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser?.close();
  await environment.close();
}
