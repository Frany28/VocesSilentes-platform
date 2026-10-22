import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { validateEvidenceImage } from '../src/modules/reports/evidence-image.js';

test('evidencia: decodificación y recodificación reales de JPEG/PNG/WEBP, sin contenido añadido', async () => {
  for (const format of ['jpeg', 'png', 'webp']) {
    const original = await sharp({
      create: { width: 12, height: 8, channels: 3, background: 'red' },
    })
      .toFormat(format)
      .toBuffer();
    const image = await validateEvidenceImage(
      Buffer.concat([original, Buffer.from('untrusted trailing payload')]),
    );
    assert.equal(image.mimeType, `image/${format}`);
    assert.equal(image.size, image.bytes.length);
    assert.equal(image.bytes.includes(Buffer.from('untrusted trailing payload')), false);
    assert.equal((await sharp(image.bytes).metadata()).width, 12);
  }
});

test('evidencia: rechaza falsos JPEG, SVG, GIF, documentos, corrupción, tamaño y dimensiones', async () => {
  const image = await sharp({ create: { width: 4, height: 4, channels: 3, background: 'red' } })
    .png()
    .toBuffer();
  for (const bytes of [
    Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
    Buffer.from('GIF89a'),
    Buffer.from('%PDF-1.7'),
    Buffer.from('fake.jpg'),
    image.subarray(0, 45),
    Buffer.from([255, 216, 255, 0, 0]),
  ]) {
    await assert.rejects(validateEvidenceImage(bytes), { code: 'INVALID_IMAGE', status: 422 });
  }
  await assert.rejects(validateEvidenceImage(Buffer.alloc(5242881)), { status: 413 });
  for (const [width, height] of [
    [8193, 1],
    [4001, 4000],
  ]) {
    const large = await sharp({ create: { width, height, channels: 3, background: 'red' } })
      .png()
      .toBuffer();
    await assert.rejects(validateEvidenceImage(large), { code: 'INVALID_IMAGE' });
  }
});

test('evidencia: rechaza PNG animado aunque tenga firma y decodificador válidos', async () => {
  // acTL declara dos frames. CRC válido para que la prueba no dependa de corrupción del chunk.
  const base = await sharp({ create: { width: 1, height: 1, channels: 3, background: 'red' } })
    .png()
    .toBuffer();
  const chunk = Buffer.from('000000086163544c0000000200000000f38d9370', 'hex');
  const animated = Buffer.concat([base.subarray(0, 33), chunk, base.subarray(33)]);
  await assert.rejects(validateEvidenceImage(animated), { code: 'INVALID_IMAGE' });
});
