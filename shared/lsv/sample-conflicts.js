/**
 * Impide reutilizar ejecuciones y mezclar personas entre particiones antes de la revisión LSV.
 * @param {object} sample Muestra validada.
 * @param {object[]} previous Muestras validadas del lote.
 * @returns {void} Lanza ante duplicados, solapamientos o personas cruzadas.
 */
export function assertIndependentSample(sample, previous) {
  const registry = createSampleRegistry();
  for (const original of previous) registry.add(original);
  registry.add(sample);
}

/**
 * Indexa cada huella una sola vez para validar exportaciones grandes sin serializar pares de muestras.
 * @returns {{add: Function}} Registro incremental; add valida antes de modificar el índice.
 */
export function createSampleRegistry() {
  const people = new Map();
  const ids = new Set();
  const fingerprints = new Set();
  const executions = new Set();
  const videos = new Map();
  const add = (sample) => {
    const person = sample.participantId.toLowerCase();
    const fingerprint = JSON.stringify(sample.frames.map((frame) => frame.points));
    if (people.has(person) && people.get(person) !== sample.partition)
      throw new Error('Una persona aparece en más de una partición; conserva su grupo original.');
    if (ids.has(sample.id) || fingerprints.has(fingerprint))
      throw new Error('Hay muestras repetidas o copiadas.');
    const right = sample.source;
    const key = right ? `${person}:${right.executionId}` : null;
    if (key && executions.has(key))
      throw new Error(
        'Esta ejecución ya tiene una muestra; no la dividas en muestras independientes.',
      );
    const intervals = right ? (videos.get(right.sha256) ?? []) : [];
    if (right && intervals.some((left) => left.startMs < right.endMs && right.startMs < left.endMs))
      throw new Error('Este intervalo se solapa con otra muestra del mismo video.');
    people.set(person, sample.partition);
    ids.add(sample.id);
    fingerprints.add(fingerprint);
    if (right) {
      executions.add(key);
      videos.set(right.sha256, [...intervals, right]);
    }
  };
  return { add };
}
