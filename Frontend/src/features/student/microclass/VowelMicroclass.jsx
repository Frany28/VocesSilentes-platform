import { useState } from 'react';
import { MicroclassStage } from './MicroclassStage.jsx';
import { MicroclassControls } from './MicroclassControls.jsx';
import { MicroclassGuide } from './MicroclassGuide.jsx';
import { useMicroclassPlayer } from './use-microclass-player.js';
import { useNarrationStatus } from './use-narration-status.js';
import './microclass.css';
import './microclass-guide.css';
import './microclass-scenes.css';
import './microclass-hand.css';
import './microclass-activities.css';
import './microclass-responsive.css';

/**
 * Microclase audiovisual de las cinco vocales: ilustraciones del manual con acercamientos,
 * subtítulos siempre visibles, narración opcional, repaso y una pregunta. No usa cámara,
 * no hace peticiones de red y no escribe progreso académico.
 * @returns {import('react').ReactElement} Reproductor y guía de texto.
 */
export function VowelMicroclass() {
  const player = useMicroclassPlayer();
  const [bigCaptions, setBigCaptions] = useState(false);
  const { state, caption, actions, timeline, cue } = player;
  const audio = useNarrationStatus();
  const audible = audio === 'ready' || audio === 'loading';
  return (
    <section className="mc-root" aria-labelledby="mc-title">
      <div className="flex flex-col gap-1">
        <p className="journey-eyebrow text-muted">Microclase · ver, leer, escuchar y practicar</p>
        <h3 id="mc-title" className="[font:var(--type-h3)]">
          Las cinco vocales en LSV
        </h3>
        <p className="mc-audio" data-state={audible ? 'on' : 'off'}>
          {audible
            ? 'Con audio: narración en español con la voz de tu navegador. Sube el volumen.'
            : audio === 'none'
              ? 'Tu navegador no tiene una voz en español instalada: la clase sigue con subtítulos. Prueba con Chrome o Edge.'
              : 'Tu navegador no permite narración: la clase sigue con subtítulos.'}
        </p>
      </div>
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
    </section>
  );
}
