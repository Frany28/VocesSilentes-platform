import { Button } from '../../../components/ui/Button.jsx';
import { modelHands } from './recognition-support.js';

const handNames = { Right: 'derecha', Left: 'izquierda' };

/**
 * Estado del reconocimiento experimental. El estudiante no carga modelos: la demostración se descarga
 * sola y solo se ofrece reintentar si falla. Importar un JSON queda para el laboratorio (allowImport).
 * @param {{operation: object, allowImport?: boolean}} props Resultado de useLocalModel y modo laboratorio.
 * @returns {import('react').ReactElement} Estado accesible del modelo.
 */
export function ModelStatus({ operation, allowImport = false }) {
  const { model, loading, loadError } = operation;
  let message = 'Estamos preparando tu práctica…';
  if (!allowImport) {
    if (model)
      return (
        <p className="sr-only" role="status">
          Todo listo para practicar.
        </p>
      );
    return (
      <div className="practice-model-state" aria-live="polite">
        <p>
          {loadError
            ? 'La ayuda automática no está disponible. Puedes practicar con la referencia.'
            : message}
        </p>
        {loadError && (
          <Button variant="secondary" icon={null} loading={loading} onClick={operation.loadDemo}>
            Reintentar
          </Button>
        )}
      </div>
    );
  }
  if (model)
    message = `Reconocimiento experimental listo: ${model.labels
      .filter((label) => label !== 'NONE')
      .join(', ')}. Ejemplos solo con la mano ${modelHands(model)
      .map((hand) => handNames[hand] ?? hand)
      .join(' y ')}. Sin precisión validada: no califica.`;
  else if (loadError) message = `${loadError} Puedes practicar frente a la cámara sin análisis.`;
  else if (!loading && allowImport) message = 'Sin modelo cargado: la cámara solo detecta puntos.';
  return (
    <section className="flex flex-col gap-3" aria-label="Reconocimiento experimental">
      <p
        className="model-status"
        data-state={model ? 'ready' : loadError ? 'error' : 'loading'}
        aria-live="polite"
      >
        {message}
      </p>
      {!model && loadError && (
        <Button variant="secondary" icon={null} loading={loading} onClick={operation.loadDemo}>
          Reintentar
        </Button>
      )}
      {allowImport && (
        <details className="model-settings">
          <summary>Cargar un modelo entrenado</summary>
          <label className="model-file-label">
            Importar modelo LSV entrenado (.json)
            <input type="file" accept=".json,application/json" onChange={operation.load} />
          </label>
        </details>
      )}
    </section>
  );
}
