import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createAcademicBrowser } from '../academic/browser-session.js';
import { createAcademicDriver } from '../academic/browser-driver.js';

/**
 * Abre un runner de diagnóstico local reutilizando Vite y el detector del frontend, sin API ni base de datos.
 * @param {string} output Evidencias locales ignoradas.
 * @returns {Promise<object>} Navegador aislado, driver y cierre; no sirve los videos por HTTP ni solicita cámara.
 */
export async function createLocalVideoSession(output) {
  const frontend = new URL('../../../Frontend/', import.meta.url);
  const require = createRequire(new URL('package.json', frontend));
  const { createServer } = await import(pathToFileURL(require.resolve('vite')).href);
  const server = await createServer({
    configFile: false,
    envDir: false,
    root: fileURLToPath(frontend),
    appType: 'custom',
    server: {
      host: '127.0.0.1',
      port: 5292,
      strictPort: true,
      hmr: false,
      fs: {
        allow: [
          fileURLToPath(frontend),
          fileURLToPath(new URL('../../../shared/', import.meta.url)),
          fileURLToPath(new URL('../../../node_modules/', import.meta.url)),
        ],
      },
    },
  });
  server.middlewares.use('/review', (_request, response) => {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(`<main><input id="source" type="file"><video muted playsinline></video><canvas></canvas></main>
      <script>window.onchange=()=>{const video=document.querySelector('video');
      if(window.localVideoUrl)URL.revokeObjectURL(window.localVideoUrl);
      window.localVideoUrl=URL.createObjectURL(document.querySelector('input').files[0]);
      video.src=window.localVideoUrl;};</script>`);
  });
  let browser;
  try {
    await server.listen();
    browser = await createAcademicBrowser(output, { fakeCamera: true });
    const page = createAcademicDriver(browser, 'http://127.0.0.1:5292', output);
    await page.navigate('/review');
    return {
      page,
      close: async () => {
        await browser.close();
        await server.close();
      },
    };
  } catch (error) {
    await browser?.close();
    await server.close();
    throw error;
  }
}
