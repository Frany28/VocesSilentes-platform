import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';

/**
 * Presenta vídeo y landmarks reales, permisos y controles de cámara, sin interpretar señas.
 * @param {{camera: object, target?: string}} props Controlador y etiqueta de referencia, nunca resultado inferido.
 * @returns {import('react').ReactElement} Visor accesible con activación y cierre explícitos.
 */
export function CameraView({
  camera: { videoRef, canvasRef, state, error, hands, start, stop },
  target,
}) {
  const active = ['permission', 'loading', 'live'].includes(state);
  const description =
    {
      off: 'Cámara apagada',
      permission: 'Esperando permiso de cámara…',
      loading: 'Cargando detector de manos…',
      error: 'Cámara detenida',
    }[state] ?? (hands === 0 ? 'No hay manos detectadas.' : `${hands} mano(s) detectada(s).`);
  return (
    <section className="camera-panel flex min-w-0 flex-col gap-4" aria-label="Cámara de práctica">
      <div className="camera-viewport">
        <video ref={videoRef} muted playsInline autoPlay aria-label="Vista de cámara" />
        <canvas ref={canvasRef} aria-hidden="true" />
        {target && <p className="camera-target">Referencia: {target}</p>}
        {!active && <p className="camera-placeholder">Activa la cámara cuando estés listo.</p>}
      </div>
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
      {error && (
        <Alert tone="error" title="Cámara no disponible">
          {error}
        </Alert>
      )}
      <p className="text-muted [font:var(--type-label)]">
        El vídeo se procesa en tu dispositivo. No se graba ni se envía al servidor. Los puntos
        detectados no indican por sí solos una letra correcta de LSV.
      </p>
    </section>
  );
}
