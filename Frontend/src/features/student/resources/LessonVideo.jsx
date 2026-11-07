import './lesson-video.css';

/**
 * Reproductor accesible de un video de lección: controles nativos, subtítulos en español activos por
 * defecto, transcripción completa y aviso obligatorio si el video fue generado con IA.
 * No se reproduce solo: el estudiante decide cuándo iniciarlo.
 * @param {{video: object}} props Entrada validada de lesson-videos.js.
 * @returns {import('react').ReactElement} Figura con video, avisos y transcripción.
 */
export function LessonVideo({ video }) {
  const generated = video.origin === 'NOTEBOOKLM';
  const noteId = `video-note-${video.id}`;
  return (
    <figure className="lesson-video">
      <video controls preload="metadata" src={video.src} aria-describedby={noteId}>
        <track kind="captions" src={video.captions} srcLang="es" label="Español" default />
        Tu navegador no puede reproducir este video. Lee la transcripción más abajo.
      </video>
      <figcaption className="flex flex-col gap-2">
        <strong>{video.title}</strong>
        <span id={noteId} className="text-muted">
          {generated
            ? 'Video explicativo generado con IA (NotebookLM). Las manos o señas que aparezcan no son demostraciones verificadas de LSV: usa las ilustraciones de referencia.'
            : video.lsvReview === 'VALIDATED'
              ? 'Demostración validada por una persona competente en LSV.'
              : 'Demostración pendiente de revisión LSV.'}
          {video.status !== 'PUBLISHED' &&
            ' Borrador visible solo en la vista previa de desarrollo.'}
        </span>
      </figcaption>
      <details className="journey-references">
        <summary>Transcripción del video</summary>
        <p className="journey-reading">{video.transcript}</p>
      </details>
    </figure>
  );
}
