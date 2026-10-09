import { useId } from 'react';

/**
 * Comparte la presentación nativa conservando teclado y agrupación por name.
 * @param {object} props Atributos HTML del input, ref y contenido del label.
 * @param {'checkbox'|'radio'} props.type Tipo nativo utilizado por Checkbox y Radio.
 * @param {import('react').ReactNode} [props.children] Etiqueta visible.
 * @param {string} [props.id] Identificador; se genera si se omite.
 * @param {string} [props.className] Clases del label.
 * @returns {import('react').ReactElement} Selección sin simular estados funcionales.
 */
export function SelectionControl({ type, children, id, className = '', ...attributes }) {
  const generatedId = useId();
  return (
    <label className={`vs-ui vs-selection ${className}`} htmlFor={id || generatedId}>
      <input {...attributes} id={id || generatedId} type={type} />
      <span className="vs-selection-mark" aria-hidden="true">
        {type === 'checkbox' && <span className="vs-checkmark">✓</span>}
        {type === 'radio' && <span className="vs-radio-dot" />}
      </span>
      <span>{children}</span>
    </label>
  );
}
