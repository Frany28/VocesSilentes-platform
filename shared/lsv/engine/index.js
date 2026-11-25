// Motor único de reconocimiento del abecedario LSV. Las lecciones lo consumen desde aquí; ninguna
// pantalla debe duplicar normalización, rasgos, reglas por letra ni lógica temporal.
// Arquitectura: docs/HAND_RECOGNITION_ARCHITECTURE.md.
export { canonicalHand, validLandmarks } from './landmarks.js';
export { handFeatures } from './features.js';
export { describeHand } from './descriptors.js';
export { THRESHOLDS_STATUS } from './thresholds.js';
export {
  BLOCKED_LETTERS,
  MOTION_RECOGNIZABLE,
  STATIC_RECOGNIZABLE,
  engineSupports,
  letterSpec,
} from './alphabet-spec.js';
export { analyzeHand, classifyShape, evaluateTarget, scoreShape } from './handshape.js';
export { evaluateMotionLetter, motionFeatures, motionSeries } from './motion.js';
export {
  RECOGNITION_STATES,
  TIMING,
  createLetterRecognizer,
  selectActiveHand,
} from './recognizer.js';
export { analyzeCapture } from './capture-analysis.js';
export { attemptMatches, combineEvidence } from './hybrid.js';
export { evaluateEngine, predictCapture } from './evaluation.js';
