import { trainingCoverage } from '../../../../../shared/lsv/coverage.js';
import { labelReadiness } from '../../../../../shared/lsv/readiness.js';

const groupNames = { train: 'Entrenamiento', validation: 'Calibración', test: 'Prueba' };

/**
 * Explica cobertura de ejecuciones independientes, sin convertir frames o muestras pendientes en suficiencia.
 * @param {{samples: object[]}} props Lote validado en memoria.
 * @returns {import('react').ReactElement} Faltantes de 27 letras y NONE, sin convertirlos en un modelo disponible.
 */
export function TrainingCoverage({ samples }) {
  const coverage = trainingCoverage(samples);
  const readiness = labelReadiness(samples);
  return (
    <section
      className="education-card flex min-w-0 flex-col gap-4"
      aria-label="Cobertura del abecedario y NONE"
    >
      <h2 className="[font:var(--type-h3)]">Cobertura de las 27 letras y NONE</h2>
      <p role="status">
        {coverage.minimumCovered
          ? 'Mínimo de muestras revisadas cubierto.'
          : 'Faltan muestras revisadas en uno o más grupos.'}
      </p>
      <p className="text-muted">
        Solo este lote en memoria. Se cuentan ejecuciones con consentimiento, documentación y
        revisión LSV, con personas separadas. La cobertura no demuestra precisión ni valida el
        modelo.
      </p>
      <div className="training-coverage-grid">
        {coverage.labels.map(({ label, groups }) => (
          <article key={label} className="training-sample-row">
            <h3 className="[font:var(--type-h3)]">{label}</h3>
            <details>
              <summary>Datos que faltan para evaluar {label}</summary>
              <ul>
                {readiness
                  .find((row) => row.label === label)
                  .missing.map((missing) => (
                    <li key={missing}>{missing}</li>
                  ))}
              </ul>
            </details>
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
                  : 'Tiene muestras documentadas de todas las etiquetas.'}
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
