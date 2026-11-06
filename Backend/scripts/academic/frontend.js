import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/**
 * Arranca Vite dev o un build de producción aislado con la API efímera, sin modificar configuración privada.
 * @param {{port: number, apiUrl: string, production: boolean}} options Puerto, API de prueba y modo del navegador.
 * @returns {import('node:child_process').ChildProcess} Proceso propio con stderr disponible para su supervisor.
 * @throws {Error} Build de producción fallido.
 */
export function startAcademicFrontend({ port, apiUrl, production }) {
  const root = new URL('../../../Frontend/', import.meta.url);
  const executable = fileURLToPath(new URL('node_modules/vite/bin/vite.js', root));
  const options = {
    cwd: fileURLToPath(root),
    windowsHide: true,
    env: { ...process.env, VITE_API_URL: apiUrl, VITE_STUDENT_DEMO: 'false' },
  };
  if (production) {
    const build = spawnSync(process.execPath, [executable, 'build'], {
      ...options,
      stdio: 'ignore',
    });
    if (build.status !== 0)
      throw new Error('No se pudo construir el frontend de prueba en producción');
  }
  return spawn(
    process.execPath,
    [
      executable,
      ...(production ? ['preview'] : []),
      '--host',
      'localhost',
      '--port',
      String(port),
      '--strictPort',
    ],
    { ...options, stdio: ['ignore', 'ignore', 'pipe'] },
  );
}
