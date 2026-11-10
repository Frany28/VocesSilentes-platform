// Recortes inspeccionados en los originales: excluyen el rótulo inferior sin reconstruir dedos.
// Ningún recorte ni reflejo acredita revisión lingüística. G/Q/R solapan el rótulo con la mano.
const masks = {
  A: [243, 253, 162, 174],
  B: [241, 253, 176, 172],
  C: [256, 253, 150, 177],
  D: [243, 259, 165, 194],
  E: [241, 259, 176, 192],
  F: [256, 259, 166, 192],
  H: [241, 241, 172, 173],
  I: [256, 241, 174, 173],
  K: [241, 252, 176, 177],
  L: [256, 252, 163, 179],
  M: [241, 256, 142, 184],
  N: [241, 256, 155, 184],
  O: [241, 235, 137, 154],
  P: [241, 235, 153, 156],
  S: [241, 236, 166, 161],
  T: [256, 236, 174, 162],
  U: [241, 246, 158, 166],
  V: [241, 246, 155, 167],
  W: [256, 246, 161, 168],
  X: [241, 227, 156, 152],
  Y: [241, 227, 162, 152],
};

/**
 * Decide si la ilustración admite un reflejo orientativo sin texto/flechas invertidos; nunca valida LSV.
 * @param {string} letter Letra del recurso autorizado por el registro existente.
 * @returns {object} Recorte seguro, estado de adaptación y motivo cuando se necesita otra referencia.
 */
export function handReferencePolicy(letter) {
  if (['J', 'Ñ', 'Z'].includes(letter))
    return {
      mode: 'DIRECTIONAL_REFERENCE_REQUIRED',
      message:
        'Original sin adaptar: incluye movimiento direccional. Necesitamos una referencia izquierda específica revisada en LSV.',
    };
  const mask = masks[letter];
  if (!mask)
    return {
      mode: 'HAND_ONLY_RESOURCE_REQUIRED',
      message:
        'Original sin adaptar: necesitamos una referencia izquierda con la mano separada del rótulo y revisión LSV.',
    };
  const [width, height, x, y] = mask;
  return {
    mode: 'STATIC_MIRROR_PREVIEW',
    width,
    height,
    clip: `polygon(0 0, 100% 0, 100% ${(100 * y) / height}%, ${(100 * x) / width}% ${(100 * y) / height}%, ${(100 * x) / width}% 100%, 0 100%)`,
    message:
      'Referencia reflejada orientativa para la mano izquierda; equivalencia lingüística pendiente de revisión LSV.',
  };
}
