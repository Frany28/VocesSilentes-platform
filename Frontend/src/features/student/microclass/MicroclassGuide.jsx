import { formatTime } from './microclass-timeline.js';
import { illustrationCredit } from './vowel-illustrations.js';

/**
 * Capítulos, transcripción completa y notas de origen: toda la narración también está por escrito.
 * @param {{timeline: object, current: number, onSelect: Function}} props Línea de tiempo, escena actual y salto.
 * @returns {import('react').ReactElement} Navegación por capítulos y textos desplegables.
 */
export function MicroclassGuide({ timeline, current, onSelect }) {
  return (
    <div className="mc-guide">
      <nav className="mc-chapter-nav" aria-label="Capítulos de la microclase">
        <p className="mc-chapter-heading">
          Explora la microclase
          <small>{timeline.scenes.length} capítulos · Selecciona para ir a una escena</small>
        </p>
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
        <details className="mc-details">
          <summary>Fuentes y límites</summary>
          <p>
            {illustrationCredit}, páginas 5 y 6. Las explicaciones describen esas ilustraciones; la
            clase no añade movimientos ni dibuja manos nuevas.
          </p>
          <p>
            La fuente no describe la orientación de la palma ni la posición de la mano respecto al
            cuerpo. Observa esos detalles en cada ilustración. El contenido sigue pendiente de
            revisión por personas competentes en LSV.
          </p>
          <p>
            La narración usa la voz en español de tu navegador. Si no hay voz disponible, la clase
            funciona con subtítulos. La pregunta no se guarda ni certifica tu ejecución de la seña.
          </p>
        </details>
      </div>
    </div>
  );
}
