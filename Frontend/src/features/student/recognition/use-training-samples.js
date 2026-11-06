import { useRef, useState } from 'react';
import { validateRecording } from '../../../../../shared/lsv/recording.js';
import { assertIndependentSample } from '../../../../../shared/lsv/sample-conflicts.js';
import { downloadJson } from './download-json.js';

/**
 * Conserva muestras solo en memoria y exporta puntos por decisión explícita; no graba ni sube vídeos.
 * @returns {object} Colección, revisión declarada, descarte y descarga local identificada.
 */
export function useTrainingSamples() {
  const [samples, setSamples] = useState([]);
  const current = useRef([]);
  const [error, setError] = useState('');
  const [exported, setExported] = useState(false);
  const add = (metadata, frames, sessionId) => {
    setError('');
    try {
      if (current.current.length >= 100)
        throw new Error('Exporta este lote antes de recopilar más de 100 muestras.');
      const sample = validateRecording({
        ...metadata,
        version: 1,
        id: crypto.randomUUID(),
        sessionId,
        frames,
        reviewStatus: 'PENDING_LSV_REVIEW',
        reviewerId: null,
      });
      assertIndependentSample(sample, current.current);
      current.current = [...current.current, sample];
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
      const revised = validateRecording({ ...original, reviewerId, reviewStatus: 'APPROVED_LSV' });
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
  return { samples, error, add, review, remove, download, dirty: samples.length > 0 && !exported };
}
