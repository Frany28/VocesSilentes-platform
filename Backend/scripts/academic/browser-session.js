import { spawn } from 'node:child_process';
import { access, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * Espera una condición local con plazo, sin ocultar un fallo definitivo como éxito.
 * @param {Function} condition Condición asíncrona, sin efectos de escritura.
 * @returns {Promise<unknown>} Primer resultado válido; lanza al agotar 30 segundos.
 */
export async function waitForAcademic(condition) {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try { const result = await condition(); if (result) return result; } catch { /* Arranque o render. */ }
    await new Promise((done) => setTimeout(done, 100));
  }
  throw new Error('La revisión académica agotó la espera de un estado esperado');
}

/**
 * Abre Chrome headless aislado; CHROME_PATH admite una instalación local distinta.
 * @param {string} output Directorio de artefactos local, ajeno a perfiles personales.
 * @returns {Promise<object>} CDP y cierre; no conecta al Chrome del usuario.
 */
export async function createAcademicBrowser(output) {
  const candidates = [process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'];
  let executable;
  for (const candidate of candidates.filter(Boolean)) {
    try { await access(candidate); executable = candidate; break; } catch { /* Probar siguiente ubicación. */ }
  }
  if (!executable) throw new Error('Instala Chrome/Chromium o configura CHROME_PATH para revisar la interfaz');
  const profile = resolve(output, `browser-${Date.now()}`);
  await mkdir(profile, { recursive: true });
  const browserProcess = spawn(executable, ['--headless=new', '--remote-debugging-port=0',
    '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`, 'about:blank'],
  { windowsHide: true, stdio: 'ignore' });
  let socket;
  try {
    const port = await waitForAcademic(async () => (await readFile(resolve(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]);
    const targets = await (await fetch(`http://localhost:${port}/json/list`)).json();
    socket = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
    await new Promise((done, reject) => {
      socket.addEventListener('open', done, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    let sequence = 0;
    const pending = new Map();
    const errors = [];
    socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data);
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
      if (!message.id) return;
      const entry = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) entry.reject(new Error('Falló un comando del navegador de prueba'));
      else entry.resolve(message.result);
    });
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
    await send('Runtime.enable');
    await send('Page.enable');
    return { send, errors, async close() {
      await send('Browser.close').catch(() => {});
      socket.close(); browserProcess.kill();
    } };
  } catch (error) { socket?.close(); browserProcess.kill(); throw error; }
}
