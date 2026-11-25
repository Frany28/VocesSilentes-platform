import { TIPS } from './landmarks.js';
import { analyzeHand, classifyShape, evaluateTarget } from './handshape.js';
import { MOTION_SPECS, engineSupports } from './alphabet-spec.js';
import { evaluateMotionLetter, mostFrequent } from './motion.js';

// Tiempos de la máquina de estados (SIN CALIBRAR con estudiantes; ver HAND_RECOGNITION_TESTING.md).
export const TIMING = Object.freeze({
  holdMs: 800, // postura estática compatible y quieta antes de confirmar
  analyzeMs: 250, // evidencia mínima antes de sugerir correcciones
  hintSwitchMs: 600, // una corrección nueva debe dominar este tiempo para sustituir a la anterior
  lostGraceMs: 400, // pérdidas breves del detector no reinician el intento
  unrecognizedMs: 1500, // sin ninguna letra compatible durante este tiempo
  windowMs: 700, // ventana de votación de veredictos por fotograma
  motionWindowMs: 3000, // memoria de una letra con movimiento
  maxStaticSpeed: 2.5, // palmas/s de las puntas: por encima se considera transición
  edgeMargin: 0.01,
});

export const RECOGNITION_STATES = Object.freeze([
  'SEARCHING', // sin mano visible
  'DETECTED', // mano visible, aún sin evidencia suficiente
  'ANALYZING', // acumulando fotogramas
  'ADJUST', // configuración incompleta: hay una corrección concreta
  'HOLD', // configuración compatible: mantener la posición (o completar el movimiento)
  'MATCH', // configuración compatible y estable (o movimiento completo)
  'UNRECOGNIZED', // ninguna letra compatible durante un tiempo razonable
  'UNSUPPORTED', // la letra no tiene rasgos verificables en el motor
]);

const messages = {
  SEARCHING: 'Coloca tu mano dentro de la cámara.',
  PARTIAL: 'Coloca toda la mano dentro de la cámara.',
  TWO_HANDS: 'Deja visible solo la mano que forma la letra.',
  ANALYZING: 'Analizando la seña…',
  HOLD: 'Mantén la posición.',
  MOVE: 'Ahora realiza el movimiento de la letra.',
  COMPLETE: 'Completa el movimiento.',
  MATCH: 'Configuración compatible con la referencia.',
  UNRECOGNIZED: 'No reconocemos esta configuración. Compárala con la referencia.',
  UNSUPPORTED: 'Esta letra todavía no tiene comprobación automática. Practica con la referencia.',
  SLOW: 'Mantén la mano quieta un momento.',
  LIGHT: 'No vemos tu mano con claridad. Mejora la iluminación o acércala.',
};

/**
 * Elige la mano que ejecuta la letra cuando hay más de una: mantiene la identidad del track activo
 * y, si no existe, prefiere la mano más grande (más cercana) y estable. Evita intercambios de
 * identidad sin depender del orden de salida de MediaPipe.
 * @param {object[]} observations Observaciones del tracker con trackId.
 * @param {string|null} activeTrack Track activo anterior.
 * @returns {object|null} Observación elegida.
 */
export function selectActiveHand(observations, activeTrack) {
  if (!observations?.length) return null;
  const same = observations.find((item) => item.trackId && item.trackId === activeTrack);
  if (same) return same;
  const size = (item) => {
    const xs = item.points.map((point) => point[0]);
    const ys = item.points.map((point) => point[1]);
    return Math.max(...xs) - Math.min(...xs) + (Math.max(...ys) - Math.min(...ys));
  };
  return [...observations].sort(
    (a, b) => Number(Boolean(b.stable)) - Number(Boolean(a.stable)) || size(b) - size(a),
  )[0];
}

/**
 * @param {number[][]} points Puntos de imagen.
 * @returns {boolean} Alguna punta toca el borde de la imagen.
 */
