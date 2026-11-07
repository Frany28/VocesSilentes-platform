import { useContext, useEffect, useState } from 'react';
import { predictSequence } from '../../../../../shared/lsv/classifier.js';
import { sequenceFeatures } from '../../../../../shared/lsv/sequence.js';
import { RecognitionModelContext } from './model-context.js';
import { validateFrames } from '../../../../../shared/lsv/recording.js';
import { assertModelUsage } from './model-usage.js';

/**
 * Importa y utiliza el modelo propio entrenado, conservando su condición experimental sin notas académicas.
 * Con autoLoad descarga una vez el modelo de demostración del mismo sitio al abrir la práctica, para
 * que el estudiante no tenga que importar un JSON. No solicita cámara ni envía puntos.
 * @param {{autoLoad?: boolean}} [options] Carga automática del modelo de demostración.
 * @returns {object} Modelo, error, hipótesis local y lectura deliberada de JSON; no usa servicios externos.
 */
export function useLocalModel({ autoLoad = false } = {}) {
  const { model, importModel, demoLoading, demoError, loadDemo, autoLoadDemo } =
    useContext(RecognitionModelContext);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    // La descarga (una vez por sesión) es un sistema externo: se inicia en un callback.
    if (!autoLoad || model) return;
    queueMicrotask(autoLoadDemo);
  });
  const load = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setResult(null);
    try {
      await importModel(file);
    } catch {
      setError(
        'No se pudo importar este modelo LSV. Usa un JSON generado por el entrenamiento del proyecto.',
      );
    }
    event.target.value = '';
  };
  const predict = (frames) => {
    setError('');
    setResult(null);
    if (!model) {
      setError('Carga el modelo de vocales antes de analizar el intento.');
      return;
    }
    try {
      assertModelUsage(model);
      setResult({
        ...predictSequence(model, sequenceFeatures(validateFrames(frames)), frames[0].hand),
        frames,
      });
    } catch {
      setError('No se pudo analizar este intento. Repite la captura.');
    }
  };
  return {
    model,
    result,
    error,
    // Separado de error: un fallo de descarga del modelo no es un fallo del intento.
    loadError: demoError,
    load,
    loadDemo: () => {
      setResult(null);
      return loadDemo();
    },
    loading: demoLoading,
    predict,
    clear: () => setResult(null),
  };
}
