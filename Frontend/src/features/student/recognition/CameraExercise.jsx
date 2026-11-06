import { Link } from 'react-router';
import { useHandCamera } from './use-hand-camera.js';
import { useSequenceCapture } from './use-sequence-capture.js';
import { useLocalModel } from './use-local-model.js';
import { CameraView } from './CameraView.jsx';
import { ModelInference } from './ModelInference.jsx';
import { ManualReference } from './ManualReference.jsx';
import './recognition.css';
import { isLocalExperiment } from './local-experiment.js';

/**
 * Integra cámara, referencia y clasificador entrenable en la práctica sin simular una corrección de LSV.
 * @param {{letter?: string}} props Letra objetivo de estudio, que nunca se utiliza como predicción.
 * @returns {import('react').ReactElement} Práctica local con datos reales y reconocimiento experimental opcional.
 */
export function CameraExercise({ letter }) {
  const camera = useHandCamera();
  const capture = useSequenceCapture(camera);
  const operation = useLocalModel();
  return (
    <section
      className="camera-exercise flex w-full flex-col gap-4"
      aria-label="Práctica con cámara"
    >
      <h2 className="[font:var(--type-h3)]">
        {letter ? `Practica la letra ${letter}` : 'Tu práctica con cámara'}
      </h2>
      <div className="camera-reference-grid">
        {letter && <ManualReference letter={letter} compact />}
        <CameraView camera={camera} target={letter} />
      </div>
      <ModelInference operation={operation} capture={capture} camera={camera} />
      {isLocalExperiment() && (
        <Link
          className="education-back inline-flex min-h-11 items-center"
          to="/student/practice/model-lab"
        >
          Preparar muestras para nuestro modelo LSV
        </Link>
      )}
    </section>
  );
}
