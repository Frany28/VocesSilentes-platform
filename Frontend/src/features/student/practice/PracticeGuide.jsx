import { useNavigate } from 'react-router';
import { Button } from '../../../components/ui/Button.jsx';
import { practiceSteps } from './practice-demo.js';

/**
 * Guía original de Figma reutilizada en el lateral y el diálogo de instrucciones.
 * @returns {import('react').ReactElement} Pasos de preparación sin prometer reconocimiento real.
 */
export function PracticeGuide() {
  const navigate = useNavigate();
  return (
    <section className="practice-guide flex min-w-0 flex-col gap-4 rounded-3xl bg-surface p-6">
      <p className="text-action [font:var(--type-label)]">PASO A PASO</p>
      <h2 className="[font:var(--type-h3)]">Prepara tu próximo intento</h2>
      {practiceSteps.map((step, index) => (
        <div
          key={step.title}
          className={`flex flex-col gap-2 rounded-3xl p-4 ${index === 1 ? 'bg-secondary' : 'bg-neutral'}`}
        >
          <h3 className="[font:var(--type-subtitle)]">{step.title}</h3>
          <p className="text-muted">{step.description}</p>
        </div>
      ))}
      <Button
        onClick={() => navigate('/student/modules')}
        variant="secondary"
        icon={null}
        className="w-full"
      >
        Volver a mis módulos
      </Button>
      <p className="text-muted">
        Demostración visual: este prototipo no reconoce ni evalúa señas LSV.
      </p>
    </section>
  );
}
