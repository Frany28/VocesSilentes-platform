import provenance from '../../../assets/lsv-manual/provenance.json';
import { manualReference } from '../recognition/manual-reference.js';
import { publishedImages } from './published-letter-images.js';

export const illustrationCredit = 'Ilustraciones: Yulianny Fuentes, Manual básico de LSV (2022)';

/**
 * @typedef {object} LetterResource
 * @property {string} letter Letra del alfabeto manual.
 * @property {'published'|'preview'|'pending'|'missing'} status Publicada, vista previa local, pendiente o sin fuente.
 * @property {string} [url] URL de la imagen cuando puede mostrarse.
 * @property {number} [page] Página del manual de origen.
 * @property {string} [credit] Crédito de la ilustración.
 * @property {string} [linguisticReview] Estado de revisión LSV; hoy siempre PENDING_LSV_REVIEW.
 */

/**
 * Resuelve la ilustración de una letra según su estado editorial, sin depender de rutas de desarrollo
 * para las publicadas. Las no autorizadas solo se ven en la vista previa explícita de desarrollo.
 * @param {string} letter Letra de estudio, nunca la opción correcta oculta de una pregunta.
 * @returns {LetterResource} Recurso y estado; la revisión lingüística pendiente siempre se informa.
 */
export function letterResource(letter) {
  const entry = provenance.images[letter];
  if (!entry) return { letter, status: 'missing' };
  const base = {
    letter,
    page: entry.page,
    credit: provenance.credit,
    linguisticReview: provenance.validationStatus,
  };
  if (publishedImages[letter])
    return { ...base, status: 'published', url: publishedImages[letter].url };
  const preview = manualReference(letter);
  if (preview) return { ...base, status: 'preview', url: preview.url };
  return { ...base, status: 'pending' };
}

/**
 * Letras con ilustración publicada en producción.
 * @returns {string[]} Letras en orden del registro.
 */
export function publishedLetters() {
  return Object.keys(publishedImages);
}
