import { LessonMedia } from '../lesson/LessonMedia.jsx';
import { LazyVowelMicroclass } from '../microclass/LazyVowelMicroclass.jsx';
import { LessonVideo } from '../resources/LessonVideo.jsx';
import { alphabetLessonIds, videosForLesson } from '../resources/lesson-videos.js';

/**
 * Etapa de demostración: microclase original en introducción y vocales, videos de la lección o, si no hay
 * ninguno, el marcador explícito de material pendiente. Nunca rellena con recursos no aprobados.
 * @param {{step: object}} props Paso de recursos.
 * @returns {import('react').ReactElement} Recursos de la lección con su estado editorial.
 */
export function LessonResources({ step }) {
  const videos = videosForLesson(step.lessonId);
  const microclass = step.microclass || step.lessonId === alphabetLessonIds['m1-l01'];
  const empty = !microclass && videos.length === 0;
  return (
    <article
      className={`journey-copy education-card flex min-w-0 flex-col gap-4${
        microclass ? ' journey-video-lesson' : ''
      }`}
      aria-labelledby="journey-title"
    >
      <div className="journey-video-heading">
        <h2 id="journey-title">{step.title}</h2>
        {microclass && (
          <p className="text-muted">
            Observa cada vocal, sigue los subtítulos y utiliza los controles para repasar a tu
            ritmo.
          </p>
        )}
      </div>
      {microclass && <LazyVowelMicroclass />}
      {videos.map((video) => (
        <LessonVideo key={video.id} video={video} />
      ))}
      {empty ? (
        <>
          <LessonMedia />
          <p>
            Todavía no hay un video específico para esta lección. Continúa para observar las
            imágenes de cada letra y compararlas a tu ritmo.
          </p>
        </>
      ) : (
        <p className="text-muted">Puedes volver a verlo las veces que quieras.</p>
      )}
      <p className="text-muted">Pulsa Continuar para seguir con la lección.</p>
    </article>
  );
}
