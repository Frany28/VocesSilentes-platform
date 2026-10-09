import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'generate'], {
  stdio: 'inherit',
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

// Prisma 7 genera TypeScript; solo su salida se compila a JavaScript ESM estable.
await build({
  entryPoints: ['generated/prisma/client.ts'],
  outfile: 'generated/client.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  target: 'node22',
});
