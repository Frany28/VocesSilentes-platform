import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
  BLOCKED_LETTERS,
  MOTION_RECOGNIZABLE,
  STATIC_RECOGNIZABLE,
  analyzeCapture,
  analyzeHand,
  attemptMatches,
  canonicalHand,
  classifyShape,
  combineEvidence,
  createLetterRecognizer,
  engineSupports,
  evaluateMotionLetter,
  evaluateTarget,
  letterSpec,
  selectActiveHand,
} from '../../shared/lsv/engine/index.js';
import { LSV_LETTERS } from '../../shared/lsv/labels.js';
import {
  letterImage,
  letterSequence,
  trackerPackets,
  variation,
} from './fixtures/synthetic-hand.js';

// Pruebas de software con geometría SINTÉTICA (ver fixtures/synthetic-hand.js): verifican
// invariancias, decisiones y temporalidad. No son métricas de precisión con personas reales.
const IMAGE = { width: 4, height: 3 };
const analyze = (pose, options = {}) =>
  analyzeHand(letterImage(pose, options), { ...IMAGE, hand: options.hand ?? 'Right' });

test('la especificación cubre el abecedario y bloquea lo que carece de respaldo', () => {
  for (const letter of LSV_LETTERS) assert.ok(letterSpec(letter), `falta ${letter}`);
  assert.deepEqual(
    LSV_LETTERS.filter((letter) => !engineSupports(letter)),
    ['Q', 'T'],
  );
  assert.deepEqual(Object.keys(BLOCKED_LETTERS), ['CH', 'LL', 'RR']);
  assert.deepEqual([...MOTION_RECOGNIZABLE].sort(), ['J', 'Z', 'Ñ'].sort());
  for (const letter of LSV_LETTERS) {
    const spec = letterSpec(letter);
    assert.ok(spec.sources.length > 0, `${letter} sin fuentes`);
    assert.ok(spec.status, `${letter} sin estado de evidencia`);
  }
});

test('normalización: traslación y escala no cambian la mano canónica', () => {
  const near = canonicalHand(letterImage('L', { size: 0.35, center: [0.4, 0.5] }), IMAGE);
  const far = canonicalHand(letterImage('L', { size: 0.12, center: [0.7, 0.6] }), IMAGE);
  near.points.forEach((point, index) =>
    point.forEach((value, axis) => assert.ok(Math.abs(value - far.points[index][axis]) < 1e-9)),
  );
});

test('lateralidad: la mano izquierda reflejada produce los mismos rasgos que la derecha', () => {
  for (const letter of STATIC_RECOGNIZABLE) {
    const right = analyze(letter, { hand: 'Right' });
    const left = analyze(letter, { hand: 'Left' });
    assert.ok(right.canonical.mirrored === false && left.canonical.mirrored === true);
    left.canonical.points.forEach((point, index) =>
      point.forEach((value, axis) =>
        assert.ok(Math.abs(value - right.canonical.points[index][axis]) < 1e-9, letter),
      ),
    );
  }
});

test('efecto espejo: una etiqueta de lateralidad equivocada no produce una letra falsa estable', () => {
  // Si una mano derecha se etiquetara como izquierda, la reflexión la vuelve una mano imposible:
  // la palma queda invertida y las letras que dependen de la orientación pierden compatibilidad.
  const wrong = analyzeHand(letterImage('L', { hand: 'Right' }), { ...IMAGE, hand: 'Left' });
  const right = analyzeHand(letterImage('L', { hand: 'Right' }), { ...IMAGE, hand: 'Right' });
  assert.ok(right.features.orientation.palmTowardCamera > 0.5);
  assert.ok(wrong.features.orientation.palmTowardCamera < -0.5);
});

test('cada letra estática se reconoce con ambas manos, escalas, rotaciones y ruido', () => {
  for (const letter of STATIC_RECOGNIZABLE) {
    let matches = 0;
    let total = 0;
    for (let seed = 1; seed <= 25; seed += 1)
      for (const hand of ['Right', 'Left']) {
        const result = evaluateTarget(
          analyze(letter, { ...variation(seed * 13), hand }).descriptors,
          letter,
        );
        total += 1;
        if (result.verdict === 'MATCH') matches += 1;
      }
    assert.ok(matches / total >= 0.9, `${letter}: ${matches}/${total}`);
  }
});

