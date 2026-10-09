import { Icon } from './Icon.jsx';

/**
 * Control visual independiente de persistencia y contexto de la app.
 * @param {object} props Atributos de button, ref y onClick.
 * @param {boolean} props.dark Preferencia seleccionada, independiente del tema del contenedor.
 * @param {string} [props.className] Clases del botón.
 * @returns {import('react').ReactElement} Botón con estado anunciado y recursos originales.
 */
export function ThemeSwitch({ dark, className = '', ...attributes }) {
  return (
    <button
      {...attributes}
      type="button"
      className={`vs-ui vs-theme-switch ${className}`}
      aria-label="Tema oscuro"
      aria-pressed={dark}
    >
      <Icon name={dark ? 'moon' : 'sun'} size={20} />
      <span className="vs-theme-label">{dark ? 'Modo oscuro' : 'Modo claro'}</span>
      <span className="vs-theme-track" aria-hidden="true">
        <span />
      </span>
    </button>
  );
}
