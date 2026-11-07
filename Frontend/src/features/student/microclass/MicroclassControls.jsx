import { formatTime } from './microclass-timeline.js';
import { MicroclassVolume } from './MicroclassVolume.jsx';

const icons = {
  play: 'M7 4v16l13-8z',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  prev: 'M6 5h2v14H6zM20 5v14L9 12z',
  next: 'M16 5h2v14h-2zM4 5v14l11-7z',
};
const Glyph = ({ name }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={icons[name]} />
  </svg>
);

/**
 * Controles del reproductor: reproducir, frases, capítulos en la línea de tiempo, voz y tamaño de subtítulos.
 * @param {object} props Propiedades de los controles.
 * @param {object} props.player Resultado de useMicroclassPlayer.
 * @param {boolean} props.bigCaptions Subtítulos ampliados.
 * @param {Function} props.onBigCaptions Alterna el tamaño de subtítulos.
 * @returns {import('react').ReactElement} Barra de controles con objetivos de 44 px.
 */
export function MicroclassControls({ player, bigCaptions, onBigCaptions }) {
  const { state, timeline, position, actions } = player;
  const index = state.index;
  return (
    <div className="mc-controls">
      <button
        className="mc-control"
        data-primary
        type="button"
        aria-label={state.playing ? 'Pausar microclase' : 'Reproducir microclase'}
        onClick={state.playing ? actions.pause : actions.play}
      >
        <Glyph name={state.playing ? 'pause' : 'play'} />
      </button>
      <button
        className="mc-control"
        type="button"
        aria-label="Frase anterior"
        onClick={() => actions.go(index - 1)}
      >
        <Glyph name="prev" />
      </button>
      <button
        className="mc-control"
        type="button"
        aria-label="Frase siguiente"
        onClick={() => (state.started ? actions.go(index + 1) : actions.play())}
      >
        <Glyph name="next" />
      </button>
      <div className="mc-bar" role="group" aria-label="Capítulos de la microclase">
        {timeline.scenes.map((scene) => {
          const done = Math.max(0, Math.min(1, (position - scene.start) / scene.seconds));
          return (
            <button
              key={scene.id}
              type="button"
              className="mc-segment"
              style={{ flexGrow: scene.seconds }}
              aria-label={`${scene.title}, ${formatTime(scene.start)}`}
              onClick={() => actions.go(scene.first)}
            >
              <i style={{ width: `${done * 100}%` }} />
            </button>
          );
        })}
      </div>
      <span className="mc-time">
        {formatTime(position)} / {formatTime(timeline.total)}
      </span>
      <MicroclassVolume muted={!state.voice} onToggle={actions.toggleVoice} />
      <button
        className="mc-control"
        type="button"
        aria-pressed={bigCaptions}
        onClick={onBigCaptions}
      >
        Subtítulos grandes
      </button>
    </div>
  );
}
