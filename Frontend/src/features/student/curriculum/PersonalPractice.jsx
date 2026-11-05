import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { CameraPracticeLoader } from '../recognition/CameraPracticeLoader.jsx';

/**
 * Conserva la actividad personal y abre una cámara real únicamente cuando el alumno decide practicar.
 * @param {{step: object}} props Texto de la actividad original.
 * @returns {import('react').ReactElement} Lectura breve o práctica local, sin evaluación académica inventada.
 */
export function PersonalPractice({ step }) {
  const [camera, setCamera] = useState(false);
  if (camera)
    return (
      <div className="education-card flex flex-col gap-4">
        <Button variant="secondary" icon={null} onClick={() => setCamera(false)}>
          Volver a la actividad
        </Button>
        <CameraPracticeLoader />
      </div>
    );
  return (
    <article className="education-card journey-copy">
      <p className="journey-eyebrow text-muted">Ponlo en práctica</p>
      <h2>{step.title}</h2>
      <p className="journey-reading">{step.body}</p>
      <p className="text-muted">
        La cámara detecta manos. La evaluación de letras necesita nuestro modelo entrenado y
        validado.
      </p>
      <Button onClick={() => setCamera(true)}>Practicar con cámara</Button>
    </article>
  );
}
