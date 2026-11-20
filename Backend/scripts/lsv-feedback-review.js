import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { createHandClip } from './lsv/create-hand-clip.js';
import { createAcademicEnvironment } from './academic/environment.js';
import { createAcademicBrowser } from './academic/browser-session.js';
import { createAcademicDriver } from './academic/browser-driver.js';
import { reviewFeedbackCase } from './lsv/review-feedback-case.js';

const output = resolve('.local/lsv-feedback-review', String(Date.now()));
await mkdir(output, { recursive: true });
const manifest = JSON.parse(await readFile('datos-entrenamiento/manifest.json', 'utf8'));
const source = manifest.sources.find((item) => item.id === 'video_01');
const video = resolve('datos-entrenamiento', source.file);
assert.equal(
  createHash('sha256')
    .update(await readFile(video))
    .digest('hex'),
  source.sha256,
);
const results = { physicalCamera: false, independentEvaluation: false, accuracy: null, cases: [] };
const environment = await createAcademicEnvironment({ port: 5296, productionFrontend: true });
let browser;
try {
  await environment.ready();
  for (const letter of 'AEIOU') {
    const segment = manifest.candidates.find(
      (item) => item.videoId === source.id && item.label === letter,
    );
    assert.ok(segment);
    for (const hand of ['Right', 'Left']) {
      const identity = `feedback_${letter}_${hand}`.toLowerCase();
      const email = `${identity}@example.invalid`;
      const password = 'Feedback-local-review-123!';
      await environment.authService.register({
        firstName: 'Revisión local',
        username: identity,
        email,
        password,
      });
      const clip = join(output, `${letter}-${hand}.y4m`);
      createHandClip(video, segment, clip, hand === 'Left' ? 'MIRROR' : 'ORIGINAL');
      browser = await createAcademicBrowser(output, { fakeCamera: true, fakeVideoPath: clip });
      await browser.send('Page.addScriptToEvaluateOnNewDocument', {
        source: `
        window.__feedbackReview={cameraCalls:0,writes:0};
        const acquire=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia=async options=>{window.__feedbackReview.cameraCalls++;
          return window.__feedbackStream=await acquire(options);};
        const request=window.fetch.bind(window);window.fetch=(input,options={})=>{
          const path=typeof input==='string'?input:input.url;
          if(path.includes('/learning')&&['POST','PUT','PATCH'].includes(options.method))window.__feedbackReview.writes++;
          return request(input,options);};`,
      });
      const page = createAcademicDriver(browser, environment.origin, output);
      await page.login(email, password);
      results.cases.push(await reviewFeedbackCase({ page, browser, letter, hand }));
      assert.deepEqual(browser.errors, []);
      await browser.close();
      browser = null;
    }
  }
  assert.equal(await environment.database.exerciseProgress.count(), 0);
  assert.equal(await environment.database.lessonProgress.count(), 0);
  results.completed = true;
  console.log(
    JSON.stringify({
      completed: true,
      cases: results.cases.map(({ letter, hand, feedback, candidate }) => ({
        letter,
        hand,
        feedback,
        candidate,
      })),
      academicWrites: 0,
    }),
  );
} finally {
  await writeFile(join(output, 'results.json'), JSON.stringify(results, null, 2));
  await browser?.close();
  await environment.close();
}
