import { useContext, useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { RecognitionModelContext } from './model-context.js';
import { DetectionStatus } from './DetectionStatus.jsx';
import { useHandCamera } from './use-hand-camera.js';
import { useSequenceCapture } from './use-sequence-capture.js';
import { useLocalModel } from './use-local-model.js';
import { useModelAttempt } from './use-model-attempt.js';
import { CameraView } from './CameraView.jsx';
import { CameraControls } from './CameraControls.jsx';
import { StudentAttempt } from './StudentAttempt.jsx';
import { ManualReference } from './ManualReference.jsx';
import { recognitionSupports } from './recognition-support.js';
import { CameraSteps } from './CameraSteps.jsx';
import { PracticeProgress } from './PracticeProgress.jsx';
import { practicePhase } from './practice-feedback.js';
import './recognition.css';
import './attempt.css';
import './practice-learning.css';

/**
 * Actividad guiada con un único coordinador de captura e inferencia real, sin escribir calificaciones.
 * @param {{letter?: string, onContinue?: Function, referenceVisible?: boolean,
 * onRevealReference?: Function, onAttempt?: Function, memory?: boolean}} props Objetivo y recorrido.
 * @returns {import('react').ReactElement} Referencia adaptable, cámara y resultado junto al intento.
 */
export function CameraExercise({
  letter,
  onContinue,
  referenceVisible = true,
  onRevealReference,
  onAttempt,
  memory = false,
}) {
  const reference = useRef(null);
  const { referenceHand, setReferenceHand } = useContext(RecognitionModelContext);
  const camera = useHandCamera(setReferenceHand);
  const capture = useSequenceCapture(camera);
  const operation = useLocalModel({ autoLoad: recognitionSupports(letter) });
  const attempt = useModelAttempt({ operation, capture, camera, target: letter, lab: false });
  const phase = practicePhase(attempt, Boolean(capture.error || operation.error));
  const reported = useRef(null);
  useEffect(() => {
    if (!attempt.shown || !operation.result || reported.current === operation.result) return;
    reported.current = operation.result;
    onAttempt?.(operation.result);
  }, [attempt.shown, onAttempt, operation.result]);
  return (
    <section
      className="camera-exercise flex w-full flex-col gap-4"
      aria-label="Práctica con cámara"
      data-phase={phase}
    >
      <header className="practice-objective">
        <p className="text-action [font:var(--type-label)]">TU TURNO</p>
        <h2>{letter ? `Practica la letra ${letter}` : 'Tu práctica con cámara'}</h2>
        <p>
          {memory
            ? 'Recuerda la configuración antes de consultar la referencia. Te acompañamos en cada intento.'
            : 'Observa la referencia y forma la seña con una mano. Te acompañamos en cada intento.'}
        </p>
      </header>
      <PracticeProgress phase={phase} />
      <div className="camera-workspace">
        <aside className="practice-reference" aria-label="Referencia e instrucciones">
          <h3 ref={reference} tabIndex={-1}>
            Así se forma {letter ? `la ${letter}` : 'la seña'}
          </h3>
          {letter && referenceVisible ? (
            <ManualReference letter={letter} hand={referenceHand} compact educational />
          ) : (
            <div className="practice-reference-hidden">
              <span aria-hidden="true">{letter}</span>
              <p>Intenta recordar la configuración antes de mirar la ficha.</p>
              <Button variant="secondary" icon={null} onClick={onRevealReference}>
                Consultar referencia
              </Button>
            </div>
          )}
          <CameraSteps letter={letter} supported={attempt.supported} />
        </aside>
        <div className="practice-live">
          <CameraView camera={camera} target={letter} controls={false} phase={phase} educational />
          <CameraControls camera={camera} compact />
          {camera.state === 'live' && <DetectionStatus camera={camera} />}
        </div>
        <div className="practice-feedback">
          <StudentAttempt
            attempt={attempt}
            operation={operation}
            capture={capture}
            target={letter}
            onContinue={onContinue}
            onReference={() => {
              onRevealReference?.();
              requestAnimationFrame(() => reference.current?.focus());
            }}
          />
        </div>
      </div>
      <details className="practice-about">
        <summary>Acerca de la guía de práctica</summary>
        <p>
          La ayuda automática puede equivocarse. Compara siempre con la referencia. El vídeo se
          procesa en tu dispositivo y no se envía al servidor.
        </p>
      </details>
    </section>
  );
}
