import { Progress } from '../../../components/ui/Progress.jsx';

/**
 * Resultados reales del resumen. El progreso de preguntas solo aparece si la lección tiene preguntas
 * disponibles: mostrar «0 de 5» cuando aún no se pueden responder desanima y no informa.
 * @param {{questions: object[], reading: object}} props Preguntas con estado del servidor y avance del módulo.
 * @returns {import('react').ReactElement} Barras de progreso y aviso de ejercicios pendientes.
 */
export function SummaryResults({ questions, reading }) {
  const ready = questions.filter((item) => item.availability === 'READY');
  const solved = ready.filter((item) => item.status === 'COMPLETED').length;
  const pending = questions.length - ready.length;
  const percent = ready.length ? Math.round((100 * solved) / ready.length) : 0;
  return (
    <div className="flex flex-col gap-3">
      {ready.length > 0 && (
        <Progress
          className="education-result-progress"
          label="Preguntas resueltas"
          value={percent}
          valueText={`${percent}% · ${solved} de ${ready.length} preguntas resueltas`}
        />
      )}
      {pending > 0 && (
        <p className="text-muted">
          {pending === 1 ? 'Hay 1 ejercicio' : `Hay ${pending} ejercicios`} que se habilitarán
          cuando su material esté revisado. No cuentan como fallos.
        </p>
      )}
      <Progress
        className="education-result-progress"
        label="Avance del módulo"
        value={reading.percent}
        valueText={`${reading.percent}% · ${reading.completed} de ${reading.total} lecciones guardadas`}
      />
    </div>
  );
}
