import { VideoTrainingPanel } from '../features/student/recognition/VideoTrainingPanel.jsx';
import { TrainingSamples } from '../features/student/recognition/TrainingSamples.jsx';
import { TrainingCoverage } from '../features/student/recognition/TrainingCoverage.jsx';
import { useLocalVideos } from '../features/student/recognition/use-local-videos.js';
import { useVideoProcessing } from '../features/student/recognition/use-video-processing.js';
import { useTrainingSamples } from '../features/student/recognition/use-training-samples.js';

/**
 * Monta componentes y estado reales del importador sin servidor ni autenticación simulada de producción.
 * @returns {import('react').ReactElement} Harness de pruebas; no contiene muestras ni resultados de IA.
 */
export function VideoLabHarness() {
  const files = useLocalVideos();
  const operation = useVideoProcessing();
  const collection = useTrainingSamples();
  return (
    <>
      <VideoTrainingPanel files={files} operation={operation} collection={collection} />
      <TrainingSamples collection={collection} onPreview={files.preview} busy={operation.pending} />
      <TrainingCoverage samples={collection.samples} />
    </>
  );
}
