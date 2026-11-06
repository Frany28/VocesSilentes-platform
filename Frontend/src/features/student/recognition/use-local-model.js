import { useContext, useEffect, useRef, useState } from 'react';
import { predictSequence } from '../../../../../shared/lsv/classifier.js';
import { sequenceFeatures } from '../../../../../shared/lsv/sequence.js';
import { RecognitionModelContext } from './model-context.js';
import { validateFrames } from '../../../../../shared/lsv/recording.js';
import { assertModelUsage } from './model-usage.js';
import { readDemoModel } from './demo-model.js';

/**
 * Importa y utiliza el modelo propio entrenado, conservando su condición experimental sin notas académicas.
 * @returns {object} Modelo, error, hipótesis local y lectura deliberada de JSON; no usa servicios externos.
 */
export function useLocalModel() {
  const { model, importModel } = useContext(RecognitionModelContext);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const active = useRef(null);
  useEffect(() => () => active.current?.abort(), []);
  const loadDemo = async () => {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const demo = await readDemoModel(controller.signal);
      await importModel(new File([JSON.stringify(demo)], 'lsv-vowels-demo-v1.json'));
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message);
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  };
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
    setResult(null);
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
  return { model, result, error, load, loadDemo, loading, predict, clear: () => setResult(null) };
}
