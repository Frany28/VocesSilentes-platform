import { useContext, useState } from 'react';
import { predictSequence } from '../../../../../shared/lsv/classifier.js';
import { sequenceFeatures } from '../../../../../shared/lsv/sequence.js';
import { RecognitionModelContext } from './model-context.js';

/**
 * Importa y utiliza el modelo propio entrenado, conservando su condición experimental sin notas académicas.
 * @returns {object} Modelo, error, hipótesis local y lectura deliberada de JSON; no usa servicios externos.
 */
export function useLocalModel() {
  const { model, importModel } = useContext(RecognitionModelContext);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const load = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setResult(null);
    try {
      await importModel(file);
    } catch {
      setError('No se pudo importar este modelo LSV. Usa el JSON generado por lsv:train.');
    }
    event.target.value = '';
  };
  const predict = (frames) => {
    setError('');
    try {
      setResult(predictSequence(model, sequenceFeatures(frames), frames[0].hand));
    } catch {
      setError('No se pudo analizar este intento. Repite la captura.');
    }
  };
  return { model, result, error, load, predict, clear: () => setResult(null) };
}