export function touchesEdge(points) {
  return TIPS.some((index) =>
    points[index]
      .slice(0, 2)
      .some((value) => value <= TIMING.edgeMargin || value >= 1 - TIMING.edgeMargin),
  );
}

function tipSpeed(previous, current, aspect, palm) {
  if (!previous) return 0;
  const elapsed = (current.t - previous.t) / 1000;
  if (elapsed <= 0) return 0;
  const moved =
    TIPS.reduce(
      (sum, index) =>
        sum +
        Math.hypot(
          (current.points[index][0] - previous.points[index][0]) * aspect,
          current.points[index][1] - previous.points[index][1],
        ),
      0,
    ) / TIPS.length;
  return moved / palm / elapsed;
}

/**
 * Reconocedor en vivo para una letra objetivo. Recibe los paquetes de createHandTracker, uno por
 * fotograma, y devuelve un estado educativo estable: una única predicción nunca aprueba la letra,
 * las transiciones no cuentan, y las correcciones no cambian en cada fotograma.
 * @param {{target: string}} options Letra que practica el estudiante.
 * @returns {{update: Function, reset: Function}} update(paquete) → estado.
 */
export function createLetterRecognizer({ target }) {
  const motion = Boolean(MOTION_SPECS[target]);
  const supported = engineSupports(target);
  let state;
  const reset = () => {
    state = {
      activeTrack: null,
      lastSeen: null,
      votes: [],
      matchSince: null,
      matched: false,
      hint: null,
      hintCandidate: null,
      hintSince: null,
      unknownSince: null,
      frames: [],
      previous: null,
      lowScoreSince: null,
    };
  };
  reset();

  const stableHint = (candidate, now) => {
    if (!candidate) return state.hint;
    if (!state.hint) {
      state.hint = candidate;
      state.hintCandidate = candidate;
      state.hintSince = now;
      return state.hint;
    }
    if (candidate === state.hint) {
      state.hintCandidate = candidate;
      state.hintSince = now;
      return state.hint;
    }
    if (candidate !== state.hintCandidate) {
      state.hintCandidate = candidate;
      state.hintSince = now;
    } else if (now - state.hintSince >= TIMING.hintSwitchMs) state.hint = candidate;
    return state.hint;
  };

  const result = (id, extra = {}) => ({
    state: id,
    target,
    message: extra.message ?? messages[id],
    ...extra,
  });

  const update = (packet) => {
    const now = packet?.t ?? 0;
    if (!supported) return result('UNSUPPORTED');
    const observation = selectActiveHand(packet?.observations, state.activeTrack);
    if (!observation) {
      // Pérdida breve: se conserva el estado anterior sin aprobar ni reiniciar.
      if (state.lastSeen !== null && now - state.lastSeen <= TIMING.lostGraceMs)
        return result('ANALYZING', { message: messages.ANALYZING, lost: true });
      const matched = state.matched;
      reset();
      return result('SEARCHING', { matchedBefore: matched });
    }
    if ((observation.trackId ?? null) !== state.activeTrack) {
      // Otra mano u otro track: un intento nuevo, sin heredar votos ni movimiento.
      reset();
      state.activeTrack = observation.trackId ?? null;
    }
    state.lastSeen = now;
    const hand = observation.hand ?? (observation.score >= 0.65 ? observation.rawHand : null);
    const frame = {
      t: now,
      width: packet.width,
      height: packet.height,
      hand,
      points: observation.points,
    };
    if (!hand) return result('DETECTED', { message: messages.ANALYZING });
    if (packet.ambiguous || packet.count > 1)
      return result('ADJUST', { hint: messages.TWO_HANDS, message: messages.TWO_HANDS, hand });
    if (touchesEdge(observation.points)) {
      state.matchSince = null;
      return result('ADJUST', { hint: messages.PARTIAL, message: messages.PARTIAL, hand });
    }
    const analysis = analyzeHand(observation.points, frame);
    if (!analysis) return result('DETECTED', { message: messages.ANALYZING, hand });
    // Confianza de lateralidad baja y persistente: indicio (heurístico) de imagen poco nítida.
    if ((observation.score ?? 1) < 0.5) state.lowScoreSince ??= now;
    else state.lowScoreSince = null;
    frame.analysis = analysis;
    const aspect = packet.width / packet.height;
    const speed = tipSpeed(state.previous, frame, aspect, analysis.canonical.palm);
    state.previous = frame;
    state.frames = [...state.frames, frame].filter(
      (item) => now - item.t <= (motion ? TIMING.motionWindowMs : TIMING.windowMs),
    );
    if (state.frames.length < 2 || now - state.frames[0].t < TIMING.analyzeMs)
      return result('ANALYZING', { hand });
    if (state.lowScoreSince !== null && now - state.lowScoreSince > 1000)
      return result('ADJUST', { hint: messages.LIGHT, message: messages.LIGHT, hand });

    if (motion) return updateMotion(now, hand);

    const evaluation = evaluateTarget(analysis.descriptors, target);
    state.votes = [...state.votes, { t: now, evaluation, speed }].filter(
      (vote) => now - vote.t <= TIMING.windowMs,
    );
    const matches = state.votes.filter((vote) => vote.evaluation.verdict === 'MATCH').length;
    const majority = matches / state.votes.length >= 0.7;
    const still = speed <= TIMING.maxStaticSpeed;
    if (evaluation.verdict === 'MATCH' && majority) {
      state.unknownSince = null;
      if (!still) {
        state.matchSince = null;
        return result('HOLD', { message: messages.SLOW, hand, progress: 0 });
      }
      state.matchSince ??= now;
      const progress = Math.min(1, (now - state.matchSince) / TIMING.holdMs);
      if (progress >= 1) {
        state.matched = true;
        return result('MATCH', { hand, progress: 1, score: evaluation.score });
      }
      return result('HOLD', { hand, progress });
    }
    state.matchSince = null;
    const classification = classifyShape(analysis.descriptors);
    const unknown =
      classification.status === 'UNKNOWN' &&
      evaluation.verdict !== 'MATCH' &&
      evaluation.score < 0.5;
    if (unknown) state.unknownSince ??= now;
    else state.unknownSince = null;
    if (state.unknownSince !== null && now - state.unknownSince >= TIMING.unrecognizedMs)
      return result('UNRECOGNIZED', { hand });
    const hints = state.votes.flatMap((vote) =>
      vote.evaluation.verdict === 'MATCH' ? [] : [vote.evaluation.failing?.[0]?.hint],
    );
    const hint = stableHint(mostFrequent(hints), now);
    const rival =
      evaluation.verdict === 'CONFUSED' && evaluation.rival ? evaluation.rival.label : null;
    return result('ADJUST', {
      hand,
      hint,
      rival,
      message: hint ?? messages.UNRECOGNIZED,
    });
  };

  const updateMotion = (now, hand) => {
    const evaluation = evaluateMotionLetter(state.frames, target);
    if (evaluation.verdict === 'MATCH') {
      state.matched = true;
      return result('MATCH', { hand, progress: 1 });
    }
    if (state.matched) return result('MATCH', { hand, progress: 1 });
    if (evaluation.verdict === 'ADJUST_SHAPE') {
      const hint = stableHint(evaluation.hint, now);
      return result('ADJUST', { hand, hint, message: hint ?? messages.UNRECOGNIZED });
    }
    if (evaluation.verdict === 'INCOMPLETE_MOTION')
      return result('HOLD', { hand, message: messages.COMPLETE, progress: evaluation.progress });
    if (evaluation.verdict === 'NEEDS_MOTION')
      return result('HOLD', { hand, message: messages.MOVE, progress: evaluation.progress });
    return result('ANALYZING', { hand });
  };

  return { update, reset };
}
