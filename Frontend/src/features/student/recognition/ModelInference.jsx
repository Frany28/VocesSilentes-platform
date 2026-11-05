import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';

/**
 * Presenta un modelo importado y sus hipótesis como experimentales, sin prometer precisión ni completar ejercicios.
 * @param {{operation: object, capture: object, camera: object}} props Modelo, intento y detector.
 * @returns {import('react').ReactElement} Importación y análisis explícito del intento capturado.
 */
export function ModelInference({ operation, capture, camera }) {
  return (
    <section className="flex flex-col gap-4" aria-label="Modelo propio de LSV">
      <details className="model-settings">
        <summary>Cargar un modelo entrenado</summary>
        <label className="model-file-label">
          Importar modelo LSV entrenado (.json)
          <input type="file" accept=".json,application/json" onChange={operation.load} />
        </label>
      </details>
      {operation.model ? (
        <p className="text-muted">
          Modelo experimental cargado:{' '}
          {operation.model.labels.filter((label) => label !== 'NONE').join(', ')}.
        </p>
      ) : (
        <p className="text-muted">
          Aún no hay un modelo LSV entrenado. Puedes detectar manos y preparar muestras en el
          laboratorio.
        </p>
      )}
      <div className="camera-actions">
        <Button
          disabled={camera.state !== 'live'}
          loading={capture.pending}
          loadingLabel="Capturando 3 segundos…"
          onClick={() => {
            operation.clear();
            capture.capture();
          }}
        >
          Capturar intento
        </Button>
        <Button
          variant="secondary"
          icon={null}
          disabled={!operation.model || !capture.frames || capture.pending}
          onClick={() => operation.predict(capture.frames)}
        >
          Analizar intento
        </Button>
      </div>
      {capture.frames && (
        <p role="status">Intento capturado: {capture.frames.length} frames reales.</p>
      )}
      {operation.result && (
        <Alert tone="info" title="Hipótesis experimental">
          {operation.result.label
            ? `El modelo propone: ${operation.result.label}.`
            : 'El modelo no tiene una hipótesis fiable para este intento.'}{' '}
          Este resultado no califica ni completa el ejercicio.
        </Alert>
      )}
      {(capture.error || operation.error) && (
        <Alert tone="error" title="Intento no disponible">
          {capture.error || operation.error}
        </Alert>
      )}
    </section>
  );
}
