import { Button } from '../../../components/ui/Button.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Presenta retroalimentación recibida del consumidor, sin calcular aciertos en la presentación.
 * @param {{feedback: object, onContinue?: Function, continueLabel?: string,
 * label?: string, showAction?: boolean}} props Mensaje y acción interna opcional.
 * @returns {import('react').ReactElement} Mensaje accesible de acierto o error.
 */
export function LessonFeedback({
  feedback,
  onContinue,
  continueLabel,
  label = 'Retroalimentación de ejemplo',
  showAction = true,
}) {
  const success = feedback.tone === 'success';
  return (
    <section className="education-card" aria-label={label}>
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
      {showAction && (
        <Button
          className={`education-action ${success ? 'education-action-continue' : 'education-action-retry'}`}
          onClick={onContinue}
        >
          {continueLabel || (success ? 'Continuar al resultado' : 'Reintentar ejercicio')}
        </Button>
      )}
    </section>
  );
}
