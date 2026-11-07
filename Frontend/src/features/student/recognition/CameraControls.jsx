import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';

/**
 * Agrupa estado, permiso y cierre para situarlos junto al visor en escritorio, sin activar la cámara al montar.
 * @param {{camera: object}} props Estado y acciones del controlador existente.
 * @returns {import('react').ReactElement} Controles y errores accesibles de la cámara.
 */
export function CameraControls({ camera: { state, error, hands, start, stop } }) {
  const active = ['permission', 'loading', 'live'].includes(state);
  const description =
    {
      off: 'Cámara apagada',
      permission: 'Esperando permiso de cámara…',
      loading: 'Cargando detector de manos…',
      error: 'Cámara detenida',
    }[state] ?? (hands === 0 ? 'No hay manos detectadas.' : `${hands} mano(s) detectada(s).`);
  return (
    <section className="flex min-w-0 flex-col gap-4" aria-label="Controles de cámara">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite">
          {description}
        </p>
        <div className="camera-actions">
          {active ? (
            <Button variant="secondary" icon={null} onClick={stop}>
              {state === 'live' ? 'Detener cámara' : 'Cancelar activación'}
            </Button>
          ) : (
            <Button onClick={start}>Activar cámara</Button>
          )}
        </div>
      </div>
      {error && (
        <Alert tone="error" title="Cámara no disponible">
          {error}
        </Alert>
      )}
    </section>
  );
}
