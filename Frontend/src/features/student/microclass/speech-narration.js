// Prioriza variantes latinoamericanas; ninguna garantiza acento venezolano.
const preferred = ['es-VE', 'es-419', 'es-CO', 'es-MX', 'es-US', 'es-ES'];

function synth() {
  return globalThis.speechSynthesis ?? null;
}

function spanishVoice() {
  const voices = synth()?.getVoices() ?? [];
  const spanish = voices.filter((voice) => /^es/i.test(voice.lang));
  const exact = preferred
    .map((tag) => spanish.find((voice) => voice.lang.replace('_', '-') === tag))
    .find(Boolean);
  return exact ?? spanish[0] ?? null;
}

/**
 * Indica si el navegador ofrece una voz en español; sin ella la clase funciona con subtítulos.
 * @returns {boolean} true cuando hay síntesis de voz en español.
 */
export function narrationAvailable() {
  return Boolean(spanishVoice());
}

/**
 * Lee un texto con la síntesis de voz del navegador. Cancela cualquier lectura anterior.
 * No envía audio ni texto a servicios propios.
 * @param {string} text Subtítulo que se narra.
 * @param {Function} onDone Se llama al terminar, fallar o ser cancelada la lectura.
 * @returns {boolean} false si no hay voz en español y no se inició lectura.
 */
export function speak(text, onDone) {
  const engine = synth();
  const voice = spanishVoice();
  if (!engine || !voice) return false;
  engine.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.95;
  utterance.onend = onDone;
  utterance.onerror = onDone;
  engine.speak(utterance);
  return true;
}

/**
 * Detiene la narración en curso; se usa al pausar, cambiar de frase o salir de la clase.
 * @returns {void}
 */
export function stopSpeech() {
  synth()?.cancel();
}
