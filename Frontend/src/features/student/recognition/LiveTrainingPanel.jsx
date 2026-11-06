import { useState } from 'react';
import { CameraView } from './CameraView.jsx';
import { ManualReference } from './ManualReference.jsx';
import { TrainingCapture } from './TrainingCapture.jsx';

/**
 * Conserva la captura de cámara existente junto a la nueva importación, compartiendo el mismo lote.
 * @param {{camera: object, capture: object, collection: object}} props Estado separado de presentación.
 * @returns {import('react').ReactElement} Referencia y captura consentida original.
 */
export function LiveTrainingPanel({ camera, capture, collection }) {
  const [letter, setLetter] = useState('A');
  return (
    <div className="education-card camera-reference-grid">
      <div className="flex min-w-0 flex-col gap-4">
        <ManualReference letter={letter} compact />
        <CameraView camera={camera} />
      </div>
      <TrainingCapture
        camera={camera}
        capture={capture}
        collection={collection}
        letter={letter}
        onLetter={setLetter}
      />
    </div>
  );
}
