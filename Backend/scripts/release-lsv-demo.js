import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createDemoRelease } from '../../shared/lsv/demo-release.js';

// Publicación educativa autorizada por la responsable: solo prototipos normalizados y límites documentados.
const input = new URL('../../.local/lsv-experimental/lsv-experimental-model.json', import.meta.url);
const directory = new URL('../../Frontend/public/models/', import.meta.url);
const bytes = await readFile(input);
const model = createDemoRelease(JSON.parse(bytes));
await mkdir(directory, { recursive: true });
const serialized = JSON.stringify(model);
await writeFile(new URL('lsv-vowels-demo-v1.json', directory), serialized);
console.log(
  JSON.stringify({
    release: model.releaseId,
    status: model.status,
    samples: model.prototypes.length,
    sha256: createHash('sha256').update(serialized).digest('hex'),
    privateAuditPublished: false,
    independentEvaluation: false,
  }),
);
