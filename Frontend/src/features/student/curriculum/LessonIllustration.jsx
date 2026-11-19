import introduction from '../../../assets/alphabet-lessons/introduccion.webp';
import vowels from '../../../assets/alphabet-lessons/vocales.webp';
import consonantsBG from '../../../assets/alphabet-lessons/consonantes-b-g.webp';
import consonantsHM from '../../../assets/alphabet-lessons/consonantes-h-m.webp';
import consonantsNR from '../../../assets/alphabet-lessons/consonantes-n-r.webp';
import consonantsSX from '../../../assets/alphabet-lessons/consonantes-s-x.webp';
import consonantsYZ from '../../../assets/alphabet-lessons/consonantes-y-z.webp';
import { alphabetLessonIds } from '../resources/lesson-videos.js';

const illustrations = {
  [alphabetLessonIds['m1-l01']]: introduction,
  [alphabetLessonIds['m1-l02']]: vowels,
  [alphabetLessonIds['m1-l03']]: consonantsBG,
  [alphabetLessonIds['m1-l04']]: consonantsHM,
  [alphabetLessonIds['m1-l05']]: consonantsNR,
  [alphabetLessonIds['m1-l06']]: consonantsSX,
  [alphabetLessonIds['m1-l07']]: consonantsYZ,
  'vowels-guided-v1': vowels,
};

/**
 * Acompaña la bienvenida con el arte aportado; conserva el recurso genérico en otras lecciones.
 * Las imágenes son decorativas: el título y los objetivos contienen la información educativa.
 * @param {{lessonId?: string}} props Identificador estable; no depende de títulos ni del orden.
 * @returns {import('react').ReactElement} Ilustración completa o decoración existente.
 */
export function LessonIllustration({ lessonId }) {
  const source = illustrations[lessonId];
  if (!source)
    return (
      <div className="journey-welcome bg-accent rounded-control">
        <span className="education-media-art" aria-hidden="true" />
      </div>
    );
  return (
    <img
      className="journey-illustration"
      src={source}
      alt=""
      width="1440"
      height="480"
      decoding="async"
    />
  );
}