test('letras parecidas no se aprueban entre sí (salvo la pareja E/S documentada)', () => {
  const lowSeparability = new Set(['E:S', 'S:E']);
  for (const letter of STATIC_RECOGNIZABLE)
    for (const similar of letterSpec(letter).similar) {
      if (!STATIC_RECOGNIZABLE.includes(similar) || lowSeparability.has(`${letter}:${similar}`))
        continue;
      const result = evaluateTarget(analyze(similar).descriptors, letter);
      assert.notEqual(result.verdict, 'MATCH', `${similar} aprobada como ${letter}`);
    }
});

test('E y S se declaran ambiguas en vez de forzar una de ellas', () => {
  const result = classifyShape(analyze('E').descriptors);
  assert.equal(result.status, 'AMBIGUOUS');
  assert.deepEqual([...result.candidates].sort(), ['E', 'S']);
});

test('gestos desconocidos quedan como UNKNOWN y no aprueban letras', () => {
  for (const pose of ['OPEN_FIVE', 'MIDDLE_ONLY', 'RING_PINKY']) {
    const { descriptors } = analyze(pose);
    assert.equal(classifyShape(descriptors).status, 'UNKNOWN', pose);
    for (const letter of STATIC_RECOGNIZABLE)
      assert.notEqual(evaluateTarget(descriptors, letter).verdict, 'MATCH', `${pose} → ${letter}`);
  }
});

test('la retroalimentación nombra la corrección concreta', () => {
  // V con los dedos juntos es una U: la corrección prioritaria pide separarlos.
  const asU = evaluateTarget(analyze('U').descriptors, 'V');
  assert.notEqual(asU.verdict, 'MATCH');
  assert.equal(asU.failing[0].hint, 'Separa los dedos índice y medio.');
  // L sin pulgar extendido (postura ONE) pide separar el pulgar.
  const noThumb = evaluateTarget(analyze('ONE').descriptors, 'L');
  assert.equal(noThumb.failing[0].hint, 'Separa el pulgar del índice.');
  // B con el meñique doblado pide extenderlo.
  const wAsB = evaluateTarget(analyze('P', { roll: -90 }).descriptors, 'B');
  assert.ok(wAsB.failing.some((item) => item.hint === 'Extiende el dedo meñique.'));
});

test('prototipos reales de vocales (vowels-demo-v1): coinciden con su letra en ambas manos', async () => {
  // Únicos datos reales del repositorio: 8 vocales de dos videos, mano derecha. Comprobación de
  // coherencia, no evaluación independiente.
  const model = JSON.parse(
    await readFile(
      new URL('../../Frontend/public/models/lsv-vowels-demo-v1.json', import.meta.url),
    ),
  );
  for (const prototype of model.prototypes.filter((item) => item.label !== 'NONE')) {
    const frame = prototype.sequence[8];
    const points = Array.from({ length: 21 }, (_, index) => frame.slice(index * 3, index * 3 + 3));
    for (const [hand, mirrored] of [
      ['Right', points],
      ['Left', points.map(([x, y, z]) => [-x, y, z])],
    ]) {
      const result = evaluateTarget(analyzeHand(mirrored, { hand }).descriptors, prototype.label);
      assert.equal(result.verdict, 'MATCH', `${prototype.label} ${hand}`);
    }
  }
});

const hold = (pose, options = {}) =>
  letterSequence(() => ({ pose, options: { noise: 0.008, random: Math.random, ...options } }), {
    durationMs: 1500,
    hand: options.hand,
  });

test('análisis de captura: postura mantenida aprueba; una transición no', () => {
  for (const hand of ['Right', 'Left']) {
    assert.equal(analyzeCapture(hold('U', { hand }), 'U').verdict, 'MATCH');
  }
  // Transición rápida U → V → U: nunca alcanza la duración mínima de V.
  const transition = letterSequence((t) => ({ pose: t > 500 && t < 800 ? 'V' : 'U' }));
  assert.notEqual(analyzeCapture(transition, 'V').verdict, 'MATCH');
  // Una V mostrada cuando se pide U: se identifica la letra rival y la corrección.
  const different = analyzeCapture(hold('V'), 'U');
  assert.equal(different.verdict, 'CONFUSED');
  assert.equal(different.rival, 'V');
  assert.equal(different.hint, 'Junta los dedos índice y medio.');
});

