import { LessonMedia } from '../lesson/LessonMedia.jsx';
import { LazyVowelMicroclass } from '../microclass/LazyVowelMicroclass.jsx';
import { LessonVideo } from '../resources/LessonVideo.jsx';
import { videosForLesson } from '../resources/lesson-videos.js';

/**
 * Etapa de demostración: microclase (vocales), videos autorizados de la lección o, si no hay
 * ninguno, el marcador explícito de material pendiente. Nunca rellena con recursos no aprobados.
 * @param {{step: object, pending: number}} props Paso de recursos y preguntas no disponibles.
 * @returns {import('react').ReactElement} Recursos de la lección con su estado editorial.
 */
export function LessonResources({ step, pending }) {
  const videos = videosForLesson(step.lessonId);
  const empty = !step.microclass && videos.length === 0;
  return (
    <article
      className="journey-copy education-card flex min-w-0 flex-col gap-4"
      aria-labelledby="journey-title"
    >
      <p className="journey-eyebrow text-muted">Material de referencia</p>
      <h2 id="journey-title">{step.title}</h2>
      {step.microclass && <LazyVowelMicroclass />}
      {videos.map((video) => (
        <LessonVideo key={video.id} video={video} />
      ))}
      {empty ? (
        <>
          <LessonMedia />
          <p>
            Las imágenes y los vídeos siguen pendientes de autorización y revisión LSV. Puedes
            estudiar la teoría mientras se preparan esos recursos.
          </p>
        </>
      ) : (
        <p className="text-muted">Puedes volver a verlo las veces que quieras.</p>
      )}
      <p className="text-muted">
        Pulsa Continuar para comparar las letras de la lección.
        {pending > 0 && ` Hay ${pending} ejercicios pendientes; no cuentan como aciertos.`}
      </p>
    </article>
  );
}
