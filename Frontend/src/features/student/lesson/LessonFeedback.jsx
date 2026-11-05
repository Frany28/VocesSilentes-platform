import { Button } from '../../../components/ui/Button.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Muestra una retroalimentación de ejemplo con icono, texto y acción; no determina aciertos.
 * @param {{feedback: object, onContinue: Function, continueLabel?: string}} props Ejemplo y acción de la demo.
 * @returns {import('react').ReactElement} Mensaje accesible de acierto o error.
 */
export function LessonFeedback({ feedback, onContinue, continueLabel }) {
  const success = feedback.tone === 'success';
  return (
    <section className="education-card" aria-label="Retroalimentación de ejemplo">
      <div
        className="education-feedback"
        data-tone={feedback.tone}
        role={success ? 'status' : 'alert'}
      >
        <p className="flex items-center gap-2.5 [font:var(--type-button)]">
          <Icon name={success ? 'education-check' : 'education-retry'} />
          {success ? 'Respuesta correcta' : 'Respuesta incorrecta'}
        </p>
        <h2 className="[font:var(--type-h3)]">{feedback.title}</h2>
        <p className="education-paragraph">{feedback.explanation}</p>
      </div>
      <Button
        className={`education-action ${success ? 'education-action-continue' : 'education-action-retry'}`}
        onClick={onContinue}
      >
        {continueLabel || (success ? 'Continuar al resultado' : 'Reintentar ejercicio')}
      </Button>
    </section>
  );
}
