import assert from 'node:assert/strict';
import { alphabetId } from './alphabet-source.js';

/**
 * Revisa seis estados del cuestionario real en ambos temas y los tres tamaños del diseño.
 * @param {{page: object, browser: object, source: object, results: object, moduleId: string}} context Entorno local.
 * @returns {Promise<void>} Capturas de selección, feedback, pendiente y resumen sin desbordamiento.
 */
export async function reviewAlphabetAssessment({ page, browser, source, results, moduleId }) {
  const question = source.exercises.find((item) => item.type === 'MULTIPLE_CHOICE_TEXT');
  const wrong = question.options.find((option) => option.id !== question.correctOptionId).id;
  results.assessmentScreens = [];
  for (const [width, height] of [
    [1440, 968],
    [834, 1108],
    [390, 1032],
  ]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    for (const theme of ['light', 'dark']) {
      const capture = async (state) => {
        await page.evaluate('window.scrollTo(0,0)');
        await page.evaluate('new Promise(done=>setTimeout(done,250))');
        assert.ok(await page.evaluate('document.documentElement.scrollWidth <= innerWidth'));
        await page.capture(`assessment-${state}-${theme}-${width}`);
        results.assessmentScreens.push({ state, theme, width });
      };
      await page.navigate(`/student/modules/${moduleId}/lessons/${alphabetId(question.lessonKey)}`);
      await page.wait('document.querySelector("#curriculum-objectives")');
      await page.evaluate(`(()=>{if(document.documentElement.dataset.theme!==${JSON.stringify(theme)})
        document.querySelector('button[aria-label="Cambiar a modo ${theme === 'light' ? 'claro' : 'oscuro'}"]').click();})()`);
      await page.click('Ir a los ejercicios');
      await page.wait('document.querySelector(".education-options input")');
      assert.equal(
        await page.evaluate('document.querySelector("button[type=submit]").disabled'),
        true,
      );
      await capture('unselected');
      await page.evaluate(
        `document.querySelector('.education-options input[value="${wrong}"]').click()`,
      );
      await page.wait(
        'document.querySelector(".education-options input:checked") && !document.querySelector("button[type=submit]").disabled',
      );
      await capture('selected');
      await page.click('Comprobar respuesta');
      await page.wait('document.querySelector(".education-feedback[role=alert]")');
      await capture('incorrect');
      await page.click('Reintentar pregunta');
      await page.evaluate(
        `document.querySelector('.education-options input[value="${question.correctOptionId}"]').click()`,
      );
      await page.click('Comprobar respuesta');
      await page.wait('document.querySelector(".education-feedback[role=status]")');
      await capture('correct');
      await page.navigate(`/student/modules/${moduleId}/lessons/${alphabetId('m1-l02')}`);
      await page.wait('document.querySelector("#curriculum-objectives")');
      await page.click('Ir a los ejercicios');
      await page.wait('document.querySelector("#pending-question")');
      await capture('pending');
      for (let index = 0; index < 5; index += 1) await page.click('Ver siguiente pregunta');
      await page.wait('document.querySelector(".education-result-progress")');
      await capture('summary');
    }
  }
}
