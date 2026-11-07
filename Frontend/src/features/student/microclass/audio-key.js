/**
 * Huella estable de una frase (FNV-1a de 32 bits). El generador de audio y el reproductor la usan
 * para asociar cada subtítulo con su archivo: si cambia el texto, cambia la huella y el audio
 * desactualizado deja de usarse en vez de narrar otra cosa.
 * @param {string} text Subtítulo exacto.
 * @returns {string} Huella hexadecimal de 8 caracteres.
 */
export function audioKey(text) {
  let hash = 2166136261;
  for (const character of text) hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Texto que se envía a la voz sintética: igual al subtítulo salvo siglas y nombres que la voz
 * pronunciaría mal. El subtítulo visible no cambia.
 * @param {string} text Subtítulo.
 * @returns {string} Texto para pronunciar.
 */
export function spokenText(text) {
  return text.replaceAll('LSV', 'ele ese uve').replaceAll('VocesSilentes', 'Voces Silentes');
}
