import { useContext, useEffect, useRef, useState } from 'react';
import { RecognitionModelContext } from './model-context.js';
import { isLocalExperiment } from './local-experiment.js';

/**
 * Lee los dos artefactos privados fijos de Vite por acción explícita, sin enviar muestras al servidor.
 * @param {object} collection Colección compartida de muestras locales.
 * @returns {object} Modelo, estado, error y carga cancelable al salir; no activa cámara.
 */
export function useExperimentAssets(collection) {
  const { model, importModel } = useContext(RecognitionModelContext);
  const active = useRef(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => () => active.current?.abort(), []);
  const load = async (kind) => {
    if (!isLocalExperiment() || active.current || !['model', 'samples'].includes(kind)) return;
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    setError('');
    try {
      // Son archivos de desarrollo de este origen; requestJson se reserva para la API autenticada.
      const response = await fetch(`/__local-lsv/${kind}`, { signal: controller.signal });
      if (!response.ok)
        throw new Error(
          'Artefacto local ausente. Entrena con lsv:train:experimental o importa tu JSON.',
        );
      const blob = await response.blob();
      controller.signal.throwIfAborted();
      if (kind === 'model') await importModel(new File([blob], 'lsv-experimental-model.json'));
      else {
        const data = JSON.parse(await blob.text());
        controller.signal.throwIfAborted();
        collection.importData(data);
      }
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message);
    } finally {
      active.current = null;
      if (!controller.signal.aborted) setPending(false);
    }
  };
  return { model, pending, error, load };
}