test('J exige la postura de I y el giro de muñeca completo, con ambas manos', () => {
  for (const hand of ['Right', 'Left']) {
    const still = letterSequence(() => ({ pose: 'I' }), { hand });
    assert.notEqual(evaluateMotionLetter(still, 'J').verdict, 'MATCH', 'sin movimiento');
    const turned = letterSequence(
      (t, k) => ({ pose: 'I', options: { yaw: Math.min(1, k * 1.4) * 80 } }),
      { hand },
    );
    assert.equal(evaluateMotionLetter(turned, 'J').verdict, 'MATCH', hand);
    // Media vuelta: movimiento incompleto.
    const half = letterSequence((t, k) => ({ pose: 'I', options: { yaw: k * 25 } }), { hand });
    assert.notEqual(evaluateMotionLetter(half, 'J').verdict, 'MATCH');
    // Giro completo con otra configuración (Y): no es J.
    const wrongShape = letterSequence(
      (t, k) => ({ pose: 'Y', options: { yaw: Math.min(1, k * 1.4) * 80 } }),
      { hand },
    );
    assert.equal(evaluateMotionLetter(wrongShape, 'J').verdict, 'ADJUST_SHAPE');
  }
});

test('Z exige trazo en zigzag descendente; Ñ exige oscilación', () => {
  const zigzag = (k) => {
    // Tres tramos: derecha, diagonal abajo-izquierda, derecha.
    if (k < 1 / 3) return [0.35 + k * 3 * 0.25, 0.4];
    if (k < 2 / 3) return [0.6 - (k - 1 / 3) * 3 * 0.25, 0.4 + (k - 1 / 3) * 3 * 0.15];
    return [0.35 + (k - 2 / 3) * 3 * 0.25, 0.55];
  };
  for (const hand of ['Right', 'Left']) {
    const z = letterSequence((t, k) => ({ pose: 'ONE', options: { center: zigzag(k) } }), {
      hand,
      durationMs: 1800,
    });
    assert.equal(evaluateMotionLetter(z, 'Z').verdict, 'MATCH', `Z ${hand}`);
    const line = letterSequence(
      (t, k) => ({ pose: 'ONE', options: { center: [0.35 + k * 0.25, 0.4] } }),
      {
        hand,
      },
    );
    assert.notEqual(evaluateMotionLetter(line, 'Z').verdict, 'MATCH');
    const wave = letterSequence(
      (t, k) => ({ pose: 'N', options: { center: [0.5 + 0.07 * Math.sin(k * Math.PI * 4), 0.5] } }),
      { hand, durationMs: 1800 },
    );
    assert.equal(evaluateMotionLetter(wave, 'Ñ').verdict, 'MATCH', `Ñ ${hand}`);
    const n = letterSequence(() => ({ pose: 'N' }), { hand });
    assert.notEqual(evaluateMotionLetter(n, 'Ñ').verdict, 'MATCH');
  }
});

function run(target, packets) {
  const recognizer = createLetterRecognizer({ target });
  return packets.map((packet) => recognizer.update(packet));
}

test('reconocedor en vivo: estabilidad antes de confirmar y nunca con una sola predicción', () => {
  const states = run('L', trackerPackets(hold('L')));
  assert.equal(states[0].state, 'ANALYZING');
  assert.ok(states.some((item) => item.state === 'HOLD'));
  const first = states.findIndex((item) => item.state === 'MATCH');
  assert.ok(first > 0);
  // Al menos TIMING.holdMs (800 ms ≈ 24 fotogramas) tras el análisis inicial.
  assert.ok(first >= 24, `confirmó en el fotograma ${first}`);
  assert.equal(states.at(-1).state, 'MATCH');
});

test('reconocedor en vivo: un único fotograma compatible no aprueba', () => {
  const frames = letterSequence((t) => ({ pose: t === 500 ? 'L' : 'ONE' }));
  assert.ok(run('L', trackerPackets(frames)).every((item) => item.state !== 'MATCH'));
});

