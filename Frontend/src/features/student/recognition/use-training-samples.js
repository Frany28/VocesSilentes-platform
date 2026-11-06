import { useRef, useState } from 'react';
import { samplePolicy } from './sample-policy.js';
import { downloadJson } from './download-json.js';

/**
 * Conserva muestras solo en memoria y exporta puntos por decisión explícita; no graba ni sube vídeos.
 * @param {boolean} [experimental] Usa un contrato provisional separado.
 * @returns {object} Colección, revisión declarada, descarte y descarga local identificada.
 */
export function useTrainingSamples(experimental = false) {
  const policy = samplePolicy(experimental);
  const [samples, setSamples] = useState([]);
  const current = useRef([]);
  const [error, setError] = useState('');
  const [exported, setExported] = useState(false);
  const add = (metadata, frames, sessionId) => {
    setError('');
    try {
      const sample = policy.create(metadata, frames, sessionId);
      current.current = policy.unique([...current.current, sample]);
      setSamples(current.current);
      setExported(false);
      return true;
    } catch (failure) {
      setError(failure.message);
      return false;
    }
  };
  const review = (id, reviewerId) => {
    setError('');
    try {
      const original = current.current.find((sample) => sample.id === id);
      const revised = policy.review(original, reviewerId);
      current.current = current.current.map((sample) => (sample.id === id ? revised : sample));
      setSamples(current.current);
      setExported(false);
    } catch (failure) {
      setError(failure.message);
    }
  };
  const remove = (id) => {
    current.current = current.current.filter((sample) => sample.id !== id);
    setSamples(current.current);
    setExported(false);
  };
  const download = () => {
    downloadJson({ version: 1, samples: current.current }, `lsv-samples-${Date.now()}.json`);
    setExported(true);
  };
  const importData = (data) => {
    setError('');
    try {
      current.current = policy.unique([...current.current, ...policy.read(data)]);
      setSamples(current.current);
      setExported(false);
    } catch (failure) {
      setError(failure.message);
    }
  };
  return {
    samples,
    error,
    add,
    review,
    remove,
    download,
    importData,
    experimental,
    dirty: samples.length > 0 && !exported,
  };
}
