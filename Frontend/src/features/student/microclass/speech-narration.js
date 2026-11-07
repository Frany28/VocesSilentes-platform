// Prioriza variantes latinoamericanas; ninguna garantiza acento venezolano.
const preferred = ['es-VE', 'es-419', 'es-CO', 'es-MX', 'es-US', 'es-ES'];
// Referencia viva a la frase en curso: Chrome puede descartarla y no llamar a onend.
let current = null;

function synth() {
  return globalThis.speechSynthesis ?? null;
}

function voices() {
  return synth()?.getVoices() ?? [];
}

function spanishVoice() {
  const spanish = voices().filter((voice) => /^es/i.test(voice.lang));
  const exact = preferred
    .map((tag) => spanish.find((voice) => voice.lang.replace('_', '-') === tag))
    .find(Boolean);
  return exact ?? spanish[0] ?? null;
}

// Pedir la lista al cargar el módulo hace que Chrome empiece a descargar sus voces.
synth()?.getVoices();

/**
 * Estado de la narración. Chrome carga las voces de forma asíncrona: una lista vacía significa
 * «todavía cargando», no «sin voz».
 * @returns {'unsupported'|'loading'|'ready'|'none'} Disponibilidad de voz en español.
 */
export function narrationStatus() {
  if (!synth()) return 'unsupported';
  if (!voices().length) return 'loading';
  return spanishVoice() ? 'ready' : 'none';
}

/**
 * Indica si conviene narrar: hay voz en español o las voces aún no han terminado de cargar.
 * @returns {boolean} false solo si el navegador no tiene síntesis o confirma que no hay voz en español.
 */
export function narrationAvailable() {
  return ['ready', 'loading'].includes(narrationStatus());
}

/**
 * Avisa cuando cambian las voces disponibles (p. ej. al terminar de cargarlas).
 * @param {Function} listener Se llama sin argumentos.
 * @returns {Function} Cancela la suscripción.
 */
export function watchVoices(listener) {
  const engine = synth();
  if (!engine?.addEventListener) return () => {};
  engine.addEventListener('voiceschanged', listener);
  return () => engine.removeEventListener('voiceschanged', listener);
}

/**
 * Lee un texto con la síntesis de voz del navegador. Cancela cualquier lectura anterior.
 * No envía audio ni texto a servicios propios.
 * @param {string} text Subtítulo que se narra.
 * @param {Function} onDone Se llama al terminar, fallar o ser cancelada la lectura.
 * @returns {boolean} false si no hay síntesis o el navegador confirma que no tiene voz en español.
 */
export function speak(text, onDone) {
  const engine = synth();
  if (!engine || !narrationAvailable()) return false;
  // La frase anterior ya no debe avisar de su final: la sustituye esta.
  if (current) current.onend = current.onerror = null;
  engine.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = spanishVoice();
  // Sin lista de voces todavía, el idioma basta para que el navegador use su voz en español.
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? 'es-ES';
  utterance.rate = 0.95;
  utterance.onend = onDone;
  utterance.onerror = onDone;
  current = utterance;
  engine.speak(utterance);
  // Chrome puede dejar la cola en pausa tras cancel(); reanudar es inocuo si no lo está.
  engine.resume?.();
  return true;
}

/**
 * Detiene la narración en curso; se usa al pausar, cambiar de frase o salir de la clase.
 * @returns {void}
 */
export function stopSpeech() {
  current = null;
  synth()?.cancel();
}
