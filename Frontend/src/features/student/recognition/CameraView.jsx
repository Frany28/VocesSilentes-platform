import { CameraControls } from './CameraControls.jsx';
import { useHandGuidance } from './use-hand-guidance.js';
import './hand-guidance.css';

/**
 * Presenta vídeo y landmarks reales, permisos y controles de cámara, sin interpretar señas.
 * @param {{camera: object, target?: string, controls?: boolean, phase?: string,
 * educational?: boolean}} props Controlador y presentación del intento.
 * @returns {import('react').ReactElement} Visor accesible con activación y cierre explícitos.
 */
export function CameraView({ camera, target, controls = true, phase, educational = false }) {
  const { videoRef, canvasRef, state } = camera;
  const active = ['permission', 'loading', 'live'].includes(state);
  const guidance = useHandGuidance(camera);
  const ratio = camera.detection?.width / camera.detection?.height || 4 / 3;
  const message =
    {
      off: 'Cámara apagada · Actívala cuando estés listo',
      permission: 'Permite el acceso a tu cámara para empezar…',
      loading: 'Preparando la cámara…',
      error: 'Puedes volver a activar tu cámara',
    }[state] ??
    (phase === 'capturing'
      ? 'Capturando · Mantén la seña quieta'
      : phase === 'success'
        ? '¡Buen trabajo! Mira tu resultado'
        : phase === 'retry'
          ? 'Mira la ayuda para tu siguiente intento'
          : (guidance?.message ?? 'Cámara lista · Coloca una mano en el recuadro'));
  return (
    <section className="camera-panel flex min-w-0 flex-col gap-4" aria-label="Cámara de práctica">
      <div
        className="camera-viewport"
        data-state={state}
        data-phase={phase}
        style={{ '--camera-ratio': ratio }}
      >
        <video ref={videoRef} muted playsInline autoPlay aria-label="Vista de cámara" />
        <canvas ref={canvasRef} aria-hidden="true" />
        {state === 'live' && (
          <span
            className="camera-guide"
            data-state={guidance?.state ?? 'none'}
            aria-hidden="true"
          />
        )}
        {target && <p className="camera-target">Referencia: {target}</p>}
        {!active && <p className="camera-placeholder">Activa la cámara cuando estés listo.</p>}
        {educational && (
          <p className="camera-state" role="status">
            {message}
          </p>
        )}
      </div>
      {controls && <CameraControls camera={camera} />}
      {!educational && (
        <p className="text-muted [font:var(--type-label)]">
          El vídeo se procesa en tu dispositivo. No se graba ni se envía al servidor. Los puntos
          detectados no indican por sí solos una letra correcta de LSV.
        </p>
      )}
    </section>
  );
}
