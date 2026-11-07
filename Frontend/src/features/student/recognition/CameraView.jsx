import { CameraControls } from './CameraControls.jsx';
import { useHandGuidance } from './use-hand-guidance.js';
import './hand-guidance.css';

/**
 * Presenta vídeo y landmarks reales, permisos y controles de cámara, sin interpretar señas.
 * @param {{camera: object, target?: string, controls?: boolean}} props Controlador, referencia y controles integrados.
 * @returns {import('react').ReactElement} Visor accesible con activación y cierre explícitos.
 */
export function CameraView({ camera, target, controls = true }) {
  const { videoRef, canvasRef, state } = camera;
  const active = ['permission', 'loading', 'live'].includes(state);
  const guidance = useHandGuidance(camera);
  return (
    <section className="camera-panel flex min-w-0 flex-col gap-4" aria-label="Cámara de práctica">
      <div className="camera-viewport">
        <video ref={videoRef} muted playsInline autoPlay aria-label="Vista de cámara" />
        <canvas ref={canvasRef} aria-hidden="true" />
        {guidance && (
          <span className="camera-guide" data-state={guidance.state} aria-hidden="true" />
        )}
        {target && <p className="camera-target">Referencia: {target}</p>}
        {!active && <p className="camera-placeholder">Activa la cámara cuando estés listo.</p>}
      </div>
      {controls && <CameraControls camera={camera} />}
      <p className="text-muted [font:var(--type-label)]">
        El vídeo se procesa en tu dispositivo. No se graba ni se envía al servidor. Los puntos
        detectados no indican por sí solos una letra correcta de LSV.
      </p>
    </section>
  );
}
