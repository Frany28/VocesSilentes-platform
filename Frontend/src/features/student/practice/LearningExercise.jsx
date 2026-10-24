import { Button } from '../../../components/ui/Button.jsx';

/**
 * Presenta una actividad publicada y sus acciones explícitas de registro manual.
 * @param {{exercise: object, operation: object}} props Contenido confirmado y operación de persistencia.
 * @returns {import('react').ReactElement} Estado guardado y controles sin reconocimiento simulado.
 */
export function LearningExercise({ exercise, operation }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="[font:var(--type-subtitle)]">Actividad de práctica</h3>
      <p>{exercise.instructions}</p>
      <p className="text-muted">Actividad declarada: {exercise.status}</p>
      <div className="account-actions">
        <Button density="compact" icon={null}
          disabled={operation.pending || exercise.status !== 'NOT_STARTED'}
          onClick={() => operation.submit('exercises', exercise.id, 'IN_PROGRESS')}>
          Registrar inicio de práctica
        </Button>
        <Button density="compact" icon={null}
          disabled={operation.pending || exercise.status === 'COMPLETED'}
          onClick={() => operation.submit('exercises', exercise.id, 'COMPLETED')}>
          Registrar práctica realizada
        </Button>
      </div>
    </section>
  );
}
