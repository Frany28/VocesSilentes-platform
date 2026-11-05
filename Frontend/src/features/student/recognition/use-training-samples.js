import { useState } from 'react';
import { validateRecording } from '../../../../../shared/lsv/recording.js';
import { downloadJson } from './download-json.js';

/**
 * Conserva muestras solo en memoria y exporta puntos por decisión explícita; no graba ni sube vídeos.
 * @returns {object} Colección, revisión declarada, descarte y descarga local identificada.
 */
export function useTrainingSamples() {
  const [samples, setSamples] = useState([]);
  const [error, setError] = useState('');
  const [exported, setExported] = useState(false);
  const add = (metadata, frames, sessionId) => {
    setError('');
    try {
      if (samples.length >= 100)
        throw new Error('Exporta este lote antes de recopilar más de 100 muestras.');
      const sample = validateRecording({
        ...metadata,
        version: 1,
        id: crypto.randomUUID(),
        sessionId,
        frames,
        reviewStatus: 'PENDING_LSV_REVIEW',
      });
      setSamples((previous) => [...previous, sample]);
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
      const original = samples.find((sample) => sample.id === id);
      const revised = validateRecording({ ...original, reviewerId, reviewStatus: 'APPROVED_LSV' });
      setSamples((previous) => previous.map((sample) => (sample.id === id ? revised : sample)));
      setExported(false);
    } catch (failure) {
      setError(failure.message);
    }
  };
  const remove = (id) => {
    setSamples((previous) => previous.filter((sample) => sample.id !== id));
    setExported(false);
  };
  const download = () => {
    downloadJson({ version: 1, samples }, `lsv-samples-${Date.now()}.json`);
    setExported(true);
  };
  return { samples, error, add, review, remove, download, dirty: samples.length > 0 && !exported };
}
