/**
 * Las fichas carecen de rótulo incrustado. Solo se reflejan las referencias sin flechas.
 * @param {string} letter Letra de la referencia.
 * @returns {{mode: string, message: string}} Disponibilidad y límites del reflejo orientativo.
 */
export function handReferencePolicy(letter) {
  if (['J', 'Ñ', 'Z'].includes(letter))
    return {
      mode: 'DIRECTIONAL_REFERENCE_REQUIRED',
      message:
        'Original sin adaptar: incluye movimiento direccional. Necesitamos una referencia izquierda específica revisada en LSV.',
    };
  return {
    mode: 'STATIC_MIRROR_PREVIEW',
    message:
      'Referencia reflejada orientativa para la mano izquierda; equivalencia lingüística pendiente de revisión LSV.',
  };
}
