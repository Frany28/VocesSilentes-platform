import { prepareTrainingData } from '../../../../../shared/lsv/training-data.js';
import { trainLsvModel } from '../../../../../shared/lsv/train.js';

// El worker procesa solo el lote consentido recibido por la página; no tiene red ni persistencia.
self.onmessage = async ({ data }) => {
  try {
    const dataset = prepareTrainingData(data.samples);
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(data.samples)),
    );
    dataset.sources = [
      [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join(''),
    ];
    const labels = [...new Set(dataset.records.map((sample) => sample.label))].sort();
    const result = trainLsvModel(dataset, labels);
    self.postMessage(result);
  } catch (error) {
    self.postMessage({ error: error.message });
  }
};
