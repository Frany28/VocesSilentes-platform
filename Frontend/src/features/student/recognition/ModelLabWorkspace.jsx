import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
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

/**
 * Coordina importación y cámara con un lote local común y guardas de pérdida, sin progreso académico.
 * @returns {import('react').ReactElement} Laboratorio USER con captura, revisión, cobertura y entrenamiento.
 */
export function ModelLabWorkspace() {
  const [mode, setMode] = useState('camera');
  const camera = useHandCamera();
  const capture = useSequenceCapture(camera);
  const collection = useTrainingSamples();
  const files = useLocalVideos();
  const operation = useVideoProcessing();
  const busy = capture.pending || operation.pending || files.pending;
  const dirty = collection.dirty || Boolean(operation.preview);
  const leave = useDraftLeave(dirty, busy, '/student');
  return (
    <>
      <div className="camera-actions" role="group" aria-label="Origen de muestras">
        <Button
          variant="secondary"
          icon={null}
          aria-pressed={mode === 'camera'}
          disabled={busy}
          onClick={() => setMode('camera')}
        >
          Usar cámara
        </Button>
        <Button
          variant="secondary"
          icon={null}
          aria-pressed={mode === 'video'}
          disabled={busy}
          onClick={() => {
            camera.stop();
            setMode('video');
          }}
        >
          Importar video local
        </Button>
      </div>
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
          if (files.preview(sample)) {
            operation.clear();
            setMode('video');
          }
        }}
      />
      <TrainingCoverage samples={collection.samples} />
      <ModelTraining samples={collection.samples} />
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
