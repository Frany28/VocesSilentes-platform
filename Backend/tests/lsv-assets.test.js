import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

test('recursos: modelo oficial íntegro y 27 fichas WebP con Ñ, créditos y revisión pendiente', async () => {
  const base = new URL('../../Frontend/src/assets/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('vision/hand-landmarker.json', base), 'utf8'));
  const model = await readFile(new URL(`vision/${manifest.task}`, base));
  assert.equal(createHash('sha256').update(model).digest('hex'), manifest.sha256);
  assert.equal(model.length, manifest.bytes);
  assert.equal(manifest.sdk, '@mediapipe/tasks-vision@1.1.0');
  const source = JSON.parse(await readFile(new URL('lsv-manual/provenance.json', base), 'utf8'));
  assert.equal(Object.keys(source.images).length, 27);
  assert.equal(source.validationStatus, 'PENDING_LSV_REVIEW');
  assert.match(source.credit, /Yulianny Fuentes/);
  assert.equal(source.images['Ñ'].page, 6);
  const entries = Object.values(source.images);
  assert.equal(new Set(entries.map(({ file }) => file)).size, 27);
  for (const entry of entries) {
    assert.match(entry.file, /^ficha-[a-f0-9]{12}\.webp$/);
    const metadata = await sharp(
      await readFile(new URL(`lsv-manual/${entry.file}`, base)),
    ).metadata();
    assert.equal(metadata.format, 'webp');
    assert.ok(metadata.width >= 720);
    assert.equal(metadata.width, metadata.height);
    assert.ok([5, 6].includes(entry.page));
  }
});
