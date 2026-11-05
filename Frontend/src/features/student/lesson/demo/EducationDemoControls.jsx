import { Button } from '../../../../components/ui/Button.jsx';
import { Select } from '../../../../components/ui/Select.jsx';
import { demoViews } from './education-demo-data.js';

/**
 * Permite inspeccionar cada vista y escoger la retroalimentación sin implementar un corrector.
 * @param {{operation: object}} props Estado local de la demo visual.
 * @returns {import('react').ReactElement} Controles identificados y separados de la clase publicada.
 */
export function EducationDemoControls({ operation }) {
  return (
    <aside
      className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4"
      aria-label="Controles de la demostración visual"
    >
      <h2 className="[font:var(--type-subtitle)]">Demo visual · datos de ejemplo</h2>
      <p className="text-muted">
        No evalúa respuestas ni señas. Los aciertos y el resultado son ejemplos fijos; no se guarda
        progreso.
      </p>
      <div className="grid gap-4 min-[600px]:grid-cols-2">
        <Select
          label="Vista de demostración"
          value={operation.view}
          onChange={(event) => operation.show(event.target.value)}
        >
          {Object.entries(demoViews).map(([value, view]) => (
            <option key={value} value={value}>
              {view.label}
            </option>
          ))}
        </Select>
        <Select
          label="Retroalimentación de muestra"
          value={operation.outcome}
          onChange={(event) => operation.setOutcome(event.target.value)}
        >
          <option value="correct">Mostrar respuesta correcta</option>
          <option value="incorrect">Mostrar respuesta incorrecta</option>
        </Select>
      </div>
      <Button
        variant="secondary"
        icon={null}
        disabled={!operation.selection}
        onClick={() => operation.show(operation.view)}
      >
        Quitar selección
      </Button>
    </aside>
  );
}
