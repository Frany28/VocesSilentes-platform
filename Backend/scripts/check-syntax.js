import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const directories = ['src', 'scripts'];
for (const directory of directories) {
  const files = await readdir(directory, { recursive: true });
  for (const file of files.filter((name) => name.endsWith('.js'))) {
    const result = spawnSync(process.execPath, ['--check', `${directory}/${file}`], {
      stdio: 'inherit',
    });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
console.log('Sintaxis del backend verificada; JavaScript ESM se ejecuta sin bundle.');
