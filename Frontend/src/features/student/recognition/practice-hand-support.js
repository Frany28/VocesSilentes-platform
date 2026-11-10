/**
 * Comprueba ejemplos reales de la mano elegida para la letra y NONE; no afirma suficiencia estadística.
 * @param {object|null} model Modelo experimental cargado.
 * @param {string|undefined} letter Letra objetivo; undefined permite cualquier vocal conocida.
 * @param {string} hand Left o Right del detector original.
 * @returns {boolean} Hay ejemplos auténticos compatibles; los aumentos solos no habilitan esta práctica.
 */
export function hasRealHandExamples(model, letter, hand) {
  if (!model) return false;
  const vowels = letter ? [letter] : model.labels.filter((label) => label !== 'NONE');
  const examples =
    model.augmentation || model.augmentedAudit?.length
      ? (model.sampleAudit ?? []).filter((sample) => sample.sampleKind === 'REAL')
      : model.prototypes;
  return (
    examples.some((s) => vowels.includes(s.label) && s.hand === hand) &&
    examples.some((s) => s.label === 'NONE' && s.hand === hand)
  );
}
