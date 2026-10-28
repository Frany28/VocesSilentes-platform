import { useId } from 'react';
import { Icon } from './Icon.jsx';

/**
 * Selección nativa de Figma con label, ayuda, error y teclado, sin peticiones.
 * @param {object} props Atributos del select y label/help/error/children.
 * @param {string} props.label Nombre accesible del campo.
 * @param {string} [props.help] Ayuda opcional.
 * @param {string} [props.error] Error de validación.
 * @param {string} [props.id] Identificador explícito; se genera uno si falta.
 * @param {string} [props.'aria-describedby'] Descripciones externas que se conservan junto a ayuda/error.
 * @param {import('react').ReactNode} props.children Opciones nativas.
 * @returns {import('react').ReactElement} Campo accesible que comparte tokens con Input.
 */
export function Select({
  label,
  help,
  error,
  children,
  id,
  'aria-describedby': describedBy,
  ...props
}) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const messageId = help || error ? `${selectId}-help` : undefined;
  const description = [describedBy, messageId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="vs-select">
      <label htmlFor={selectId}>{label}</label>
      <div className="vs-select-shell">
        <select
          {...props}
          id={selectId}
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={description}
        >
          {children}
        </select>
        <span className="vs-select-chevron">
          <Icon name="field-chevron" size={16} />
        </span>
      </div>
      {(help || error) && (
        <p id={messageId} data-error={!!error}>
          {error || help}
        </p>
      )}
    </div>
  );
}
