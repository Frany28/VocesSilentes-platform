import { trainingCoverage } from '../../../../../shared/lsv/coverage.js';

const groupNames = { train: 'Entrenamiento', validation: 'Calibración', test: 'Prueba' };

/**
 * Explica cobertura de ejecuciones independientes, sin convertir frames o muestras pendientes en suficiencia.
 * @param {{samples: object[]}} props Lote validado en memoria.
 * @returns {import('react').ReactElement} Faltantes de las seis etiquetas y de cada participante.
 */
export function TrainingCoverage({ samples }) {
  const coverage = trainingCoverage(samples);
  return (
    <section
      className="education-card flex min-w-0 flex-col gap-4"
      aria-label="Cobertura del conjunto piloto"
    >
      <h2 className="[font:var(--type-h3)]">Cobertura del piloto: vocales y NONE</h2>
      <p role="status">
        {coverage.minimumCovered
          ? 'Mínimo de muestras revisadas cubierto.'
          : 'Faltan muestras revisadas en uno o más grupos.'}
      </p>
      <p className="text-muted">
        Solo este lote en memoria. Mínimo técnico: una ejecución revisada por etiqueta y grupo, con
        personas separadas. No demuestra precisión ni basta para validar el modelo.
      </p>
      <div className="training-coverage-grid">
        {coverage.labels.map(({ label, groups }) => (
          <article key={label} className="training-sample-row">
            <h3 className="[font:var(--type-h3)]">{label}</h3>
            <ul className="flex list-none flex-col gap-2 p-0">
              {groups.map((group) => (
                <li key={group.partition}>
                  {groupNames[group.partition]}: {group.reviewed} revisadas, {group.pending}{' '}
                  pendientes, {group.participants} personas.{' '}
                  {group.reviewed ? 'Mínimo cubierto.' : 'Falta revisión o captura.'}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <details>
        <summary>Ver cobertura por participante ({coverage.people.length})</summary>
        <ul className="flex list-none flex-col gap-3 p-0">
          {coverage.people.map((person) => (
            <li key={person.id} className="training-sample-row">
              <p>
                {person.id} · {person.partitions.map((group) => groupNames[group]).join(', ')}
              </p>
              <p>
                {person.missing.length
                  ? `Faltan revisadas: ${person.missing.join(', ')}.`
                  : 'Tiene muestras revisadas de las seis etiquetas.'}
              </p>
              {person.partitions.length > 1 && (
                <p>Conflicto: esta persona aparece en varios grupos.</p>
              )}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
