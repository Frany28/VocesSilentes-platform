import { alphabetLessonIds } from './lesson-videos.js';

/**
 * Identifica las lecciones que reutilizan la microclase animada original, independiente del registro MP4.
 * @param {string} lessonId UUID de la lección autorizada por la API.
 * @returns {boolean} Disponibilidad de la clase existente; no aprueba videos ni cambia estados editoriales.
 */
export function hasVowelMicroclass(lessonId) {
  return [alphabetLessonIds['m1-l01'], alphabetLessonIds['m1-l02']].includes(lessonId);
}
