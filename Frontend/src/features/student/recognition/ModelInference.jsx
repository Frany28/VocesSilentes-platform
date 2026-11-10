import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { ModelStatus } from './ModelStatus.jsx';
import { LabAttemptResult } from './LabAttemptResult.jsx';
import { StudentAttempt } from './StudentAttempt.jsx';
import { useModelAttempt } from './use-model-attempt.js';
import './attempt.css';

/**
 * Flujo del intento: estado del modelo, captura automática (o manual con cuenta atrás), análisis
 * automático y resultado. Mantiene separadas la detección de manos, la clasificación experimental y
 * la evaluación académica (inexistente aquí). Sin clasificación para la letra objetivo, no hay análisis.
 * @param {{operation: object, capture: object, camera: object, target?: string, lab?: boolean, onContinue?: Function}} props
 * Modelo, intento, detector, letra y modo laboratorio (importar, reanalizar y captura manual por defecto).
 * @returns {import('react').ReactElement} Controles y resultados accesibles.
 */
export function ModelInference({ operation, capture, camera, target, lab = false, onContinue }) {
  const attempt = useModelAttempt({ operation, capture, camera, target, lab });
  const { countdown, supported, busy, preparing, live, manual, status, shown } = attempt;
  if (!lab)
    return (
      <StudentAttempt
        attempt={attempt}
        operation={operation}
        capture={capture}
        target={target}
        onContinue={onContinue}
      />
    );
  if (!supported)
    return (
      <Alert tone="info" title="Sin reconocimiento para esta letra">
        La {target} todavía no tiene reconocimiento experimental: el modelo solo conoce A, E, I, O y
        U. Practica frente a la cámara comparando tu mano con la referencia. No se analizará el
        intento.
      </Alert>
    );
  return (
    <section className="flex flex-col gap-4" aria-label="Modelo propio de LSV">
      <ModelStatus operation={operation} allowImport={lab} />
      <p className="attempt-status" role="status">
        {status}
      </p>
      <div className="camera-actions">
        <Button
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
        <LabAttemptResult
          result={operation.result}
          model={operation.model}
          target={target}
          disabled={!live || busy}
          onRetry={manual}
          onContinue={onContinue}
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
