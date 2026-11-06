import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createAcademicEnvironment } from './academic/environment.js';
import { createAcademicBrowser } from './academic/browser-session.js';
import { createAcademicDriver } from './academic/browser-driver.js';
import { reviewRealExtraction } from './lsv/review-real-extraction.js';
import { reviewExperimentalJourney } from './lsv/review-experimental-journey.js';

// Requiere los nueve ejemplos reales confirmados; nunca los sustituye por fixtures sintéticos.
const output = resolve('.local/lsv-experimental-review', String(Date.now()));
await mkdir(output, { recursive: true });
const training = spawnSync(
  process.execPath,
  [
    'Backend/scripts/train-lsv-experimental.js',
    '.local/lsv-experimental/experimental-samples.json',
    '--output',
    output,
  ],
  { encoding: 'utf8', windowsHide: true },
);
assert.equal(training.status, 0, training.stderr);
const model = JSON.parse(await readFile(join(output, 'lsv-experimental-model.json'), 'utf8'));
const extraction = await reviewRealExtraction(output, model);
const fakeVideoPath = join(output, 'real-training-replay.y4m');
const clip = spawnSync(
  'ffmpeg',
  [
    '-hide_banner',
    '-loglevel',
    'error',
    '-ss',
    String(extraction.candidate.startMs / 1000),
    '-i',
    extraction.file,
    '-t',
    String((extraction.candidate.endMs - extraction.candidate.startMs) / 1000),
    '-an',
    '-pix_fmt',
    'yuv420p',
    '-f',
    'yuv4mpegpipe',
    fakeVideoPath,
  ],
  { encoding: 'utf8', windowsHide: true },
);
assert.equal(clip.status, 0, 'No se pudo generar la reproducción privada Y4M');
const environment = await createAcademicEnvironment({ port: 5287 });
let browser;
let page;
const results = {
  physicalCamera: false,
  independentEvaluation: false,
  accuracy: null,
  extraction: { observations: extraction.observations, prediction: extraction.prediction },
};
try {
  const email = 'experimental-review@example.invalid';
  const password = 'Local experimental review 123!';
  const account = await environment.authService.register({
    firstName: 'Revisión local',
    username: 'experimental_review',
    email,
    password,
  });
  await environment.authService.logout(account.token);
  await environment.ready();
  browser = await createAcademicBrowser(output, { fakeCamera: true, fakeVideoPath });
  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
    window.__cameraReview={calls:0,learningWrites:0};
    const acquire=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia=async options=>{window.__cameraReview.calls++;
      return window.__reviewStream=await acquire(options);};
    const originalFetch=window.fetch.bind(window);window.fetch=(input,options={})=>{
      const path=typeof input==='string'?input:input.url;
      if(path.includes('/learning')&&['POST','PUT','PATCH'].includes(options.method))
        window.__cameraReview.learningWrites++;return originalFetch(input,options);};`,
  });
  page = createAcademicDriver(browser, environment.origin, output);
  await page.login(email, password);
  results.journey = await reviewExperimentalJourney({ page, browser, output });
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
