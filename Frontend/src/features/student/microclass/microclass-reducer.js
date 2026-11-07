import { quizHint, quizLetter } from './microclass-script.js';

// Si el motor de voz no avisa del final, la clase sigue tras este margen.
const SPEECH_LIMIT = 12;
const freshQuiz = { status: 'pending', wrong: [], hint: null };

/**
 * Estado inicial: póster en pausa, sin voz hasta que el estudiante pulse reproducir.
 * @returns {object} Estado de reproducción, narración y pregunta.
 */
export function initialPlayer() {
  return {
    index: 0,
    take: 0,
    started: false,
    playing: false,
    ended: false,
    elapsed: 0,
    speaking: false,
    speechWait: 0,
    voice: true,
    canSpeak: false,
    quiz: freshQuiz,
  };
}

function enter(state, cues, target) {
  const index = Math.max(0, Math.min(cues.length - 1, target));
  const cue = cues[index];
  const quiz = cue.scene.type === 'quiz' && cue.cueIndex === 0 ? freshQuiz : state.quiz;
  return {
    ...state,
    index,
    quiz,
    started: true,
    playing: true,
    ended: false,
    elapsed: 0,
    take: state.take + 1,
    speaking: state.voice && state.canSpeak,
    speechWait: 0,
  };
}

function tick(state, cues, seconds) {
  if (!state.playing) return state;
  const next = { ...state, elapsed: state.elapsed + seconds };
  if (state.speaking) next.speechWait += seconds;
  const cue = cues[state.index];
  const talking = next.speaking && next.speechWait < SPEECH_LIMIT;
  const waiting = cue.waitForAnswer && state.quiz.status === 'pending';
  if (next.elapsed < cue.seconds || talking || waiting) return next;
  if (state.index === cues.length - 1)
    return { ...next, playing: false, speaking: false, ended: true };
  return enter(next, cues, state.index + 1);
}

function answer(state, cues, letter) {
  if (letter === quizLetter)
    return enter({ ...state, quiz: { ...state.quiz, status: 'correct' } }, cues, state.index + 1);
  const quiz = { ...state.quiz, wrong: [...state.quiz.wrong, letter], hint: quizHint(letter) };
  return {
    ...state,
    quiz,
    playing: true,
    take: state.take + 1,
    speaking: state.voice && state.canSpeak,
    speechWait: 0,
  };
}

/**
 * Reducer puro de la microclase. Las frases avanzan por tiempo y esperan a la narración.
 * @param {object} state Estado actual.
 * @param {{type: string, cues: object[]} & Record<string, any>} action Acción con la línea de tiempo.
 * @returns {object} Nuevo estado; nunca guarda respuestas fuera de la sesión de la página.
 */
export function playerReducer(state, action) {
  const { cues } = action;
  switch (action.type) {
    case 'play':
      if (state.started && !state.ended) {
        return enter({ ...state, canSpeak: action.canSpeak }, cues, state.index);
      }
      return enter({ ...state, canSpeak: action.canSpeak }, cues, 0);
    case 'pause':
      return { ...state, playing: false, speaking: false };
    case 'go':
      return enter({ ...state, canSpeak: action.canSpeak }, cues, action.target);
    case 'tick':
      return tick(state, cues, action.seconds);
    case 'spoken':
      return action.take === state.take ? { ...state, speaking: false } : state;
    case 'voice':
      return { ...state, voice: !state.voice, speaking: false };
    case 'answer':
      return answer({ ...state, canSpeak: action.canSpeak }, cues, action.letter);
    case 'reveal':
      return enter(
        { ...state, quiz: { ...state.quiz, status: 'revealed' } },
        cues,
        state.index + 1,
      );
    default:
      return state;
  }
}

/**
 * Subtítulo visible: la pista tras un error, la respuesta revelada o la frase de la línea de tiempo.
 * @param {object} state Estado del reproductor.
 * @param {object} cue Frase actual.
 * @returns {string} Texto que se lee y se narra.
 */
export function captionFor(state, cue) {
  if (cue.waitForAnswer && state.quiz.hint) return state.quiz.hint;
  if (state.quiz.status === 'revealed' && cue.revealText) return cue.revealText;
  return cue.text;
}
