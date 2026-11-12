import { Button } from '../../../components/ui/Button.jsx';
import { ProgressSummary } from './ProgressSummary.jsx';

/**
 * Resumen, consejo y ayuda previstos en Inicio; las acciones pendientes se anuncian.
 * @param {{module: object, onOpen: Function}} props Datos y anuncio de disponibilidad.
 * @returns {import('react').ReactElement} Columna de apoyo adaptable.
 */
export function LearningAside({ module, onOpen }) {
  return (
    <aside className="student-learning-aside flex min-w-0 flex-col gap-6">
      <ProgressSummary module={module} />
      <section className="student-learning-tip flex flex-col gap-4">
        <h2 className="[font:var(--type-h3)]">
          Mira las manos.
          <br />
          También la expresión.
        </h2>
        <p className="text-muted">
          La expresión facial forma parte del mensaje. Observa el ejemplo antes de practicar.
        </p>
      </section>
      <section className="student-learning-help flex flex-col gap-3">
        <h2 className="[font:var(--type-subtitle)]">¿Algo no funciona?</h2>
        <p className="text-muted">Tu reporte nos ayuda a mejorar la experiencia.</p>
        <Button variant="secondary" className="w-full" onClick={() => onOpen('Reportar un error')}>
          Reportar un error
        </Button>
      </section>
    </aside>
  );
}
