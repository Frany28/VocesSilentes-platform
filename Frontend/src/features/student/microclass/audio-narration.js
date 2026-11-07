import manifest from './microclass-audio.json';
import { audioKey } from './audio-key.js';

// Un único elemento de audio para toda la clase: tras el clic en «Comenzar», el navegador permite
// reproducir con sonido en el mismo documento sin pedir otra interacción.
let element = null;
let volume = 1;
let current = null;

function player() {
  if (!element && typeof Audio !== 'undefined') {
    element = new Audio();
    element.preload = 'auto';
  }
  return element;
}

/**
 * Indica si una frase tiene audio grabado en public/media/microclass (ver generate-microclass-audio.mjs).
 * @param {string} text Subtítulo exacto.
 * @returns {boolean} true si hay archivo para la huella del texto.
 */
export function hasAudio(text) {
  return Boolean(manifest.clips[audioKey(text)]);
}

/**
 * Reproduce la narración grabada de una frase y detiene la anterior. Si el archivo falla o el
 * navegador bloquea la reproducción, avisa como terminado: la clase sigue con subtítulos.
 * @param {string} text Subtítulo que se narra.
 * @param {Function} onDone Se llama al terminar, fallar o no poder reproducir.
 * @returns {boolean} false si la frase no tiene audio o no hay soporte de audio.
 */
export function speak(text, onDone) {
  const audio = hasAudio(text) ? player() : null;
  if (!audio) return false;
  const token = {};
  current = token;
  const done = () => {
    if (current !== token) return;
    current = null;
    onDone();
  };
  audio.pause();
  audio.onended = done;
  audio.onerror = done;
  audio.src = `/media/microclass/${audioKey(text)}.mp3`;
  audio.volume = volume;
  const playing = audio.play();
  if (playing?.catch) playing.catch(done);
  return true;
}

/**
 * Detiene la narración en curso; se usa al pausar, cambiar de frase o salir de la clase.
 * @returns {void}
 */
export function stopSpeech() {
  current = null;
  element?.pause();
}

/**
 * Ajusta el volumen de la narración (también de la frase que suena).
 * @param {number} value Volumen entre 0 y 1.
 * @returns {void}
 */
export function setVolume(value) {
  volume = Math.min(1, Math.max(0, value));
  if (element) element.volume = volume;
}
