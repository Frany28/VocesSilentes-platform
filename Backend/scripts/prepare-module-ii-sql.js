import { readFile, readdir, writeFile } from 'node:fs/promises';
import { randomBytes, createHash } from 'node:crypto';
import { createPasswords } from '../src/modules/auth/passwords.js';
import { academicPassword } from './academic/credentials.js';

// Solo prepara artefactos locales: no carga .env ni abre conexiones PostgreSQL.
const directory = new URL('../prisma/migrations/', import.meta.url);
const output = new URL('../../docs/module-ii/sql/', import.meta.url);
const names = (await readdir(directory)).filter((name) => /^\d/.test(name)).sort();
const migrations = await Promise.all(
  names.map(
    async (name) =>
      `-- Migration: ${name}\n${await readFile(new URL(`${name}/migration.sql`, directory), 'utf8')}`,
  ),
);
await writeFile(
  new URL('01_schema.sql', output),
  '-- Snapshot autónomo para PostgreSQL limpio y aislado, sin historial Prisma.\n' +
    '-- Excepción de tamaño: copia exacta del historial SQL; ver docs/development.md.\n' +
    '-- Generado por Backend/scripts/prepare-module-ii-sql.js. No editar manualmente.\n' +
    migrations.join('\n'),
);
const passwords = await createPasswords();
const values = [];
for (let n = 1; n <= 5; n += 1) {
  const passwordHash = await passwords.hash(academicPassword);
  const tokenHash = createHash('sha256').update(randomBytes(32)).digest('hex');
  values.push(`(${n}, '${passwordHash}', '${tokenHash}')`);
}
const seedPath = new URL('02_seed.sql', output);
const seed = await readFile(new URL('./academic/seed.sql', import.meta.url), 'utf8');
await writeFile(
  seedPath,
  seed.replace(
    /-- BEGIN GENERATED CREDENTIALS[\s\S]*?-- END GENERATED CREDENTIALS/u,
    '-- BEGIN GENERATED CREDENTIALS\nINSERT INTO day_one_credentials VALUES\n' +
      values.join(',\n') +
      ' ;\n-- END GENERATED CREDENTIALS',
  ),
);
