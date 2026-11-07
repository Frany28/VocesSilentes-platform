import { useState } from 'react';
import { setVolume } from './audio-narration.js';

const SPEAKER = 'M4 9v6h4l5 4V5L8 9H4z';
const WAVES = 'M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12';
const CROSS = 'M16 9l5 6M21 9l-5 6';

/**
 * Sonido de la narración: silenciar/activar y volumen. Silenciar detiene el audio y la clase sigue
 * con subtítulos; al reactivarlo, la frase actual se escucha desde el principio.
 * @param {{muted: boolean, onToggle: Function}} props Estado de silencio y acción para alternarlo.
 * @returns {import('react').ReactElement} Botón de silencio y control deslizante de volumen.
 */
export function MicroclassVolume({ muted, onToggle }) {
  const [level, setLevel] = useState(1);
  return (
    <div className="mc-volume">
      <button
        className="mc-control"
        type="button"
        aria-label={muted ? 'Activar sonido' : 'Silenciar'}
        aria-pressed={muted}
        onClick={onToggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d={SPEAKER} />
          <path d={muted ? CROSS : WAVES} className="mc-volume-stroke" />
        </svg>
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={level}
        disabled={muted}
        aria-label="Volumen de la narración"
        onChange={(event) => {
          const value = Number(event.target.value);
          setLevel(value);
          setVolume(value);
        }}
      />
    </div>
  );
}
