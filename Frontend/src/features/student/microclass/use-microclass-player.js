import { useEffect, useMemo, useReducer } from 'react';
import { microclassScenes } from './microclass-script.js';
import { buildTimeline } from './microclass-timeline.js';
import { captionFor, initialPlayer, playerReducer } from './microclass-reducer.js';
import { speak, stopSpeech } from './audio-narration.js';

// La narración es audio grabado; solo falta si el navegador no tiene elemento de audio.
const canSpeak = () => typeof Audio !== 'undefined';

const TICK_MS = 250;

/**
 * Controla la microclase: línea de tiempo, narración opcional y pregunta.
 * La voz empieza solo tras una acción del estudiante y se detiene al pausar o desmontar.
 * @returns {object} Línea de tiempo, estado, frase/escena actual, subtítulo, posición y acciones.
 */
export function useMicroclassPlayer() {
  const timeline = useMemo(() => buildTimeline(microclassScenes), []);
  const { cues } = timeline;
  const [state, dispatch] = useReducer(playerReducer, undefined, initialPlayer);
  const cue = cues[state.index];
  const caption = captionFor(state, cue);
  const { playing, voice, take } = state;

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(
      () => dispatch({ type: 'tick', cues, seconds: TICK_MS / 1000 }),
      TICK_MS,
    );
    return () => clearInterval(id);
  }, [playing, cues]);

  useEffect(() => {
    if (!playing || !voice) {
      stopSpeech();
      return undefined;
    }
    const done = () => dispatch({ type: 'spoken', cues, take });
    if (!speak(caption, done)) Promise.resolve().then(done);
    return stopSpeech;
  }, [playing, voice, take, caption, cues]);

  const actions = useMemo(
    () => ({
      play: () => dispatch({ type: 'play', cues, canSpeak: canSpeak() }),
      pause: () => dispatch({ type: 'pause', cues }),
      go: (target) => dispatch({ type: 'go', cues, target, canSpeak: canSpeak() }),
      toggleVoice: () => dispatch({ type: 'voice', cues }),
      answer: (letter) => dispatch({ type: 'answer', cues, letter, canSpeak: canSpeak() }),
      reveal: () => dispatch({ type: 'reveal', cues }),
    }),
    [cues],
  );

  const position = state.started ? cue.start + Math.min(state.elapsed, cue.seconds) : 0;
  return {
    timeline,
    state,
    cue,
    scene: timeline.scenes[cue.sceneIndex],
    caption,
    position,
    actions,
  };
}
