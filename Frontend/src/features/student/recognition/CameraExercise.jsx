import { useContext } from 'react';
import { RecognitionModelContext } from './model-context.js';
import { DetectionStatus } from './DetectionStatus.jsx';
import { useHandCamera } from './use-hand-camera.js';
import { useSequenceCapture } from './use-sequence-capture.js';
import { useLocalModel } from './use-local-model.js';
import { CameraView } from './CameraView.jsx';
import { CameraControls } from './CameraControls.jsx';
import { ModelInference } from './ModelInference.jsx';
import { ManualReference } from './ManualReference.jsx';
import './recognition.css';
import { recognitionSupports } from './recognition-support.js';
import { hasRealHandExamples } from './practice-hand-support.js';
import { CameraSteps } from './CameraSteps.jsx';
import './letter-badge.css';

/**
 * Integra cámara, referencia y clasificador entrenable en la práctica sin simular una corrección de LSV.
 * @param {{letter?: string, onContinue?: Function}} props Letra objetivo y siguiente paso opcional de observación.
 * @returns {import('react').ReactElement} Práctica local con datos reales y reconocimiento experimental opcional.
 */
export function CameraExercise({ letter, onContinue }) {
  const { referenceHand, setReferenceHand } = useContext(RecognitionModelContext);
  const camera = useHandCamera(setReferenceHand);
  const capture = useSequenceCapture(camera);
  // El modelo de demostración se descarga solo si puede clasificar la letra que se practica.
  const supported = recognitionSupports(letter);
  const operation = useLocalModel({ autoLoad: supported });
  const canPredict =
    supported &&
    (!operation.model || !camera.hand || hasRealHandExamples(operation.model, letter, camera.hand));
  return (
    <section
      className="camera-exercise flex w-full flex-col gap-4"
      aria-label="Práctica con cámara"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="[font:var(--type-h3)]">
          {letter ? `Practica la letra ${letter}` : 'Tu práctica con cámara'}
        </h2>
        <span className="letter-badge" data-tone={supported ? 'ready' : undefined}>
          {supported
            ? canPredict
              ? 'Reconocimiento experimental'
              : 'Práctica por observación'
            : 'Sin reconocimiento todavía'}
        </span>
      </div>
      <DetectionStatus camera={camera} model={operation.model} letter={letter} />
      <CameraSteps letter={letter} supported={canPredict} />
      <div className="camera-workspace">
        <CameraView camera={camera} target={letter} controls={false} />
        <div className="camera-model-panel flex min-w-0 flex-col gap-4">
          <CameraControls camera={camera} />
          {letter && <ManualReference letter={letter} hand={referenceHand} compact />}
          <ModelInference
            operation={operation}
            capture={capture}
            camera={camera}
            target={letter}
            onContinue={onContinue}
          />
        </div>
      </div>
    </section>
  );
}
