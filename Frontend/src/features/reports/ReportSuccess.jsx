import { Button } from '../../components/ui/Button.jsx';
import { Icon } from '../../components/ui/Icon.jsx';

/**
 * Confirmación únicamente después de guardar el reporte y confirmar la imagen, si existe.
 * @param {{id: string, onReset: Function, onHome: Function}} props Identificador real y acciones de navegación.
 * @returns {import('react').ReactElement} Resultado real sin referencias de ejemplo.
 */
export function ReportSuccess({ id, onReset, onHome }) {
  return (
    <section className="account-panel report-success" role="status">
      <h2>
        <Icon name="check" size={20} tone="success" />
        Reporte enviado
      </h2>
      <h2>Gracias por ayudarnos a mejorar.</h2>
      <p className="account-muted">El equipo podrá revisar la información de tu reporte.</p>
      <p className="account-caption">Referencia: {id}</p>
      <div className="account-actions">
        <Button density="compact" variant="secondary" icon={null} onClick={onReset}>
          Crear otro reporte
        </Button>
        <Button density="compact" icon={null} onClick={onHome}>
          Volver al inicio
        </Button>
      </div>
    </section>
  );
}
