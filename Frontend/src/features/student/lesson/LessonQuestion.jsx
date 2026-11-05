import { useId } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Radio } from '../../../components/ui/Radio.jsx';
import { LessonMedia } from './LessonMedia.jsx';

/**
 * Presenta una pregunta de muestra; el consumidor elige la retroalimentación, sin corrección real.
 * @param {{question: object, selection: string, onSelect: Function, onCheck: Function}} props Estado visual.
 * @returns {import('react').ReactElement} Opciones nativas operables con Tab, Espacio y flechas.
 */
export function LessonQuestion({ question, selection, onSelect, onCheck }) {
  const id = useId();
  return (
    <form
      className="education-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (selection) onCheck();
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
              value={String(index)}
              checked={selection === String(index)}
              onChange={(event) => onSelect(event.target.value)}
            >
              {option}
            </Radio>
          ))}
        </fieldset>
      </div>
      <Button
        className="education-action education-action-check"
        type="submit"
        disabled={!selection}
      >
        Comprobar respuesta
      </Button>
    </form>
  );
}
