import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { MicroclassVowelScene } from '../microclass/MicroclassVowelScene.jsx';
import { microclassScenes } from '../microclass/microclass-script.js';
import { speak, stopSpeech } from '../microclass/audio-narration.js';

/**
 * Reproduce el capítulo ilustrado y narrado de una vocal con controles, subtítulo y repetición.
 * No se presenta como video de una persona signante ni como demostración lingüísticamente validada.
 * @param {{letter: string}} props Vocal del capítulo existente.
 * @returns {import('react').ReactElement} Demostración segmentada reutilizando animación y audio grabado.
 */
export function VowelDemonstration({ letter }) {
  const scene = useMemo(
    () => microclassScenes.find((item) => item.id === `vowel-${letter}`),
    [letter],
  );
  const [cue, setCue] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = scene.cues[cue];
  useEffect(() => {
    if (!playing) return undefined;
    speak(current.text, () => {});
    const started = performance.now();
    const tick = setInterval(
      () => setElapsed(Math.min(current.seconds, (performance.now() - started) / 1000)),
      250,
    );
    const finish = setTimeout(() => {
      if (cue === scene.cues.length - 1) setPlaying(false);
      else {
        setCue((value) => value + 1);
        setElapsed(0);
      }
    }, current.seconds * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(finish);
      stopSpeech();
    };
  }, [playing, cue, current, scene.cues.length]);
  const go = (next) => {
    stopSpeech();
    setCue(Math.max(0, Math.min(scene.cues.length - 1, next)));
    setElapsed(0);
    setPlaying(false);
  };
  const replay = () => {
    setCue(0);
    setElapsed(0);
    setPlaying(true);
  };
  return (
    <section className="vowel-demo" aria-label={`Demostración ilustrada de la vocal ${letter}`}>
      <div className="vowel-demo-stage">
        <MicroclassVowelScene
          letter={letter}
          cue={cue}
          elapsed={elapsed}
          seconds={current.seconds}
        />
      </div>
      <p className="vowel-demo-caption" aria-live="polite">
        {current.text}
      </p>
      <div className="vowel-demo-controls" aria-label="Controles de la demostración">
        <Button
          variant="secondary"
          icon={null}
          onClick={() => {
            if (!playing) setElapsed(0);
            setPlaying((value) => !value);
          }}
        >
          {playing ? 'Pausar' : 'Reproducir'}
        </Button>
        <button type="button" disabled={cue === 0} onClick={() => go(cue - 1)}>
          Anterior
        </button>
        <span aria-label={`Fragmento ${cue + 1} de ${scene.cues.length}`}>
          {cue + 1} / {scene.cues.length}
        </span>
        <button type="button" disabled={cue === scene.cues.length - 1} onClick={() => go(cue + 1)}>
          Siguiente
        </button>
        <button type="button" onClick={replay}>
          Repetir explicación
        </button>
      </div>
      <p className="text-muted vowel-demo-note">
        Demostración ilustrada y narrada con recursos del proyecto. Revisión lingüística LSV
        pendiente; no sustituye un video validado de una persona signante.
      </p>
    </section>
  );
}
