import { Link } from 'react-router';
import { useHandCamera } from './use-hand-camera.js';
import { useSequenceCapture } from './use-sequence-capture.js';
import { useLocalModel } from './use-local-model.js';
import { CameraView } from './CameraView.jsx';
import { CameraControls } from './CameraControls.jsx';
import { ModelInference } from './ModelInference.jsx';
import { ManualReference } from './ManualReference.jsx';
import './recognition.css';
import { isLocalExperiment } from './local-experiment.js';
import { recognitionSupports } from './recognition-support.js';

/**
 * Integra cámara, referencia y clasificador entrenable en la práctica sin simular una corrección de LSV.
 * @param {{letter?: string}} props Letra objetivo de estudio, que nunca se utiliza como predicción.
 * @returns {import('react').ReactElement} Práctica local con datos reales y reconocimiento experimental opcional.
 */
export function CameraExercise({ letter }) {
  const camera = useHandCamera();
  const capture = useSequenceCapture(camera);
  // El modelo de demostración se descarga solo si puede clasificar la letra que se practica.
  const operation = useLocalModel({ autoLoad: recognitionSupports(letter) });
  return (
    <section
      className="camera-exercise flex w-full flex-col gap-4"
      aria-label="Práctica con cámara"
    >
      <h2 className="[font:var(--type-h3)]">
        {letter ? `Practica la letra ${letter}` : 'Tu práctica con cámara'}
      </h2>
      <div className="camera-workspace">
        <CameraView camera={camera} target={letter} controls={false} />
        <div className="camera-model-panel flex min-w-0 flex-col gap-4">
          <CameraControls camera={camera} />
          {letter && <ManualReference letter={letter} compact />}
          <ModelInference operation={operation} capture={capture} camera={camera} target={letter} />
        </div>
      </div>
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
