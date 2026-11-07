import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { ModelStatus } from './ModelStatus.jsx';
import { AttemptResult } from './AttemptResult.jsx';
import { useCaptureCountdown } from './use-capture-countdown.js';
import { recognitionSupports } from './recognition-support.js';
import './attempt.css';

/**
 * Flujo del intento: estado del modelo, cuenta atrás, captura de 3 s, análisis automático y resultado.
 * Mantiene separadas la detección de manos (cámara), la clasificación experimental y la evaluación
 * académica (inexistente aquí). Sin clasificación para la letra objetivo, no ofrece análisis.
 * @param {{operation: object, capture: object, camera: object, target?: string}} props Modelo, intento, detector y letra.
 * @returns {import('react').ReactElement} Controles y resultados accesibles.
 */
export function ModelInference({ operation, capture, camera, target }) {
  const countdown = useCaptureCountdown();
  const supported = recognitionSupports(target, operation.model);
  const busy = capture.pending || countdown.count !== null;
  if (!supported)
    return (
      <Alert tone="info" title="Sin reconocimiento para esta letra">
        La {target} todavía no tiene reconocimiento experimental: el modelo solo conoce A, E, I, O y
        U. Practica frente a la cámara comparando tu mano con la referencia. No se analizará el
        intento.
      </Alert>
    );
  const attempt = () => {
    operation.clear();
    capture.clear();
    // Solo se analiza en automático si el modelo ya estaba listo al empezar el intento.
    const analyze = operation.model ? operation.predict : undefined;
    countdown.start(() => capture.capture(analyze));
  };
  const status =
    countdown.count !== null
      ? `Prepárate: la captura empieza en ${countdown.count}…`
      : capture.pending
        ? 'Capturando… mantén la seña quieta.'
        : capture.frames
          ? `Intento capturado: ${capture.frames.length} frames reales.`
          : camera.state === 'live'
            ? 'Forma la seña y pulsa Capturar intento.'
            : 'Activa la cámara para hacer un intento.';
  const shown = operation.result && operation.result.frames === capture.frames;
  return (
    <section className="flex flex-col gap-4" aria-label="Modelo propio de LSV">
      <ModelStatus operation={operation} />
      <p className="attempt-status" role="status" aria-live="polite">
        {status}
      </p>
      <div className="camera-actions">
        <Button
          disabled={camera.state !== 'live' || busy}
          loading={busy}
          loadingLabel={
            countdown.count !== null ? `Empieza en ${countdown.count}…` : 'Capturando 3 segundos…'
          }
          onClick={attempt}
        >
          Capturar intento
        </Button>
        <Button
          variant="secondary"
          icon={null}
          disabled={!operation.model || !capture.frames || busy}
          onClick={() => operation.predict(capture.frames)}
        >
          Analizar intento
        </Button>
      </div>
      {shown && (
        <AttemptResult
          result={operation.result}
          model={operation.model}
          target={target}
          disabled={camera.state !== 'live' || busy}
          onRetry={attempt}
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
