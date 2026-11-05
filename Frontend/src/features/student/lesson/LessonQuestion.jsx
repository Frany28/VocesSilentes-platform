import { useId } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Radio } from '../../../components/ui/Radio.jsx';
import { LessonMedia } from './LessonMedia.jsx';

/**
 * Presenta opciones sin conocer la clave; el consumidor realiza la comprobación o la demo explícita.
 * @param {{question: object, selection: string, onSelect: Function, onCheck: Function,
 * busy?: boolean, formId?: string, showAction?: boolean}} props Estado visual y acción interna o del pie.
 * @returns {import('react').ReactElement} Opciones nativas operables con Tab, Espacio y flechas.
 */
export function LessonQuestion({
  question,
  selection,
  onSelect,
  onCheck,
  busy = false,
  formId,
  showAction = true,
}) {
  const id = useId();
  return (
    <form
      id={formId}
      className="education-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (selection && !busy) onCheck();
      }}
    >
      <h2 id={`${id}-question`} className="education-question-title">
        {question.prompt}
      </h2>
      <p id={`${id}-help`} className="text-muted">
        Selecciona una opción y comprueba tu respuesta.
      </p>
      <div className={question.visual ? 'education-columns' : 'w-full'}>
        {question.visual && <LessonMedia visual />}
        <fieldset
          disabled={busy}
          className="education-options"
          aria-labelledby={`${id}-question`}
          aria-describedby={`${id}-help`}
        >
          <legend className="sr-only">Opciones de respuesta</legend>
          {question.options.map((option, index) => (
            <Radio
              key={index}
              className="education-option"
              name={`${id}-answer`}
              value={typeof option === 'string' ? String(index) : option.id}
              checked={selection === (typeof option === 'string' ? String(index) : option.id)}
              onChange={(event) => onSelect(event.target.value)}
            >
              {typeof option === 'string' ? option : option.text}
            </Radio>
          ))}
        </fieldset>
      </div>
      {showAction && (
        <Button
          className="education-action education-action-check"
          type="submit"
          disabled={!selection}
          loading={busy}
          loadingLabel="Comprobando…"
        >
          Comprobar respuesta
        </Button>
      )}
    </form>
  );
}
