import { MicroclassOrbit } from './MicroclassIntroScenes.jsx';
import { formatTime } from './microclass-timeline.js';
import { illustrationCredit } from './vowel-illustrations.js';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 4v16l13-8z" />
  </svg>
);

/**
 * Portada antes de reproducir: la voz y el temporizador solo empiezan con este botón.
 * @param {{total: number, onStart: Function}} props Duración nominal y acción de inicio.
 * @returns {import('react').ReactElement} Portada con botón principal.
 */
export function MicroclassPoster({ total, onStart }) {
  return (
    <div className="mc-scene mc-center">
      <p className="mc-eyebrow">VocesSilentes · Microclase</p>
      <p className="mc-display">Las vocales en LSV</p>
      <MicroclassOrbit />
      <p className="mc-lede">
        Mira cada mano, lee qué la distingue e inténtalo. Duración aproximada: {formatTime(total)}.
      </p>
      <button className="mc-bigplay" type="button" onClick={onStart}>
        <PlayIcon />
        Comenzar la microclase
      </button>
    </div>
  );
}

/**
 * Cierre: invita a continuar y permite volver a ver la clase.
 * @param {{cue: number, onReplay: Function}} props Frase actual y acción para repetir.
 * @returns {import('react').ReactElement} Escena final con créditos.
 */
export function MicroclassOutro({ cue, onReplay }) {
  const later = String(cue === 1);
  return (
    <div className="mc-scene mc-center">
      <p className="mc-eyebrow">VocesSilentes</p>
      <MicroclassOrbit />
      <p className="mc-display">
        Sigue aprendiendo <em>LSV</em>
      </p>
      <ul className="mc-chips mc-chips-center">
        <li className="mc-chip" data-tone="key">
          5 vocales repasadas
        </li>
        <li className="mc-chip" data-on={later}>
          Practica cada vocal
        </li>
        <li className="mc-chip" data-on={later}>
          Continúa con el abecedario
        </li>
      </ul>
      <p className="mc-lede" data-on={later}>
        {illustrationCredit}. Contenido pendiente de revisión por personas competentes en LSV.
      </p>
      <button className="mc-bigplay" type="button" onClick={onReplay}>
        <PlayIcon />
        Ver de nuevo
      </button>
    </div>
  );
}