test('reconocedor en vivo: correcciones estables entre fotogramas consecutivos', () => {
  const states = run('V', trackerPackets(hold('U')));
  const hints = states.filter((item) => item.state === 'ADJUST').map((item) => item.hint);
  assert.ok(hints.length > 10);
  assert.equal(new Set(hints).size, 1);
  assert.equal(hints[0], 'Separa los dedos índice y medio.');
});

test('reconocedor en vivo: estados de mano ausente, parcial, dos manos y pérdida breve', () => {
  const recognizer = createLetterRecognizer({ target: 'L' });
  assert.equal(recognizer.update({ t: 0, observations: [] }).state, 'SEARCHING');
  const [packet] = trackerPackets(hold('L'));
  const partial = structuredClone(packet);
  partial.observations[0].points[8][1] = 0;
  assert.equal(
    recognizer.update({ ...partial, t: 10 }).message,
    'Coloca toda la mano dentro de la cámara.',
  );
  const two = {
    ...packet,
    t: 20,
    count: 2,
    observations: [packet.observations[0], { ...packet.observations[0], trackId: 'track_2' }],
  };
  assert.equal(recognizer.update(two).message, 'Deja visible solo la mano que forma la letra.');
  recognizer.update({ ...packet, t: 30 });
  // 200 ms sin mano: se conserva el intento.
  assert.equal(recognizer.update({ t: 230, observations: [] }).state, 'ANALYZING');
  // Más de 400 ms: vuelve a buscar.
  assert.equal(recognizer.update({ t: 700, observations: [] }).state, 'SEARCHING');
});

test('reconocedor en vivo: gesto desconocido sostenido termina en UNRECOGNIZED', () => {
  const states = run(
    'L',
    trackerPackets(letterSequence(() => ({ pose: 'OPEN_FIVE' }), { durationMs: 2500 })),
  );
  assert.equal(states.at(-1).state, 'UNRECOGNIZED');
  assert.ok(states.every((item) => item.state !== 'MATCH'));
});

test('reconocedor en vivo: la mano izquierda recorre los mismos estados', () => {
  const states = run('Y', trackerPackets(hold('Y', { hand: 'Left' })));
  assert.equal(states.at(-1).state, 'MATCH');
  assert.equal(states.at(-1).hand, 'Left');
});

test('selección de mano activa: conserva el track y si no, la mano más grande', () => {
  const small = { trackId: 'a', stable: true, points: letterImage('L', { size: 0.1 }) };
  const big = { trackId: 'b', stable: true, points: letterImage('L', { size: 0.3 }) };
  assert.equal(selectActiveHand([small, big], null).trackId, 'b');
  assert.equal(selectActiveHand([small, big], 'a').trackId, 'a');
  assert.equal(selectActiveHand([], 'a'), null);
});

test('evidencia híbrida: la geometría veta coincidencias del DTW y cubre la mano izquierda', () => {
  const dtwMatch = { reason: 'CANDIDATE', label: 'U' };
  assert.equal(combineEvidence(dtwMatch, { verdict: 'ADJUST', hint: 'x' }, 'U').verdict, 'ADJUST');
  assert.equal(combineEvidence(dtwMatch, { verdict: 'MATCH' }, 'U').source, 'GEOMETRY_AND_MODEL');
  assert.equal(
    combineEvidence({ reason: 'UNSUPPORTED_HAND', label: null }, { verdict: 'MATCH' }, 'U').verdict,
    'MATCH',
  );
  assert.equal(
    combineEvidence({ reason: 'CANDIDATE', label: 'V' }, { verdict: 'MATCH' }, 'U').verdict,
    'UNCERTAIN',
  );
  assert.equal(combineEvidence(dtwMatch, { verdict: 'UNSUPPORTED' }, 'U').verdict, 'MODEL_MATCH');
  // Compatibilidad con el progreso anterior (resultados sin evidencia combinada).
  assert.equal(attemptMatches({ reason: 'CANDIDATE', label: 'A' }, 'A'), true);
  assert.equal(
    attemptMatches({ reason: 'CANDIDATE', label: 'A', evidence: { verdict: 'ADJUST' } }, 'A'),
    false,
  );
  assert.equal(attemptMatches({ evidence: { verdict: 'MATCH' } }, 'B'), true);
});
