import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { ModelStatus } from './ModelStatus.jsx';
import { AutoCaptureToggle } from './AutoCaptureToggle.jsx';
import { AttemptResult } from './AttemptResult.jsx';
import { useCaptureCountdown } from './use-capture-countdown.js';
import { useAutoCapture } from './use-auto-capture.js';
import { attemptStatus } from './attempt-status.js';
import { recognitionSupports } from './recognition-support.js';
import './attempt.css';

/**
 * Flujo del intento: estado del modelo, captura automática (o manual con cuenta atrás), análisis
 * automático y resultado. Mantiene separadas la detección de manos, la clasificación experimental y
 * la evaluación académica (inexistente aquí). Sin clasificación para la letra objetivo, no hay análisis.
 * @param {{operation: object, capture: object, camera: object, target?: string, lab?: boolean}} props
 * Modelo, intento, detector, letra y modo laboratorio (importar, reanalizar y captura manual por defecto).
 * @returns {import('react').ReactElement} Controles y resultados accesibles.
 */
export function ModelInference({ operation, capture, camera, target, lab = false }) {
  const [auto, setAuto] = useState(!lab);
  const countdown = useCaptureCountdown();
  const supported = recognitionSupports(target, operation.model);
  const busy = capture.pending || countdown.count !== null;
  // Mientras se descarga el modelo no se captura: el intento se quedaría sin análisis.
  const preparing = !operation.model && operation.loading;
  const live = camera.state === 'live';
  const capturing = (after) => {
    operation.clear();
    capture.clear();
    // Solo se analiza en automático si el modelo ya estaba listo al empezar el intento.
    capture.capture(operation.model ? operation.predict : undefined, after);
  };
  const automatic = useAutoCapture(camera, {
    enabled: auto && supported && live && !busy && !preparing,
    onTrigger: capturing,
  });
  if (!supported)
    return (
      <Alert tone="info" title="Sin reconocimiento para esta letra">
        La {target} todavía no tiene reconocimiento experimental: el modelo solo conoce A, E, I, O y
        U. Practica frente a la cámara comparando tu mano con la referencia. No se analizará el
        intento.
      </Alert>
    );
  const manual = () => countdown.start(() => capturing());
  const status = attemptStatus({
    ...countdown,
    ...capture,
    preparing,
    live,
    auto,
    phase: automatic.phase,
  });
  const shown = operation.result && operation.result.frames === capture.frames;
  return (
    <section className="flex flex-col gap-4" aria-label="Modelo propio de LSV">
      <ModelStatus operation={operation} allowImport={lab} />
      {/* El laboratorio recopila muestras con captura manual: el interruptor es solo para estudiantes. */}
      {!lab && <AutoCaptureToggle checked={auto} onChange={setAuto} />}
      <p className="attempt-status" data-phase={auto ? automatic.phase : undefined} role="status">
        {status}
      </p>
      <div className="camera-actions">
        <Button
          variant={auto ? 'secondary' : undefined}
          icon={auto ? null : undefined}
          disabled={!live || busy || preparing}
          loading={busy}
          loadingLabel={
            countdown.count !== null ? `Empieza en ${countdown.count}…` : 'Capturando 3 segundos…'
          }
          onClick={manual}
        >
          Capturar intento
        </Button>
        {lab && (
          <Button
            variant="secondary"
            icon={null}
            disabled={!operation.model || !capture.frames || busy}
            onClick={() => operation.predict(capture.frames)}
          >
            Analizar intento
          </Button>
        )}
      </div>
      {shown && (
        <AttemptResult
          result={operation.result}
          model={operation.model}
          target={target}
          disabled={!live || busy}
          onRetry={auto ? automatic.rearm : manual}
        />
      )}
      {(capture.error || operation.error) && (
        <Alert tone="error" title="Intento no disponible">
          {capture.error || operation.error}
        </Alert>
      )}
    </section>
  );
}
