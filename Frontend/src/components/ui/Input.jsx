import { useId } from 'react';

/**
 * Campo nativo con label, ayuda y error asociados; admite ref y atributos HTML del input.
 * @param {object} props Contrato del campo, sin peticiones ni validación de negocio.
 * @param {import('react').ReactNode} props.label Etiqueta visible obligatoria.
 * @param {import('react').ReactNode} [props.help] Ayuda persistente.
 * @param {import('react').ReactNode} [props.error] Error; sustituye la ayuda y marca aria-invalid.
 * @param {import('react').ReactNode} [props.icon] Recurso inicial opcional.
 * @param {import('react').ReactNode} [props.endControl] Control final, utilizado por PasswordInput.
 * @param {string} [props.id] Identificador; se genera uno si se omite.
 * @param {string} [props.className] Clases del contenedor.
 * @param {'default'|'plain'} [props.appearance] Campo del UI Kit o campo sin superficie exterior de Auth.
 * @param {'compact'|'comfortable'} [props.density] Control de 44 px/Inter 14 o cómodo/Inter 16.
 * @param {string} [props.'aria-describedby'] Identificadores de descripciones externas.
 * @returns {import('react').ReactElement} Campo adaptable con identificadores únicos.
 */
export function Input({
  label,
  help,
  error,
  icon,
  endControl,
  id,
  className = '',
  appearance = 'default',
  density = 'comfortable',
  'aria-describedby': describedBy,
  ...attributes
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const message = error || help;
  const messageId = message ? `${inputId}-message` : undefined;
  const description = [describedBy, messageId].filter(Boolean).join(' ') || undefined;
  return (
    <div
      className={`vs-ui vs-field ${className}`}
      data-appearance={appearance}
      data-density={density}
      data-error={!!error || undefined}
    >
      <label htmlFor={inputId}>{label}</label>
      <div className="vs-input-shell flex items-center">
        {icon}
        <input
          {...attributes}
          id={inputId}
          className="vs-input"
          aria-invalid={error ? true : attributes['aria-invalid']}
          aria-describedby={description}
        />
        {endControl}
      </div>
      {message && (
        <p className="vs-field-message" id={messageId}>
          {message}
        </p>
      )}
    </div>
  );
}
