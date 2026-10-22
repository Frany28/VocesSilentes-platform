import { S3Client } from '@aws-sdk/client-s3';

/**
 * Crea el transporte S3 exclusivo de Supabase con claves explícitas, sin autodetección de credenciales AWS.
 * @param {object} config Configuración privada validada del mismo proyecto PostgreSQL.
 * @returns {S3Client} Cliente con path-style, timeout y sin reintentos automáticos de escrituras ambiguas.
 */
export function createEvidenceS3Client(config) {
  return new S3Client({
    ...config,
    // El SDK anota el origen de identidad en el objeto; conservar inmutable la configuración validada.
    credentials: { ...config.credentials },
    forcePathStyle: true,
    maxAttempts: 1,
    followRegionRedirects: false,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    requestHandler: { connectionTimeout: 5000, requestTimeout: 20000 },
  });
}
