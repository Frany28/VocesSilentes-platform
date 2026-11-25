import { canonicalHand } from './landmarks.js';
import { handFeatures } from './features.js';
import { describeHand } from './descriptors.js';
import { STATIC_RECOGNIZABLE, shapeSpec } from './alphabet-spec.js';

// Reglas de decisión (sin calibrar; ver thresholds.js).
export const DECISION = Object.freeze({
  criticalMinimum: 0.5, // toda restricción crítica debe alcanzarlo
  meanMinimum: 0.65, // media ponderada mínima para declarar compatibilidad
  rivalMargin: 0.08, // ventaja mínima frente a otra letra también compatible
});

/**
 * Evalúa una configuración frente a una especificación estática.
 * @param {object} descriptors Descriptores de describeHand.
 * @param {object} spec Especificación con restricciones.
 * @returns {{compatible: boolean, score: number, results: object[]}} Detalle por restricción.
 */
export function scoreShape(descriptors, spec) {
  const results = spec.constraints.map((constraint) => ({
    id: constraint.id,
    part: constraint.part,
    hint: constraint.hint,
    critical: constraint.critical,
    score: constraint.score(descriptors),
  }));
  if (!results.length) return { compatible: false, score: 0, results };
  const weight = (item) => (item.critical ? 2 : 1);
  const mean =
    results.reduce((sum, item) => sum + item.score * weight(item), 0) /
    results.reduce((sum, item) => sum + weight(item), 0);
  const criticalMin = Math.min(
    ...results.filter((item) => item.critical).map((item) => item.score),
    1,
  );
  return {
    compatible: criticalMin >= DECISION.criticalMinimum && mean >= DECISION.meanMinimum,
    // Puntuación de ranking: penaliza la restricción crítica más débil.
    score: 0.5 * mean + 0.5 * criticalMin,
    mean,
    criticalMin,
    results,
  };
}

/**
 * Analiza una observación de una mano: normaliza, extrae rasgos y los describe.
 * @param {number[][]} points 21 puntos MediaPipe sin reflejar.
 * @param {{width?: number, height?: number, hand?: string|null}} [options] Aspecto y lateralidad.
 * @returns {object|null} Rasgos y descriptores, o null si la mano es degenerada.
 */
export function analyzeHand(points, options) {
  const canonical = canonicalHand(points, options);
  if (!canonical) return null;
  const features = handFeatures(canonical.points);
  return { canonical, features, descriptors: describeHand(features) };
}

/**
 * Clasificación de conjunto abierto sobre las letras estáticas evaluables. No fuerza una letra:
 * devuelve UNKNOWN sin ninguna compatible y AMBIGUOUS si dos compatibles quedan demasiado cerca.
 * @param {object} descriptors Descriptores de una observación.
 * @param {string[]} [labels] Letras candidatas.
 * @returns {{status: string, label: string|null, ranking: object[]}} Decisión y ranking completo.
 */
export function classifyShape(descriptors, labels = STATIC_RECOGNIZABLE) {
  const ranking = labels
    .map((label) => ({ label, ...scoreShape(descriptors, shapeSpec(label)) }))
    .sort((a, b) => b.score - a.score);
  const compatible = ranking.filter((item) => item.compatible);
  if (!compatible.length) return { status: 'UNKNOWN', label: null, ranking };
  if (compatible.length > 1 && compatible[0].score - compatible[1].score < DECISION.rivalMargin)
    return {
      status: 'AMBIGUOUS',
      label: null,
      candidates: compatible.slice(0, 2).map((item) => item.label),
      ranking,
    };
  return { status: 'RECOGNIZED', label: compatible[0].label, ranking };
}

/**
 * Compara la mano con una letra objetivo y con sus rivales; base de la retroalimentación educativa.
 * @param {object} descriptors Descriptores de una observación.
 * @param {string} target Letra (o postura auxiliar) objetivo.
 * @returns {object} MATCH, CONFUSED (otra letra encaja mejor) o ADJUST con la corrección prioritaria.
 */
export function evaluateTarget(descriptors, target) {
  const spec = shapeSpec(target);
  if (!spec || !spec.constraints.length) return { verdict: 'UNSUPPORTED', target };
  const own = scoreShape(descriptors, spec);
  const rivals = STATIC_RECOGNIZABLE.filter((label) => label !== target)
    .map((label) => ({ label, ...scoreShape(descriptors, shapeSpec(label)) }))
    .filter((item) => item.compatible)
    .sort((a, b) => b.score - a.score);
  const rival = rivals[0] ?? null;
  // Correcciones: primero restricciones críticas incumplidas, luego las de menor puntuación.
  const failing = own.results
    .filter((item) => item.score < DECISION.criticalMinimum)
    .sort((a, b) => Number(b.critical) - Number(a.critical) || a.score - b.score);
  if (own.compatible && (!rival || own.score - rival.score >= -DECISION.rivalMargin / 2))
    return { verdict: 'MATCH', target, score: own.score, own, rival, failing };
  if (rival && (!own.compatible || rival.score > own.score))
    return { verdict: 'CONFUSED', target, score: own.score, own, rival, failing };
  return { verdict: 'ADJUST', target, score: own.score, own, rival, failing };
}
