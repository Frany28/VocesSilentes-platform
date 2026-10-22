import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { authFixture } from './fixture.js';

/**
 * Integra HTTP/auth/Prisma reales en memoria con Storage explícitamente sustituido, sin proyecto remoto.
 * @returns {object} Fixture y objetos falsos únicamente para comprobar permisos y recuperación.
 */
export function evidenceFixture() {
  const objects = new Map();
  const storage = {
    failUpload: false,
    failRemove: false,
    uploads: 0,
    async upload(path, image) {
      storage.uploads += 1;
      if (objects.has(path)) throw new Error('Overwrite');
      objects.set(path, image.bytes);
      if (storage.failUpload) throw new Error('Ambiguous network failure after write');
    },
    async remove(path) {
      if (storage.failRemove) throw new Error('Removal unavailable');
      objects.delete(path);
    },
    async sign(path) {
      if (!objects.has(path)) throw new Error('Missing object');
      return {
        src: `https://storage.example.invalid/${path}?test-token`,
        expiresAt: new Date(Date.now() + 120000).toISOString(),
      };
    },
  };
  return { fixture: authFixture({ storage }), storage, objects };
}

/**
 * Crea un reporte mediante HTTP y un requestId repetible.
 * @param {object} account Sesión registrada.
 * @param {string} [requestId] Identificador idempotente.
 * @returns {Promise<object>} Reporte persistido.
 */
export async function newReport(account, requestId = randomUUID()) {
  return (
    await account.agent
      .post('/api/reports')
      .set('X-CSRF-Token', account.csrf)
      .send({ requestId, category: 'TECHNICAL', description: 'Fallo de prueba' })
      .expect(201)
  ).body.data.report;
}

/**
 * Construye una imagen real y envía bytes sin confiar en su Content-Type.
 * @param {object} account Sesión registrada.
 * @param {string} id Reporte objetivo.
 * @param {Buffer} [bytes] Archivo de prueba, PNG si se omite.
 * @returns {Promise<object>} Respuesta HTTP para aserciones.
 */
export async function uploadEvidence(account, id, bytes) {
  bytes ??= await sharp({ create: { width: 10, height: 6, channels: 3, background: 'red' } })
    .png()
    .toBuffer();
  return account.agent
    .put(`/api/reports/${id}/evidence`)
    .set('X-CSRF-Token', account.csrf)
    .set('Content-Type', 'application/octet-stream')
    .send(bytes);
}
