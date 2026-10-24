import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createEvidenceS3Client } from '../reports/evidence-s3-client.js';
import { HttpError } from '../../errors/http-error.js';

/**
 * Almacena fotos saneadas en un bucket privado separado de las evidencias.
 * @param {object | undefined} config Credenciales privadas S3 existentes.
 * @returns {object | undefined} Escritura, borrado, firma temporal y cierre del cliente.
 */
export function createProfilePhotoStorage(config) {
  if (!config) return undefined;
  const client = createEvidenceS3Client(config);
  const target = (path) => {
    if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/.test(path)) throw new Error('Invalid photo path');
    return { Bucket: 'profile-photos', Key: path };
  };
  const send = async (command) => {
    try {
      return await client.send(command, { abortSignal: AbortSignal.timeout(20000) });
    } catch {
      throw new HttpError(
        503,
        'PHOTO_STORAGE_UNAVAILABLE',
        'No se pudo guardar la foto. Reintenta.',
      );
    }
  };
  return {
    upload: (path, bytes) =>
      send(
        new PutObjectCommand({
          ...target(path),
          Body: bytes,
          ContentType: 'image/webp',
          CacheControl: 'no-store',
          ContentLength: bytes.length,
        }),
      ),
    remove: (path) => send(new DeleteObjectCommand(target(path))),
    async read(path) {
      const response = await send(new GetObjectCommand(target(path)));
      return Buffer.from(await response.Body.transformToByteArray());
    },
    async sign(path) {
      const src = await getSignedUrl(client, new GetObjectCommand(target(path)), {
        expiresIn: 120,
      });
      return { src, expiresAt: new Date(Date.now() + 120000).toISOString() };
    },
    check: () => send(new HeadBucketCommand({ Bucket: 'profile-photos' })),
    close: () => client.destroy(),
  };
}
