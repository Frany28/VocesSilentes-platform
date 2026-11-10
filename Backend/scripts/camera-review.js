import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createAcademicEnvironment } from './academic/environment.js';
import { createAcademicBrowser } from './academic/browser-session.js';
import { createAcademicDriver } from './academic/browser-driver.js';
import { seedAlphabet } from './learning/seed-alphabet.js';
import { alphabetModuleId } from './learning/alphabet-source.js';
import { reviewCameraViews } from './lsv/review-camera-views.js';
import { reviewCameraJourney } from './lsv/review-camera-journey.js';
import { reviewStudentHandReference } from './lsv/review-student-hand-reference.js';
import { reviewVideoImport } from './lsv/review-video-import.js';
import { join } from 'node:path';

const videoOnly = process.argv.includes('--video');
const output = fileURLToPath(
  new URL(
    videoOnly ? '../../.local/video-import-review/' : '../../.local/camera-review/',
    import.meta.url,
  ),
);
await mkdir(output, { recursive: true });
const environment = await createAcademicEnvironment({
  port: 5286,
  previewModuleId: alphabetModuleId,
});
let browser;
const results = {
  camera: 'Chrome synthetic device; no physical camera',
  detector: 'real MediaPipe 1.1.0',
  views: [],
};
try {
  await seedAlphabet(environment.database);
  const email = 'camera-review@example.invalid';
  const password = 'Camara-local-de-prueba-123!';
  const account = await environment.authService.register({
    firstName: 'Cámara de prueba',
    username: 'camera_review',
    email,
    password,
  });
  await environment.authService.logout(account.token);
  await environment.ready();
  browser = await createAcademicBrowser(output, { fakeCamera: true });
  await browser.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
    window.__cameraReview={calls:0,learningWrites:0,modelRequests:0};
    const acquire=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia=async options=>{
      window.__cameraReview.calls++; const stream=await acquire(options); window.__reviewStream=stream;return stream;};
    const originalFetch=window.fetch.bind(window);
    window.fetch=(input,options={})=>{
      const path=typeof input==='string'?input:input.url;
      if(path.includes('hand-landmarker'))window.__cameraReview.modelRequests++;
      if(path.includes('/learning')&&['POST','PUT','PATCH'].includes(options.method))window.__cameraReview.learningWrites++;
      return originalFetch(input,options);};`,
  });
  const page = createAcademicDriver(browser, environment.origin, output);
  await page.login(email, password);
  const context = { page, browser, results, output };
  if (videoOnly) await reviewVideoImport(context);
  else {
    await reviewCameraViews(context);
    await reviewStudentHandReference(context);
    await reviewCameraJourney(context);
  }
  assert.deepEqual(browser.errors, []);
  assert.equal(await environment.database.exerciseProgress.count(), 0);
  assert.equal(await environment.database.lessonProgress.count(), 0);
  results.completed = true;
  console.log(
    JSON.stringify({
      completed: true,
      views: results.views.length,
      ...results.journey,
      ...results.videoImport,
      physicalCamera: false,
      gradedSignExercises: 0,
    }),
  );
} finally {
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser?.close();
  await environment.close();
}
