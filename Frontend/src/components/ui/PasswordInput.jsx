import { useId, useState } from 'react';
import { Input } from './Input.jsx';
import { Icon } from './Icon.jsx';

/**
 * Extiende Input con visibilidad local sin copiar ni almacenar la contraseña.
 * @param {object} props Props de Input y atributos HTML; conserva autoComplete y ref.
 * @param {string} [props.id] Identificador de campo y control.
 * @param {boolean} [props.disabled] Deshabilita campo y visibilidad.
 * @param {'default'|'plain'} [props.appearance] plain usa los recursos Eye/EyeOff originales de Figma.
 * @param {string} [props.className] Clases del contenedor.
 * @returns {import('react').ReactElement} Campo y botón accesible con visibilidad local.
 */
export function PasswordInput({
  id,
  disabled = false,
  appearance = 'default',
  className = '',
  ...attributes
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...attributes}
      appearance={appearance}
      className={`vs-password-field ${className}`}
      id={inputId}
      disabled={disabled}
      type={visible ? 'text' : 'password'}
      endControl={
        <button
          type="button"
          className="vs-password-toggle"
          disabled={disabled}
          aria-controls={inputId}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {appearance === 'plain' ? (
            <Icon name={visible ? 'eye-off' : 'eye'} size={20} />
          ) : visible ? (
            'Ocultar'
          ) : (
            'Mostrar'
          )}
        </button>
      }
    />
  );
}
