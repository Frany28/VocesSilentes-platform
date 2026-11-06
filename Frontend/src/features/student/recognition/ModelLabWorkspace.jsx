import { useState } from 'react';
import { TrainingSourceSelector } from './TrainingSourceSelector.jsx';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog.jsx';
import { useDraftLeave } from '../../../hooks/use-draft-leave.js';
import { useHandCamera } from './use-hand-camera.js';
import { useSequenceCapture } from './use-sequence-capture.js';
import { useTrainingSamples } from './use-training-samples.js';
import { useLocalVideos } from './use-local-videos.js';
import { useVideoProcessing } from './use-video-processing.js';
import { LiveTrainingPanel } from './LiveTrainingPanel.jsx';
import { VideoTrainingPanel } from './VideoTrainingPanel.jsx';
import { TrainingSamples } from './TrainingSamples.jsx';
import { TrainingCoverage } from './TrainingCoverage.jsx';
import { ModelTraining } from './ModelTraining.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { isLocalExperiment } from './local-experiment.js';
import { LocalExperimentAssets } from './LocalExperimentAssets.jsx';

/**
 * Coordina importación y cámara con un lote local común y guardas de pérdida, sin progreso académico.
 * @returns {import('react').ReactElement} Laboratorio USER con captura, revisión, cobertura y entrenamiento.
 */
export function ModelLabWorkspace() {
  const [mode, setMode] = useState('camera');
  const [experimental, setExperimental] = useState(isLocalExperiment);
  const camera = useHandCamera();
  const capture = useSequenceCapture(camera);
  const collection = useTrainingSamples(experimental);
  const files = useLocalVideos();
  const operation = useVideoProcessing();
  const busy = capture.pending || operation.pending || files.pending;
  const dirty = collection.dirty || Boolean(operation.preview);
  const leave = useDraftLeave(dirty, busy, '/student');
  return (
    <>
      {isLocalExperiment() && (
        <Select
          label="Flujo de entrenamiento"
          value={experimental ? 'local' : 'reviewed'}
          disabled={busy || collection.samples.length > 0}
          onChange={(event) => {
            camera.stop();
            capture.clear();
            setExperimental(event.target.value === 'local');
          }}
        >
          <option value="local">ENTRENAMIENTO EXPERIMENTAL LOCAL</option>
          <option value="reviewed">Entrenamiento con revisión y evaluación independiente</option>
        </Select>
      )}
      {experimental && <LocalExperimentAssets collection={collection} busy={busy} />}
      <TrainingSourceSelector
        mode={mode}
        busy={busy}
        onChange={(value) => {
          camera.stop();
          capture.clear();
          setMode(value);
        }}
      />
      {mode === 'camera' ? (
        <LiveTrainingPanel camera={camera} capture={capture} collection={collection} />
      ) : (
        <VideoTrainingPanel files={files} operation={operation} collection={collection} />
      )}
      <TrainingSamples
        collection={collection}
        busy={busy}
        onPreview={(sample) => {
          if (busy) return;
          camera.stop();
          capture.clear();
          setMode('video');
          if (files.preview(sample)) {
            operation.clear();
          }
        }}
      />
      {!experimental && <TrainingCoverage samples={collection.samples} />}
      <ModelTraining
        key={String(experimental)}
        samples={collection.samples}
        experimental={experimental}
      />
      {leave.confirm && (
        <ConfirmationDialog
          title="¿Salir sin exportar las muestras?"
          confirm="Salir sin exportar"
          onConfirm={leave.proceed}
          onCancel={leave.cancel}
        >
          Las muestras o extracciones que siguen en memoria se perderán al salir.
        </ConfirmationDialog>
      )}
    </>
  );
}
