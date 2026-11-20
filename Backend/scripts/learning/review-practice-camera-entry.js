import assert from 'node:assert/strict';

/**
 * Verifica la entrada voluntaria a E y el retorno a A/E sin solicitar permiso de cámara.
 * @param {{page: object, lesson: number, width: number, theme: string, images: object[]}} context Vista local.
 * @returns {Promise<void>} Comprueba imagen compartida, geometría y desmontaje del componente de cámara.
 */
export async function reviewPracticeCameraEntry({ page, lesson, width, theme, images }) {
  await page.click('Practicar E con cámara');
  await page.wait(
    'document.querySelector(".camera-exercise h2")?.textContent==="Practica la letra E"',
  );
  await page.wait('document.querySelector(".camera-exercise img")?.naturalWidth>0');
  assert.equal(await page.evaluate('window.__alphabetCameraCalls'), 0);
  assert.equal(
    await page.evaluate('new URL(document.querySelector(".camera-exercise img").src).pathname'),
    images[1].path,
  );
  assert.equal(await page.evaluate('document.documentElement.scrollWidth>innerWidth'), false);
  await page.capture(`practice-selected-E-lesson-${lesson}-${width}-${theme}`);
  await page.click('Volver a los bloques de vocales');
  assert.equal(await page.evaluate('document.querySelectorAll(".vowel-practice-block").length'), 2);
  assert.equal(await page.evaluate('!!document.querySelector(".camera-exercise")'), false);
}
