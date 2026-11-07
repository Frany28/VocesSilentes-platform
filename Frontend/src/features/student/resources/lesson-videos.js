import { z } from 'zod';
import { publicConfig } from '../../../lib/config.js';

/**
 * UUID de las lecciones de Abecedario LSV. Son deterministas: alphabetId('m1-lXX') en
 * Backend/scripts/learning/alphabet-source.js. Una prueba comprueba que coinciden.
 */
export const alphabetLessonIds = Object.freeze({
  'm1-l01': '53cfe2d7-fd91-52f7-9bdf-960d561f9940',
  'm1-l02': '80e9ca79-bbf5-5b13-a1e1-9dd9b9e5997e',
  'm1-l03': '052df1fa-f3c5-5a21-a400-ddc72a77658b',
  'm1-l04': 'cbcfdfc6-b975-59bd-9082-7ceff1846d83',
  'm1-l05': 'be5a82e4-a14f-5b15-9394-2c742be26fde',
  'm1-l06': '4ff964fb-f22c-58b8-881b-222bac3d40f6',
  'm1-l07': '0269df32-f7c5-540b-a824-4dd9bfdc2b91',
});

const mediaPath = (extensions) =>
  z.string().regex(new RegExp(`^/media/lessons/[a-z0-9-]+\\.(${extensions})$`));

const videoSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  lessonKey: z.enum(Object.keys(alphabetLessonIds)),
  title: z.string().min(3),
  src: mediaPath('mp4|webm'),
  captions: mediaPath('vtt'),
  transcript: z.string().min(40),
  // NOTEBOOKLM: explicación generada con IA; nunca se presenta como seña verificada.
  origin: z.enum(['NOTEBOOKLM', 'LSV_SIGNER_RECORDING']),
  rights: z.enum(['AUTHORIZED', 'PENDING']),
  pedagogicalReview: z.enum(['APPROVED', 'PENDING']),
  lsvReview: z.enum(['VALIDATED', 'PENDING_LSV_REVIEW']),
  status: z.enum(['PUBLISHED', 'DRAFT']),
});

/**
 * Registro de videos de lección. Vacío: todavía no hay videos autorizados.
 * Para añadir uno (p. ej. de NotebookLM) seguir docs/lsv-resources.md: archivo y subtítulos .vtt en
 * Frontend/public/media/lessons/, transcripción completa y estados editoriales reales.
 * @type {object[]}
 */
export const lessonVideos = [];

/**
 * Valida una entrada del registro. Un video sin subtítulos o sin transcripción no es aceptable.
 * @param {unknown} entry Entrada candidata.
 * @returns {object} Entrada validada.
 * @throws {import('zod').ZodError} Si falta un campo obligatorio o una ruta no es local.
 */
export function validateLessonVideo(entry) {
  return videoSchema.parse(entry);
}

/**
 * Videos que se pueden mostrar en una lección. Producción exige PUBLISHED, derechos y revisión
 * pedagógica; los borradores solo se ven en la vista previa explícita de desarrollo.
 * @param {string} lessonId UUID de la lección recibido de la API.
 * @param {object[]} [registry] Registro; por defecto lessonVideos.
 * @returns {object[]} Entradas validadas, en orden de registro.
 */
export function videosForLesson(lessonId, registry = lessonVideos) {
  const key = Object.keys(alphabetLessonIds).find((item) => alphabetLessonIds[item] === lessonId);
  if (!key) return [];
  return registry
    .map(validateLessonVideo)
    .filter((video) => video.lessonKey === key)
    .filter(
      (video) =>
        (video.status === 'PUBLISHED' &&
          video.rights === 'AUTHORIZED' &&
          video.pedagogicalReview === 'APPROVED') ||
        publicConfig.studentDemo,
    );
}
