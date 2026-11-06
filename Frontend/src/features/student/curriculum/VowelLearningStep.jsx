import { ManualReference } from '../recognition/ManualReference.jsx';
import { CameraPracticeLoader } from '../recognition/CameraPracticeLoader.jsx';
import { CurriculumTheory } from './CurriculumTheory.jsx';

/**
 * Explica la ilustración de cada vocal antes de abrir su práctica real por acción del alumno.
 * @param {{step: object}} props Paso público de introducción, explicación o cámara.
 * @returns {import('react').ReactElement} Una actividad educativa; abrirla no solicita cámara.
 */
export function VowelLearningStep({ step }) {
  if (step.type === 'camera')
    return (
      <div className="education-card flex min-w-0 flex-col gap-4">
        <p className="text-muted">
          Pon en práctica la vocal {step.letter}. Espera a que se detecte una mano, captura tres
          segundos y analiza el intento. Puedes repetir o continuar sin usar cámara.
        </p>
        <CameraPracticeLoader letter={step.letter} />
      </div>
    );
  if (step.type === 'intro')
    return (
      <div className="flex min-w-0 flex-col gap-4">
        <CurriculumTheory step={step} pending={0} />
        <p className="text-muted">
          Primero leerás una explicación y observarás la ilustración de cada vocal. Después podrás
          practicarla. Las referencias y el modelo siguen pendientes de revisión experta LSV.
        </p>
      </div>
    );
  return (
    <article
      className="journey-copy education-card flex min-w-0 flex-col gap-4"
      aria-labelledby="vowel-title"
    >
      <p className="journey-eyebrow text-muted">Observa antes de practicar</p>
      <h2 id="vowel-title">{step.title}</h2>
      <div className="camera-reference-grid">
        <ManualReference letter={step.letter} />
        <div className="flex min-w-0 flex-col gap-4">
          <p className="journey-reading">{step.description}</p>
          <h3 className="[font:var(--type-subtitle)]">En qué fijarte</h3>
          <p>{step.focus}</p>
          <p className="text-muted">
            Compara tu mano con la referencia sin forzar los dedos. La imagen por sí sola no explica
            movimientos ni sustituye una demostración revisada por una persona competente en LSV.
          </p>
        </div>
      </div>
    </article>
  );
}
