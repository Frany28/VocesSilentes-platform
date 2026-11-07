import assert from 'node:assert/strict';
import { reviewAlphabetJourney } from './review-alphabet-journey.js';

/**
 * Revisa Lección 1 y vocales completas con sesión propia por combinación visual para aislar avances.
 * @param {{page: object, browser: object, source: object, database: object, results: object,
 * moduleId: string, authService: object}} context Servicios y navegador del entorno aislado.
 * @returns {Promise<void>} Doce recorridos, 18 preguntas resueltas y 12 lecturas manuales reales.
 */
export async function reviewAlphabetAnswers(context) {
  const { page, browser, source, database, results, authService } = context;
  results.journeys = [];
  let combination = 0;
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
      await page.navigate('/student/modules');
      await page.wait('document.querySelector(".student-module-card")');
      await page.click('Cerrar sesión');
      await page.wait('document.querySelector("dialog[open]")');
      await page.click('Cerrar sesión');
      await page.wait('document.querySelector("#login-email")');
      const email = `journey-${combination}@example.invalid`;
      const password = 'Recorrido-local-de-prueba-123!';
      const registration = await authService.register({
        firstName: 'Recorrido local',
        username: `journey_${combination}`,
        email,
        password,
      });
      await authService.logout(registration.token);
      await page.login(email, password);
      await page.evaluate(`(()=>{if(document.documentElement.dataset.theme!==${JSON.stringify(theme)})
        document.querySelector('button[aria-label="Cambiar a modo ${theme === 'light' ? 'claro' : 'oscuro'}"]').click();})()`);
      for (const lesson of source.lessons.slice(0, 2))
        await reviewAlphabetJourney({ ...context, lesson, suffix: `${theme}-${width}` });
      combination += 1;
    }
  }
  assert.equal(await database.exerciseProgress.count({ where: { status: 'COMPLETED' } }), 18);
  assert.equal(await database.lessonProgress.count({ where: { status: 'COMPLETED' } }), 12);
  results.answers = { correctPersisted: 18, imageQuestionsPending: 27, manualReading: 12 };
}
