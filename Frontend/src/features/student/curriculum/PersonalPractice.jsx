import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { CameraPracticeLoader } from '../recognition/CameraPracticeLoader.jsx';

/**
 * Conserva la actividad personal y abre una cámara real únicamente cuando el alumno decide practicar.
 * @param {{step: object, onContinue?: Function}} props Texto y siguiente paso opcional.
 * @returns {import('react').ReactElement} Lectura breve o práctica local, sin evaluación académica inventada.
 */
export function PersonalPractice({ step, onContinue }) {
  const [camera, setCamera] = useState(false);
  if (camera)
    return (
      <div className="education-card flex flex-col gap-4">
        <Button variant="secondary" icon={null} onClick={() => setCamera(false)}>
          Volver a la actividad
        </Button>
        <CameraPracticeLoader onContinue={onContinue} />
      </div>
    );
  return (
    <article className="education-card journey-copy">
      <p className="journey-eyebrow text-muted">Ponlo en práctica</p>
      <h2>{step.title}</h2>
      <p className="journey-reading">{step.body}</p>
      <p className="text-muted">
        Usa la cámara para observar tu mano y practicar las vocales. Compara tu postura con la
        referencia.
      </p>
      <Button onClick={() => setCamera(true)}>Practicar con cámara</Button>
    </article>
  );
}
