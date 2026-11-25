import { useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { cameraMilestones, cameraStage } from './camera-stage.js';
import { CameraControls } from './CameraControls.jsx';
import { DetectionStatus } from './DetectionStatus.jsx';
import './workspace-attempt.css';

const resultStages = new Set(['match', 'different', 'adjust', 'uncertain']);

/**
 * Panel estable junto a la cámara: etapa real, orientación y acciones en un único lugar visible.
 * Sustituye a la retroalimentación apilada bajo el visor en el workspace educativo.
 * @param {{camera: object, attempt: object, operation: object, capture: object, target?: string,
 * live?: object|null, onReference?: Function, onContinue?: Function}} props Estados reales del
 * intento; `live` es la guía continua del motor de reconocimiento.
 * @returns {import('react').ReactElement} Estado, guía y controles sin simular resultados.
 */
export function WorkspaceAttempt({
  camera,
  attempt,
  operation,
  capture,
  target,
  live = null,
  onReference,
  onContinue,
}) {
  const current = cameraStage({ camera, attempt, operation, capture, target, live });
  const position = cameraMilestones.findIndex((item) => item.id === current.milestone);
  const panel = useRef(null);
  const showsResult = resultStages.has(current.id);
  useEffect(() => {
    if (!showsResult) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    panel.current?.scrollIntoView?.({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' });
  }, [showsResult]);
  const retry = () => {
    operation.clear();
    capture.clear();
    attempt.automatic.rearm();
  };
  return (
    <section
      ref={panel}
      className="workspace-attempt"
      data-stage={current.id}
      aria-label="Tu intento"
    >
      <ol className="workspace-milestones" aria-label="Etapas del intento">
        {cameraMilestones.map((item, index) => (
          <li
            key={item.id}
            data-state={index < position ? 'done' : index === position ? 'now' : undefined}
            aria-current={index === position ? 'step' : undefined}
          >
            {item.label}
          </li>
        ))}
      </ol>
      <div className="workspace-stage" role="status" aria-live="polite" aria-atomic="true">
        <p className="workspace-stage-kicker">
          {showsResult ? 'Resultado experimental' : 'Estado de la práctica'}
        </p>
        <div className="workspace-stage-copy" key={current.id + current.title}>
          {current.label && (
            <span className="workspace-candidate" aria-hidden="true">
              {current.label}
            </span>
          )}
          <div>
            <h3>{current.title}</h3>
            <p>{current.guidance}</p>
          </div>
        </div>
      </div>
      {camera.state === 'live' && camera.hands === 2 && <DetectionStatus camera={camera} />}
      <div className="workspace-actions">
        {showsResult && (
          <Button icon={null} disabled={!attempt.live || attempt.busy} onClick={retry}>
            Repetir intento
          </Button>
        )}
        {!showsResult &&
          attempt.live &&
          attempt.supported &&
          (attempt.ready ?? operation.model) && (
            <Button
              variant="secondary"
              icon={null}
              loading={attempt.busy}
              loadingLabel="Capturando…"
              onClick={attempt.manual}
            >
              Capturar ahora
            </Button>
          )}
        {!operation.model && !operation.ready && operation.loadError && (
          <Button variant="secondary" icon={null} onClick={operation.loadDemo}>
            Reintentar reconocimiento
          </Button>
        )}
        {showsResult && onReference && (
          <Button variant="secondary" icon={null} onClick={onReference}>
            Ver referencia
          </Button>
        )}
        {showsResult && onContinue && (
          <Button variant="secondary" icon={null} onClick={onContinue}>
            Continuar
          </Button>
        )}
        <CameraControls camera={camera} compact />
      </div>
    </section>
  );
}
