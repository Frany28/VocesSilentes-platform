import { useState } from 'react';
import { MicroclassStage } from './MicroclassStage.jsx';
import { MicroclassControls } from './MicroclassControls.jsx';
import { MicroclassGuide } from './MicroclassGuide.jsx';
import { useMicroclassPlayer } from './use-microclass-player.js';
import './microclass.css';
import './microclass-guide.css';

/**
 * Microclase audiovisual de las cinco vocales: ilustraciones del manual con acercamientos,
 * subtítulos siempre visibles, narración grabada con volumen, repaso y una pregunta. No usa cámara,
 * no hace peticiones de red y no escribe progreso académico.
 * @returns {import('react').ReactElement} Reproductor y guía de texto.
 */
export function VowelMicroclass() {
  const player = useMicroclassPlayer();
  const [bigCaptions, setBigCaptions] = useState(false);
  const { state, caption, actions, timeline, cue } = player;
  return (
    <section className="mc-root" aria-labelledby="mc-title">
      <div className="mc-layout">
        <header className="mc-heading">
          <h2 id="mc-title" className="[font:var(--type-subtitle)]">
            Las cinco vocales, en una microclase
          </h2>
          <p className="text-muted">Narración opcional y subtítulos siempre visibles.</p>
        </header>
        <div className="mc-player">
          <MicroclassStage player={player} />
          <p
            className="mc-captions"
            data-size={bigCaptions ? 'large' : undefined}
            aria-live={state.voice ? 'off' : 'polite'}
          >
            {state.started
              ? caption
              : 'Pulsa «Comenzar la microclase». Los subtítulos aparecerán aquí.'}
          </p>
          <MicroclassControls
            player={player}
            bigCaptions={bigCaptions}
            onBigCaptions={() => setBigCaptions((value) => !value)}
          />
        </div>
        <MicroclassGuide
          timeline={timeline}
          current={state.started ? cue.sceneIndex : -1}
          onSelect={actions.go}
        />
      </div>
    </section>
  );
}
