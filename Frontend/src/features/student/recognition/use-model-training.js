import { useContext, useEffect, useRef, useState } from 'react';
import { RecognitionModelContext } from './model-context.js';
import { downloadJson } from './download-json.js';
import { validateModel } from '../../../../../shared/lsv/classifier.js';

/**
 * Entrena el clasificador propio en un worker local; solo emite métricas de los datos recibidos y nunca califica alumnos.
 * @returns {object} Entrenamiento, artefactos experimentales, cancelación y activación deliberada para practicar.
 */
export function useModelTraining() {
  const active = useRef(null);
  const { importModel } = useContext(RecognitionModelContext);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);
  useEffect(
    () => () => {
      const worker = active.current;
      active.current = null;
      worker?.terminate();
    },
    [],
  );
  const cancel = () => {
    active.current?.terminate();
    active.current = null;
    setPending(false);
  };
  const train = (samples, experimental = false, options = {}) => {
    if (active.current) return;
    setResult(null);
    setApplied(false);
    setError('');
    try {
      const worker = new Worker(new URL('./training.worker.js', import.meta.url), {
        type: 'module',
      });
      active.current = worker;
      setPending(true);
      worker.onmessage = ({ data }) => {
        if (active.current !== worker) return;
        cancel();
        if (data.error) setError(data.error);
        else {
          try {
            validateModel(data.model);
            setResult(data);
          } catch {
            setError('El entrenamiento produjo un modelo incompatible.');
          }
        }
      };
      worker.onerror = () => {
        if (active.current !== worker) return;
        cancel();
        setError('No se pudo completar el entrenamiento local. Revisa los datos y reintenta.');
      };
      worker.postMessage({
        samples,
        ...options,
        ...(experimental ? { mode: 'LOCAL_PROVISIONAL' } : {}),
      });
    } catch {
      cancel();
      setError(
        'Este navegador no permite entrenar en un worker. Puedes usar el comando lsv:train.',
      );
    }
  };
  const apply = async () => {
    try {
      await importModel(
        new File([JSON.stringify(result.model)], 'lsv-experimental-model.json', {
          type: 'application/json',
        }),
      );
      setApplied(true);
    } catch {
      setError('No se pudo cargar el modelo entrenado para practicar.');
    }
  };
  return {
    pending,
    result,
    error,
    applied,
    train,
    cancel,
    apply,
    downloadModel: () =>
      downloadJson(
        result.model,
        result.model.trainingMode ? 'lsv-experimental-model.json' : 'lsv-model.json',
      ),
    downloadReport: () =>
      downloadJson(
        result.report,
        result.model.trainingMode ? 'experimental-summary.json' : 'evaluation.json',
      ),
  };
}
