import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { HttpError } from '../../errors/http-error.js';
import { EVIDENCE_BUCKET } from './evidence-image.js';
import { createEvidenceS3Client } from './evidence-s3-client.js';

/**
 * Storage S3 privado; las reservas DB únicas autorizan cada carga y READY impide reemplazarla.
 * @param {object | undefined} config Endpoint/región/credenciales del servidor.
 * @param {{client?: object, presign?: Function}} [dependencies] Transporte/firma sustituibles solo en pruebas.
 * @returns {object | undefined} upload/remove/sign/check/close; nunca lista objetos ni expone claves secretas.
 */
export function createEvidenceStorage(config, dependencies = {}) {
  if (!config) return undefined;
  const client = dependencies.client ?? createEvidenceS3Client(config);
  const presign = dependencies.presign ?? getSignedUrl;
  const unavailable = () =>
    new HttpError(
      503,
      'STORAGE_UNAVAILABLE',
      'No se pudo contactar con el almacenamiento. Reintenta.',
    );
  const target = (path) => {
    if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(path))
      throw new Error('Invalid internal evidence path');
    return { Bucket: EVIDENCE_BUCKET, Key: path };
  };
  const send = async (command) => {
    try {
      return await client.send(command, { abortSignal: AbortSignal.timeout(20000) });
    } catch {
      throw unavailable();
    }
  };
  return {
    async upload(path, image) {
      const object = target(path);
      try {
        await client.send(new HeadObjectCommand(object), {
          abortSignal: AbortSignal.timeout(20000),
        });
      } catch (error) {
        if (error.$metadata?.httpStatusCode !== 404) throw unavailable();
        // Supabase no garantiza PutObject condicional: la exclusión entre cargas reside en la reserva DB.
        await send(
          new PutObjectCommand({
            ...object,
            Body: image.bytes,
            ContentLength: image.size,
            ContentType: image.mimeType,
            CacheControl: 'no-store',
            IfNoneMatch: '*',
          }),
        );
        return;
      }
      throw new HttpError(409, 'EVIDENCE_EXISTS', 'El archivo ya existe y no puede sobrescribirse');
    },
    remove: async (path) => {
      await send(new DeleteObjectCommand(target(path)));
    },
    async sign(path) {
      const issuedAt = new Date();
      try {
        const src = await presign(
          client,
          new GetObjectCommand({ ...target(path), ResponseCacheControl: 'no-store' }),
          { expiresIn: 120, signingDate: issuedAt },
        );
        return { src, expiresAt: new Date(issuedAt.getTime() + 120000).toISOString() };
      } catch {
        throw unavailable();
      }
    },
    check: async () => {
      await send(new HeadBucketCommand({ Bucket: EVIDENCE_BUCKET }));
    },
    close: () => client.destroy(),
  };
}
