/**
 * Resume resultados del lote reservado sin convertir ausencia de datos en ceros de precisión.
 * @param {{comparison: object}} props Informe de los tres experimentos.
 * @returns {import('react').ReactElement} Conteos y exactitud preliminar por mano; detalles en el JSON.
 */
export function HandExperimentResults({ comparison }) {
  return (
    <div className="flex flex-col gap-2" role="status">
      <p>Pruebas técnicas preliminares. Capturas evaluadas: {comparison.evaluation.testSamples}.</p>
      {comparison.evaluation.unknownTrainingParticipants && <p>{comparison.evaluation.warning}</p>}
      {Object.entries(comparison.experiments).map(([name, run]) => (
        <div key={name}>
          <strong>Experimento {name}: </strong>
          {run.status === 'BLOCKED' ? (
            run.reason
          ) : (
            <>
              {run.report.samples} reales, {run.report.augmentedSamples} aumentadas.
              {Object.entries(run.metrics.byHand).map(([hand, metrics]) => (
                <p key={hand}>
                  {hand === 'Left' ? 'Izquierda' : 'Derecha'}: {metrics.total} pruebas; exactitud{' '}
                  {metrics.accuracy === null
                    ? 'sin datos'
                    : `${(100 * metrics.accuracy).toFixed(1)} %`}
                  ; {metrics.abstentions} abstenciones, {metrics.errors} errores.
                </p>
              ))}
            </>
          )}
        </div>
      ))}
      <p>
        Precision, recall, F1, matrices y tiempos por mano se incluyen en el resumen descargable.
      </p>
    </div>
  );
}
