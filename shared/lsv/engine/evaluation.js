import { classificationMetrics } from '../metrics.js';
import { MOTION_RECOGNIZABLE, STATIC_RECOGNIZABLE, letterSpec } from './alphabet-spec.js';
import { analyzeHand, classifyShape } from './handshape.js';
import { evaluateMotionLetter } from './motion.js';
import { analyzeCapture } from './capture-analysis.js';
import { TIMING } from './recognizer.js';

/**
 * Predicción de conjunto abierto de un intento completo, sin conocer la letra pedida.
 * - Una letra con movimiento solo se predice si su movimiento completo se verifica.
 * - Una letra estática exige una racha continua reconocida de al menos TIMING.holdMs.
 * - Sin ninguna letra compatible → NONE; con evidencia ambigua → UNSURE.
 * @param {object[]} frames Frames {t, width, height, hand, points}.
 * @param {string[]} labels Etiquetas evaluadas (incluida NONE).
 * @returns {string} Letra, NONE o UNSURE.
 */
export function predictCapture(frames, labels) {
  for (const letter of MOTION_RECOGNIZABLE.filter((item) => labels.includes(item)))
    if (evaluateMotionLetter(frames, letter).verdict === 'MATCH') return letter;
  const candidates = STATIC_RECOGNIZABLE.filter((label) => labels.includes(label));
  const runs = new Map();
  let current = null;
  let start = null;
  let ambiguous = 0;
  let unknown = 0;
  for (const frame of frames) {
    const analysis = analyzeHand(frame.points, frame);
    const decision = analysis ? classifyShape(analysis.descriptors, candidates) : null;
    if (decision?.status === 'AMBIGUOUS') ambiguous += 1;
    if (!decision || decision.status === 'UNKNOWN') unknown += 1;
    const label = decision?.status === 'RECOGNIZED' ? decision.label : null;
    if (label !== current) {
      current = label;
      start = frame.t;
    }
    if (label) runs.set(label, Math.max(runs.get(label) ?? 0, frame.t - start));
  }
  const best = [...runs.entries()].sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] >= TIMING.holdMs) return best[0];
  if (labels.includes('NONE') && unknown >= frames.length * 0.6) return 'NONE';
  return ambiguous || best ? 'UNSURE' : labels.includes('NONE') ? 'NONE' : 'UNSURE';
}

/**
 * Evalúa el motor geométrico sobre muestras reales ya validadas (validateRecording).
 * No entrena ni ajusta umbrales: solo mide. Separar participantes por partición es responsabilidad
 * del protocolo de captura (docs/LSV_DATASET_STRATEGY.md).
 * @param {object[]} samples Muestras {label, frames, observedHand, participantId}.
 * @param {string[]} labels Etiquetas del experimento (incluida NONE).
 * @returns {object} Métricas de conjunto abierto, verificación por objetivo, por mano y latencia.
 */
export function evaluateEngine(samples, labels) {
  const rows = [];
  const verification = { accepted: 0, rejected: 0, falseAcceptances: 0, impostorTrials: 0 };
  const byHand = {};
  const timings = [];
  for (const sample of samples) {
    const start = globalThis.performance.now();
    const predicted = predictCapture(sample.frames, labels);
    timings.push((globalThis.performance.now() - start) / sample.frames.length);
    rows.push({ expected: sample.label, predicted, hand: sample.observedHand });
    (byHand[sample.observedHand] ??= []).push({ expected: sample.label, predicted });
    if (sample.label !== 'NONE' && letterSpec(sample.label)) {
      // Verificación con la letra pedida: tasa de rechazos incorrectos.
      if (analyzeCapture(sample.frames, sample.label).verdict === 'MATCH')
        verification.accepted += 1;
      else verification.rejected += 1;
    }
    // Ensayos impostores: la misma ejecución presentada como cada letra parecida.
    const similar =
      sample.label === 'NONE'
        ? labels.filter((label) => label !== 'NONE')
        : (letterSpec(sample.label)?.similar ?? []).filter((label) => labels.includes(label));
    for (const impostor of similar) {
      verification.impostorTrials += 1;
      if (analyzeCapture(sample.frames, impostor).verdict === 'MATCH')
        verification.falseAcceptances += 1;
    }
  }
  const ratio = (a, b) => (b ? a / b : null);
  timings.sort((a, b) => a - b);
  return {
    engine: 'LSV_GEOMETRIC_ENGINE_V1',
    samples: samples.length,
    participants: new Set(samples.map((sample) => sample.participantId)).size,
    openSet: classificationMetrics(
      rows.map(({ expected, predicted }) => ({ expected, predicted })),
      labels,
    ),
    byHand: Object.fromEntries(
      Object.entries(byHand).map(([hand, handRows]) => [
        hand,
        { samples: handRows.length, ...classificationMetrics(handRows, labels) },
      ]),
    ),
    verification: {
      ...verification,
      falseRejectionRate: ratio(
        verification.rejected,
        verification.accepted + verification.rejected,
      ),
      falseAcceptanceRate: ratio(verification.falseAcceptances, verification.impostorTrials),
    },
    latencyMsPerFrame: timings.length
      ? { median: timings[timings.length >> 1], p95: timings[Math.floor(timings.length * 0.95)] }
      : null,
    predictions: rows,
  };
}
