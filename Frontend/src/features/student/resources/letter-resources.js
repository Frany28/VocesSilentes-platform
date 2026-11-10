import provenance from '../../../assets/lsv-manual/provenance.json';
import { manualReference } from '../recognition/manual-reference.js';
import a from '../../../assets/lsv-manual/ficha-bccafbad3ad5.webp';
import e from '../../../assets/lsv-manual/ficha-c4db4c076d0e.webp';
import i from '../../../assets/lsv-manual/ficha-b1729f97cbc2.webp';
import o from '../../../assets/lsv-manual/ficha-0ac03b43caa7.webp';
import u from '../../../assets/lsv-manual/ficha-46c533a46758.webp';

/**
 * Registro editorial de ilustraciones publicables. Solo una importación estática entra en el build:
 * añadir una letra aquí equivale a publicarla. Requisitos y procedimiento en docs/lsv-resources.md.
 * No usar import.meta.glob: Vite emitiría también las ilustraciones sin autorización.
 * @type {Record<string, {url: string, authorization: string}>}
 */
const publishedImages = {
  A: { url: a, authorization: 'OWNER_CONFIRMED_2026-11-06' },
  E: { url: e, authorization: 'OWNER_CONFIRMED_2026-11-06' },
  I: { url: i, authorization: 'OWNER_CONFIRMED_2026-11-06' },
  O: { url: o, authorization: 'OWNER_CONFIRMED_2026-11-06' },
  U: { url: u, authorization: 'OWNER_CONFIRMED_2026-11-06' },
};

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
