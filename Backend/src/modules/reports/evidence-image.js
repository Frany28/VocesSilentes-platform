import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { HttpError } from '../../errors/http-error.js';

export const EVIDENCE_LIMIT = 5 * 1024 * 1024;
export const EVIDENCE_BUCKET = 'report-evidence';
const formats = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
let processing = 0;

function rejectAnimatedPng(input) {
  if (input[0] !== 137) return;
  for (let offset = 8; offset + 12 <= input.length;) {
    const type = input.toString('ascii', offset + 4, offset + 8);
    if (type === 'acTL' || type === 'fcTL') throw new Error('Animated PNG');
    offset += input.readUInt32BE(offset) + 12;
  }
}

/**
 * Inspecciona bytes, decodifica todos los píxeles y recodifica sin metadatos ni contenido añadido.
 * @param {Buffer} input Archivo no confiable, independientemente de nombre o cabeceras.
 * @returns {Promise<object>} Bytes saneados, MIME, tamaño y digest del archivo recibido para reintentos.
 * @throws {HttpError} 413 sobre 5 MiB; 422 por formato, corrupción, animación o dimensiones excesivas.
 */
export async function validateEvidenceImage(input) {
  if (!Buffer.isBuffer(input) || !input.length)
    throw new HttpError(422, 'INVALID_IMAGE', 'Selecciona una imagen JPEG, PNG o WEBP válida');
  if (input.length > EVIDENCE_LIMIT)
    throw new HttpError(413, 'IMAGE_TOO_LARGE', 'La imagen supera 5 MB');
  if (processing >= 2)
    throw new HttpError(
      429,
      'IMAGE_PROCESSING_BUSY',
      'Hay imágenes procesándose. Reintenta en unos segundos.',
    );
  processing += 1;
  try {
    // Evita entregar SVG/documentos a sus decodificadores aunque Sharp pueda admitirlos.
    const signature = input.subarray(0, 12);
    const allowed =
      signature.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ||
      signature.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
      (signature.toString('ascii', 0, 4) === 'RIFF' &&
        signature.toString('ascii', 8, 12) === 'WEBP');
    if (!allowed) throw new Error('signature');
    rejectAnimatedPng(input);
    const image = sharp(input, { failOn: 'warning', limitInputPixels: 16000000 });
    const metadata = await image.metadata();
    if (
      !formats[metadata.format] ||
      (metadata.pages ?? 1) !== 1 ||
      !metadata.width ||
      !metadata.height ||
      metadata.width > 8192 ||
      metadata.height > 8192
    )
      throw new Error('dimensions');
    const bytes = await image
      .rotate()
      .toFormat(metadata.format)
      .timeout({ seconds: 10 })
      .toBuffer();
    if (bytes.length > EVIDENCE_LIMIT)
      throw new HttpError(413, 'IMAGE_TOO_LARGE', 'La imagen procesada supera 5 MB');
    return {
      bytes,
      mimeType: formats[metadata.format],
      size: bytes.length,
      digest: createHash('sha256').update(input).digest('hex'),
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(
      422,
      'INVALID_IMAGE',
      'Imagen inválida: usa JPEG, PNG o WEBP estático, hasta 8192 px por lado y 16 megapíxeles',
    );
  } finally {
    processing -= 1;
  }
}
