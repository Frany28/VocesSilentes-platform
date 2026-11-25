import { useContext, useEffect, useState } from 'react';
import { predictSequence } from '../../../../../shared/lsv/classifier.js';
import { sequenceFeatures } from '../../../../../shared/lsv/sequence.js';
import { RecognitionModelContext } from './model-context.js';
import { validateFrames } from '../../../../../shared/lsv/recording.js';
import { assertModelUsage } from './model-usage.js';
import { predictHandSequence } from '../../../../../shared/lsv/sequence-inference.js';
import { captureFeedback } from './capture-feedback.js';
import {
  analyzeCapture,
  combineEvidence,
  engineSupports,
} from '../../../../../shared/lsv/engine/index.js';

/**
 * Importa y utiliza el modelo propio entrenado, conservando su condición experimental sin notas académicas.
 * Con autoLoad descarga una vez el modelo de demostración del mismo sitio al abrir la práctica, para
 * que el estudiante no tenga que importar un JSON. No solicita cámara ni envía puntos.
 * Con `target`, cada intento también se valida con el motor geométrico (ambas manos) y el
 * resultado incluye `evidence`, la decisión combinada de geometría y modelo.
 * @param {{autoLoad?: boolean, target?: string}} [options] Carga automática y letra objetivo.
 * @returns {object} Modelo, error, hipótesis local y lectura deliberada de JSON; no usa servicios externos.
 */
export function useLocalModel({ autoLoad = false, target } = {}) {
  const geometric = Boolean(target) && engineSupports(target);
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
  const predict = (frames, sequence) => {
    setError('');
    setResult(null);
    if (!model && !geometric) {
      setError('Carga el modelo de vocales antes de analizar el intento.');
      return;
    }
    try {
      const start = performance.now();
      let prediction = null;
      if (model) {
        assertModelUsage(model);
        prediction = sequence
          ? predictHandSequence(model, sequence)
          : predictSequence(model, sequenceFeatures(validateFrames(frames)), frames[0].hand);
      }
      const geometry = geometric ? analyzeCapture(frames, target) : null;
      setResult({
        ...(prediction ?? { label: null, reason: 'GEOMETRY_ONLY' }),
        ...(geometry ? { geometry, evidence: combineEvidence(prediction, geometry, target) } : {}),
        inferenceMs: performance.now() - start,
        frames,
        sequence: sequence ?? null,
        captureIssue: captureFeedback(sequence),
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
    // Puede analizar intentos: con modelo, o solo con el motor geométrico para esta letra.
    ready: Boolean(model) || (geometric && !(autoLoad && demoLoading)),
    geometric,
    predict,
    clear: () => setResult(null),
  };
}
