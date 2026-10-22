import { useId } from 'react';
import { Icon } from './Icon.jsx';

/**
 * Selección nativa de Figma con label, ayuda, error y teclado, sin peticiones.
 * @param {object} props Atributos del select y label/help/error/children.
 * @param {string} props.label Nombre accesible del campo.
 * @param {string} [props.help] Ayuda opcional.
 * @param {string} [props.error] Error de validación.
 * @param {import('react').ReactNode} props.children Opciones nativas.
 * @returns {import('react').ReactElement} Campo accesible que comparte tokens con Input.
 */
export function Select({ label, help, error, children, ...props }) {
  const id = useId();
  return (
    <div className="vs-select">
      <label htmlFor={id}>{label}</label>
      <div className="vs-select-shell">
        <select
          {...props}
          id={id}
          aria-invalid={!!error}
          aria-describedby={help || error ? `${id}-help` : undefined}
        >
          {children}
        </select>
        <span className="vs-select-chevron">
          <Icon name="field-chevron" size={16} />
        </span>
      </div>
      {(help || error) && (
        <p id={`${id}-help`} data-error={!!error}>
          {error || help}
        </p>
      )}
    </div>
  );
}
