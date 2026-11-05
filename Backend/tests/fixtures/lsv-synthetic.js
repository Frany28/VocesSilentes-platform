// Geometría sintética exclusivamente para probar software. No representa señas ni un dataset de LSV.
/**
 * Genera una observación numérica identificada para probar contratos, separación y matemática del entrenador.
 * @param {string} label Etiqueta de prueba A o NONE.
 * @param {string} partition train, validation o test.
 * @param {number} offset Variación numérica entre participantes sintéticos.
 * @returns {object} Muestra artificial que nunca se distribuye como modelo educativo.
 */
export function syntheticRecording(label, partition, offset = 0) {
  return {
    version: 1,
    id: `${partition}-${label}`,
    label,
    participantId: `test_${partition}`,
    sessionId: `session_${partition}`,
    partition,
    consent: true,
    reviewStatus: 'APPROVED_LSV',
    reviewerId: 'synthetic_test_reviewer',
    frames: Array.from({ length: 20 }, (_, index) => ({
      t: index * 100,
      hand: 'Right',
      width: 640,
      height: 480,
      points: Array.from({ length: 21 }, (_, point) => [
        0.4 + point * 0.008 + index * 0.0001,
        0.4 +
          point * 0.006 +
          (point > 10 && label === 'NONE' ? 0.15 : 0) +
          (point > 4 ? offset : 0),
        point * 0.0001,
      ]),
    })),
  };
}

/**
 * Crea seis muestras de prueba separadas por participante y grupo, sin validez lingüística.
 * @returns {object[]} Fixture artificial del pipeline.
 */
export function syntheticDataset() {
  return ['train', 'validation', 'test'].flatMap((partition, index) =>
    ['A', 'NONE'].map((label) => syntheticRecording(label, partition, [0, 0.002, 0.001][index])),
  );
}
