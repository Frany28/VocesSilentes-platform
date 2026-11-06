import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { isLocalExperiment } from './local-experiment.js';
import { useExperimentAssets } from './use-experiment-assets.js';

/**
 * Carga deliberadamente artefactos privados servidos solo por Vite local; nunca pide cámara ni envía puntos.
 * @param {{collection: object, busy: boolean}} props Colección compartida y operación activa.
 * @returns {import('react').ReactElement | null} Acceso al primer modelo y sus nueve muestras confirmadas.
 */
export function LocalExperimentAssets({ collection, busy }) {
  const { model, pending, error, load } = useExperimentAssets(collection);
  if (!isLocalExperiment()) return null;
  return (
    <section className="education-card flex flex-col gap-3" aria-label="Experimento local">
      <h2 className="[font:var(--type-h3)]">ENTRENAMIENTO EXPERIMENTAL LOCAL</h2>
      <p>
        Demostración técnica con etiquetas provisionales. Sin revisión experta LSV ni evaluación
        independiente. Permisos del metraje original pendientes de evidencia. No califica
        estudiantes.
      </p>
      <div className="camera-actions">
        <Button disabled={busy || pending} onClick={() => load('model')}>
          Cargar modelo experimental local
        </Button>
        <Button
          variant="secondary"
          icon={null}
          disabled={busy || pending}
          onClick={() => load('samples')}
        >
          Incorporar nueve muestras confirmadas
        </Button>
      </div>
      {model?.trainingMode && <p role="status">Modelo local listo: {model.labels.join(', ')}.</p>}
      {pending && <p role="status">Cargando artefacto local…</p>}
      {error && (
        <Alert tone="error" title="Artefacto no disponible">
          {error}
        </Alert>
      )}
    </section>
  );
}
