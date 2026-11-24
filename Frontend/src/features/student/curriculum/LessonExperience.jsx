/**
 * Bienvenida reutilizable para recorridos educativos con objetivos y vista previa de etapas.
 * El contenido se recibe de la lección o de su adaptador; este componente solo define composición.
 * @param {object} props Contenido y espacios opcionales de la bienvenida.
 * @returns {import('react').ReactElement} Superficie introductoria responsive.
 */
export function LessonIntroduction(props) {
  const {
    id,
    eyebrow,
    title,
    description,
    objectives = [],
    objectiveTitle = 'Al terminar podrás',
    route = [],
    media,
    lead,
    footer,
    variant,
  } = props;
  const vowel = variant === 'vowel';
  return (
    <article
      className={`education-card lesson-introduction${vowel ? ' vowel-welcome' : ''}`}
      aria-labelledby={id}
    >
      <div className={`lesson-introduction-copy${vowel ? ' vowel-welcome-copy' : ''}`}>
        <p className="journey-eyebrow text-action">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        <p className="journey-reading">{description}</p>
        {lead}
      </div>
      {media && <div className="lesson-introduction-media">{media}</div>}
      <section
        className={`lesson-introduction-objectives${vowel ? ' vowel-welcome-objectives' : ''}`}
        aria-labelledby={`${id}-objectives`}
      >
        <h3 id={`${id}-objectives`}>{objectiveTitle}</h3>
        <ul>
          {objectives.map((objective) => (
            <li key={objective}>{objective}</li>
          ))}
        </ul>
      </section>
      {route.length > 0 && (
        <ol
          className={`lesson-route-preview${vowel ? ' vowel-route-preview' : ''}`}
          aria-label="Vista previa del recorrido"
        >
          {route.map((label, index) => (
            <li key={label}>
              <span>{index + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      )}
      {footer && <div className="lesson-introduction-footer">{footer}</div>}
    </article>
  );
}

/**
 * Superficie compartida para explicaciones breves, recursos visuales y ejemplos contextuales.
 * @param {object} props Texto educativo y composición opcional.
 * @returns {import('react').ReactElement} Contenido educativo en una o dos columnas.
 */
export function LessonContent(props) {
  const { id, eyebrow, title, body, visual, children, className = '' } = props;
  return (
    <article className={`education-card lesson-content ${className}`.trim()} aria-labelledby={id}>
      <header className="lesson-content-heading">
        <p className="journey-eyebrow text-action">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        {body && <p className="journey-reading">{body}</p>}
      </header>
      {visual && <div className="lesson-content-visual">{visual}</div>}
      {children && <div className="lesson-content-details">{children}</div>}
    </article>
  );
}

/**
 * Contenedor semántico reutilizable para una actividad formativa sin imponer su mecánica.
 * @param {object} props Encabezado, ayuda y actividad concreta.
 * @returns {import('react').ReactElement} Actividad con estructura consistente.
 */
export function LessonActivity(props) {
  const { id, eyebrow, title, description, children } = props;
  return (
    <section className="education-card lesson-activity" aria-labelledby={id}>
      <header className="lesson-content-heading">
        <p className="journey-eyebrow text-action">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}
