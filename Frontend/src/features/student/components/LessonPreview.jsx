import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Abre la lección sugerida con los identificadores del catálogo, sin registrar progreso.
 * @param {{lesson: object, module: object, onOpen: Function}} props Lección y módulo publicados.
 * @returns {import('react').ReactElement} Fila accesible con los SVG originales.
 */
export function LessonPreview({ lesson, module, onOpen }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="[font:var(--type-h3)]">Tu siguiente paso</h2>
      <button
        type="button"
        onClick={() => onOpen({ ...module, nextLesson: lesson })}
        className="student-lesson flex w-full items-center gap-3 rounded-2xl border border-border bg-surface
          p-4 text-left text-content focus-visible:outline-3 focus-visible:outline-focus"
      >
        <span className="flex rounded-xl bg-accent p-3">
          <Icon name="play" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2 [font:var(--type-button)]">
          <span>
            {String(lesson.position).padStart(2, '0')} · {lesson.title}
          </span>
          <span className="text-muted [font:var(--type-label)]">Lectura educativa</span>
        </span>
        <span className="hidden text-muted min-[600px]:block">Ver lección</span>
        <span className="min-[600px]:hidden">
          <Icon name="chevron" size={16} />
        </span>
      </button>
    </section>
  );
}
