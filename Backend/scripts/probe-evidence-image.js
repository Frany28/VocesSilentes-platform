import assert from 'node:assert/strict';
import sharp from 'sharp';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { validateEvidenceImage, EVIDENCE_BUCKET } from '../src/modules/reports/evidence-image.js';

/**
 * Prueba un objeto temporal real: escritura, lectura exacta, no reemplazo, anónimo y firma vencida.
 * @param {object} storage Adaptador privado configurado.
 * @param {object} client Cliente S3 del mismo proyecto.
 * @param {string} format Formato de imagen de prueba.
 * @param {string} path Ruta UUID temporal registrada antes por el script principal.
 * @returns {Promise<void>} Sin datos de aplicación; el llamador debe eliminar el objeto incluso ante fallo.
 * @throws {Error} Si el proveedor no respeta alguno de los controles comprobados.
 */
export async function probeEvidenceImage(storage, client, format, path) {
  const original = await sharp({ create: { width: 8, height: 8, channels: 3, background: 'red' } })
    .toFormat(format)
    .toBuffer();
  const image = await validateEvidenceImage(original);
  await storage.upload(path, image);
  await assert.rejects(storage.upload(path, image), { code: 'EVIDENCE_EXISTS' });
  const access = await storage.sign(path);
  const response = await fetch(access.src, {
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), image.mimeType);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), image.bytes);
  const anonymous = await fetch(access.src.split('?')[0], { signal: AbortSignal.timeout(20000) });
  assert.ok([400, 401, 403, 404].includes(anonymous.status));
  await anonymous.body?.cancel();
  // Una firma criptográficamente válida emitida hace 125 s, con TTL 120 s, ya debe ser rechazada.
  const expired = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: EVIDENCE_BUCKET, Key: path }),
    { expiresIn: 120, signingDate: new Date(Date.now() - 125000) },
  );
  const denied = await fetch(expired, { signal: AbortSignal.timeout(20000) });
  assert.ok([400, 401, 403].includes(denied.status));
  await denied.body?.cancel();
  const renewed = await fetch((await storage.sign(path)).src, {
    signal: AbortSignal.timeout(20000),
  });
  assert.equal(renewed.status, 200);
  await renewed.body?.cancel();
}
