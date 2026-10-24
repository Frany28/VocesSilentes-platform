import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, dirname, extname } from 'node:path';
import assert from 'node:assert/strict';
import { academicAdmin, academicStudent, academicPassword } from './academic/credentials.js';

// Comprueba la selección antes de sustituir la entrega; no conecta a servicios externos.
const root = resolve(process.argv[2]);
const files = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert.equal(entry.isSymbolicLink(), false, 'La entrega no admite enlaces externos');
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
  }
}
await walk(root);
const names = files.map((file) => relative(root, file).replaceAll('\\', '/'));
const forbidden =
  /(^|\/)(AGENTS?\.md|SKILL\.md|CLAUDE\.md|\.codex|\.agents|\.cursor|\.github|\.vscode|node_modules|generated|dist|coverage|\.git|\.local|\.vercel)(\/|$)/iu;
for (const name of names) {
  assert.equal(forbidden.test(name), false, `Archivo interno: ${name}`);
  assert.equal(/(^|\/)\.env(?!\.example$)($|\.)/u.test(name), false, 'Configuración privada');
  assert.equal(/\.(zip|log)$/iu.test(name), false, 'Artefacto temporal');
}
const sourcePattern =
  /(?:\bfrom\s+|\bimport\s*\(?\s*|@import\s+|new URL\(\s*)['"](\.[^'"]+)['"]|url\(\s*['"]?(\.{1,2}\/[^'")\s]+)/gu;
let references = 0;
const missing = [];
for (const file of files) {
  if (!/\.(js|jsx|css|html|md|txt)$/u.test(file)) continue;
  const text = await readFile(file, 'utf8');
  if (/\.(md|txt)$/u.test(file))
    assert.equal(
      /\b(?:codex|chatgpt|AGENTS\.md|SKILL\.md)\b/iu.test(text),
      false,
      'Documentación interna',
    );
  if (/\.(js|jsx|css)$/u.test(file)) {
    for (const match of text.matchAll(sourcePattern)) {
      const value = match[1] ?? match[2];
      if (value.includes('${')) continue;
      let target = resolve(dirname(file), value);
      if (file.endsWith('vercel.test.js') && value === './app.js')
        target = resolve(root, 'proyecto/Backend/app.js');
      const name = relative(root, target).replaceAll('\\', '/');
      if (/(?:^|\/)(?:generated|node_modules|\.local)(?:\/|$)/u.test(name)) continue;
      if (/(?:^|\/)\.env(?:\.|$)/u.test(name) && !name.endsWith('.env.example')) continue;
      if (!(await stat(target).catch(() => false))) missing.push(name);
      references++;
    }
  }
  if (extname(file) === '.md') {
    for (const [, link] of text.matchAll(/\]\(([^)]+)\)/gu)) {
      if (/^(?:https?:|#)/u.test(link)) continue;
      const target = resolve(dirname(file), decodeURIComponent(link.split('#')[0]));
      assert.ok(await stat(target).catch(() => false), 'Enlace documental ausente');
    }
  }
}
assert.deepEqual(missing, [], 'Referencias ausentes en la entrega');
for (const required of [
  'proyecto/Backend/certs/supabase-root-2021.crt',
  'proyecto/Backend/src/modules/account/account.service.js',
  'proyecto/Backend/storage/002_profile_photos.sql',
  'proyecto/Frontend/src/features/admin/data/use-admin-summary.js',
  'proyecto/Frontend/src/assets/favicon.png',
  '01_schema.sql',
  '02_seed.sql',
  '03_verificacion.sql',
  '04_verificacion_supabase.sql',
  '05_storage_supabase.sql',
])
  assert.ok(names.includes(required), `Falta archivo requerido: ${required}`);
const student = await readFile(resolve(root, 'DATOS-DEL-ESTUDIANTE.txt'), 'utf8');
for (const value of [academicAdmin, academicStudent, academicPassword])
  assert.ok(student.includes(value));
const manifest = JSON.parse(await readFile(resolve(root, 'proyecto/package.json'), 'utf8'));
assert.equal(manifest.scripts['academic:package'], undefined);
console.log(
  JSON.stringify({
    files: files.length,
    checkedReferences: references,
    internalFiles: 0,
    missingReferences: 0,
  }),
);
