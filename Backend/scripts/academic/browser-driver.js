import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { waitForAcademic } from './browser-session.js';

/**
 * Interactúa con formularios React reales por CDP y guarda solo evidencias de cuentas sintéticas.
 * @param {object} browser Sesión aislada.
 * @param {string} origin Vite local de la prueba.
 * @param {string} output Directorio de capturas y resultados.
 * @returns {object} Navegación, interacción, captura y lecturas DOM; no sustituye fetch de la aplicación.
 */
export function createAcademicDriver(browser, origin, output) {
  const evaluate = async (expression) => {
    const response = await browser.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (response.exceptionDetails) throw new Error('Falló la interacción con un formulario de prueba');
    return response.result.value;
  };
  const wait = (expression) => waitForAcademic(() => evaluate(`Boolean(${expression})`));
  return {
    evaluate, wait,
    async navigate(path) {
      await evaluate('window.__academicOldPage=true');
      await browser.send('Page.navigate', { url: origin + path });
      await wait('!window.__academicOldPage && document.querySelector("main")');
      await evaluate('document.fonts.ready');
    },
    fill: (values) => evaluate(`(()=>{for(const [label,value] of Object.entries(${JSON.stringify(values)})){
      const owner=[...document.querySelectorAll('label')].find(n=>n.textContent.trim()===label);
      const node=owner?document.getElementById(owner.htmlFor):document.querySelector('[name="'+label+'"]');
      if(!node)throw new Error('Campo ausente');
      const prototype=node.tagName==='SELECT'?HTMLSelectElement.prototype:
        node.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
      node.focus();Object.getOwnPropertyDescriptor(prototype,'value').set.call(node,value);
      node.dispatchEvent(new Event('input',{bubbles:true}));node.dispatchEvent(new Event('change',{bubbles:true}));
    }})()`),
    click: (text) => evaluate(`(()=>{const node=[...document.querySelectorAll('button,a,summary')]
      .find(n=>n.textContent.trim()===${JSON.stringify(text)}&&!n.disabled);
      if(!node)throw new Error('Acción ausente');node.focus();node.click();})()`),
    async file(selector, path) {
      await browser.send('DOM.enable');
      const { root } = await browser.send('DOM.getDocument');
      const { nodeId } = await browser.send('DOM.querySelector', { nodeId: root.nodeId, selector });
      await browser.send('DOM.setFileInputFiles', { nodeId, files: [path] });
    },
    async capture(name) {
      await evaluate('new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)))');
      const { data } = await browser.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      await writeFile(resolve(output, `${name}.png`), Buffer.from(data, 'base64'));
    },
    async login(email, password) {
      await this.navigate('/login');
      await wait('document.querySelector("#login-email")');
      await this.fill({ email, password });
      await this.click('Iniciar sesión');
      await wait('document.querySelector(".student-shell,.admin-shell")');
    },
  };
}
