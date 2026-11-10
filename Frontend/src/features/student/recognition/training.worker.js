import { prepareTrainingData } from '../../../../../shared/lsv/training-data.js';
import { trainLsvModel } from '../../../../../shared/lsv/train.js';
import { trainExperimentalModel } from '../../../../../shared/lsv/experimental-train.js';
import { isLocalExperiment } from './local-experiment.js';
import { compareHandExperiments } from '../../../../../shared/lsv/hand-experiments.js';

// El worker procesa solo el lote consentido recibido por la página; no tiene red ni persistencia.
self.onmessage = async ({ data }) => {
  try {
    if (data.mode === 'LOCAL_PROVISIONAL') {
      if (!isLocalExperiment())
        throw new Error('El flujo provisional requiere desarrollo en localhost');
      if (data.compareHands) {
        const comparison = compareHandExperiments(data.samples, data.augmentation);
        const selected = comparison.experiments[data.augmentation ? 'C' : 'B'];
        if (!selected.model) throw new Error(selected.reason);
        self.postMessage({ model: selected.model, report: { ...selected.report, comparison } });
        return;
      }
      self.postMessage(trainExperimentalModel(data.samples));
      return;
    }
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
