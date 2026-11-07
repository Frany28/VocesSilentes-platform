import { formatTime } from './microclass-timeline.js';

/**
 * Capítulos y transcripción completa: toda la narración también está por escrito.
 * @param {{timeline: object, current: number, onSelect: Function}} props Línea de tiempo, escena actual y salto.
 * @returns {import('react').ReactElement} Navegación por capítulos y textos desplegables.
 */
export function MicroclassGuide({ timeline, current, onSelect }) {
  return (
    <div className="mc-guide">
      <nav aria-label="Capítulos de la microclase">
        <ol className="mc-chapters">
          {timeline.scenes.map((scene, index) => (
            <li key={scene.id}>
              <button
                type="button"
                aria-current={index === current ? 'step' : undefined}
                onClick={() => onSelect(scene.first)}
              >
                <span>{scene.title}</span>
                <time>{formatTime(scene.start)}</time>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mc-docs">
        <details className="mc-details">
          <summary>Transcripción completa</summary>
          {timeline.scenes.map((scene) => (
            <section key={scene.id} className="mc-transcript">
              <h4>
                {formatTime(scene.start)} · {scene.title}
              </h4>
              {scene.cues.map((cue) => (
                <p key={cue.text}>{cue.text}</p>
              ))}
            </section>
          ))}
        </details>
      </div>
    </div>
  );
}
