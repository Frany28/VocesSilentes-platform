import { useContext, useEffect, useRef, useState } from 'react';
import { predictSequence } from '../../../../../shared/lsv/classifier.js';
import { sequenceFeatures } from '../../../../../shared/lsv/sequence.js';
import { RecognitionModelContext } from './model-context.js';
import { validateFrames } from '../../../../../shared/lsv/recording.js';
import { assertModelUsage } from './model-usage.js';
import { readDemoModel } from './demo-model.js';

/**
 * Importa y utiliza el modelo propio entrenado, conservando su condición experimental sin notas académicas.
 * Con autoLoad descarga una vez el modelo de demostración del mismo sitio al abrir la práctica, para
 * que el estudiante no tenga que importar un JSON. No solicita cámara ni envía puntos.
 * @param {{autoLoad?: boolean}} [options] Carga automática del modelo de demostración.
 * @returns {object} Modelo, error, hipótesis local y lectura deliberada de JSON; no usa servicios externos.
 */
export function useLocalModel({ autoLoad = false } = {}) {
  const { model, importModel, claimAutoLoad } = useContext(RecognitionModelContext);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Separado de error: un fallo de descarga del modelo no es un fallo del intento del estudiante.
  const [loadError, setLoadError] = useState('');
  const active = useRef(null);
  useEffect(() => () => active.current?.abort(), []);
  const loadDemo = async () => {
    if (active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setLoadError('');
    setResult(null);
    try {
      const demo = await readDemoModel(controller.signal);
      await importModel(new File([JSON.stringify(demo)], 'lsv-vowels-demo-v1.json'));
    } catch (failure) {
      if (!controller.signal.aborted)
        setLoadError(
          failure instanceof SyntaxError
            ? 'El modelo de vocales publicado no es válido.'
            : failure.message,
        );
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  };
  useEffect(() => {
    // Un solo intento automático por sesión: si falla, el botón permite reintentar sin bucles.
    // La descarga es un sistema externo: se inicia en un callback, no en el cuerpo del efecto.
    if (!autoLoad || model || !claimAutoLoad()) return;
    queueMicrotask(loadDemo);
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
    loadError,
    load,
    loadDemo,
    loading,
    predict,
    clear: () => setResult(null),
  };
}
