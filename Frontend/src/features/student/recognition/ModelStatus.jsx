import { Button } from '../../../components/ui/Button.jsx';
import { modelHands } from './recognition-support.js';

const handNames = { Right: 'derecha', Left: 'izquierda' };

/**
 * Estado del clasificador experimental: cargando, listo (con sus límites) o pendiente, con reintento
 * y la importación manual como opción avanzada.
 * @param {{operation: object}} props Resultado de useLocalModel.
 * @returns {import('react').ReactElement} Estado accesible del modelo.
 */
export function ModelStatus({ operation }) {
  const { model, loading } = operation;
  return (
    <section className="flex flex-col gap-3" aria-label="Modelo experimental">
      {model ? (
        <p className="model-status" data-state="ready" aria-live="polite">
          Modelo experimental cargado: {model.labels.filter((label) => label !== 'NONE').join(', ')}
          . Ejemplos solo con la mano{' '}
          {modelHands(model)
            .map((hand) => handNames[hand] ?? hand)
            .join(' y ')}
          . Sin precisión validada: no califica.
        </p>
      ) : (
        <>
          <p className="model-status" aria-live="polite">
            {loading
              ? 'Cargando el modelo de vocales…'
              : 'Sin modelo cargado: la cámara solo detecta puntos de la mano.'}
          </p>
          {operation.loadError && (
            <p className="model-status" data-state="error">
              {operation.loadError} La práctica con cámara sigue disponible sin análisis.
            </p>
          )}
          <Button loading={loading} loadingLabel="Cargando vocales…" onClick={operation.loadDemo}>
            Cargar modelo de vocales
          </Button>
        </>
      )}
      <details className="model-settings">
        <summary>Cargar un modelo entrenado</summary>
        <label className="model-file-label">
          Importar modelo LSV entrenado (.json)
          <input type="file" accept=".json,application/json" onChange={operation.load} />
        </label>
      </details>
    </section>
  );
}
