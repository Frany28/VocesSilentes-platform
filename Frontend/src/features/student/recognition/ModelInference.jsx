import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';

const reasons = {
  UNSUPPORTED_HAND: 'No hay ejemplos de esta lateralidad.',
  OUT_OF_DISTRIBUTION: 'El intento está demasiado lejos de los ejemplos.',
  BACKGROUND: 'Se parece a NONE, fuera de las vocales objetivo.',
  AMBIGUOUS: 'Las clases competidoras son demasiado parecidas.',
};

/**
 * Presenta un modelo importado y sus hipótesis como experimentales, sin prometer precisión ni completar ejercicios.
 * @param {{operation: object, capture: object, camera: object}} props Modelo, intento y detector.
 * @returns {import('react').ReactElement} Importación y análisis explícito del intento capturado.
 */
export function ModelInference({ operation, capture, camera }) {
  return (
    <section className="flex flex-col gap-4" aria-label="Modelo propio de LSV">
      <Button
        loading={operation.loading}
        loadingLabel="Cargando vocales…"
        disabled={capture.pending}
        onClick={operation.loadDemo}
      >
        Cargar modelo de vocales
      </Button>
      <p className="text-muted">
        Práctica educativa con nueve ejecuciones reales de A, E, I, O y U. Modelo experimental sin
        revisión experta ni precisión validada. No califica estudiantes.
      </p>
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
          Carga el modelo de vocales para analizar tus intentos. Hasta cargarlo, la cámara solo
          detecta puntos de manos.
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
      {operation.result && operation.result.frames === capture.frames && (
        <Alert tone="info" title="Hipótesis experimental">
          {operation.result.label
            ? `El modelo propone: ${operation.result.label}.`
            : 'El modelo no tiene una hipótesis fiable para este intento.'}{' '}
          Este resultado no califica ni completa el ejercicio. {reasons[operation.result.reason]}
          {operation.model.trainingMode &&
            ' Umbrales sin calibrar; puede abstenerse o confundir letras.'}
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
