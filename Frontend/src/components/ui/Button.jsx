import { Icon } from './Icon.jsx';

/**
 * Botón nativo; loading impide activaciones, anuncia la carga y reserva las dimensiones de reposo.
 * @param {object} props Atributos HTML (incluye ref), contenido y eventos.
 * @param {'primary'|'secondary'} [props.variant] Jerarquía de Figma; primary por defecto.
 * @param {'compact'|'comfortable'} [props.density] Altura 44/52 px elegida según la tarea.
 * @param {boolean} [props.loading] Deshabilita el control durante una operación.
 * @param {import('react').ReactNode} [props.loadingLabel] Texto durante carga.
 * @param {import('react').ReactNode} [props.icon] Icono final; null lo omite, undefined usa Arrow.
 * @param {import('react').ReactNode} [props.children] Etiqueta visible.
 * @param {boolean} [props.disabled] Deshabilitación funcional.
 * @param {string} [props.className] Clases del botón.
 * @param {string} [props.type] Tipo nativo; button por defecto.
 * @returns {import('react').ReactElement} Botón sin efectos de negocio.
 */
export function Button({
  children,
  variant = 'primary',
  density = 'comfortable',
  loading = false,
  loadingLabel = 'Cargando…',
  disabled = false,
  icon,
  className = '',
  type = 'button',
  ...attributes
}) {
  const trailing = icon === undefined ? <Icon name="arrow" size={20} tone={variant} /> : icon;
  return (
    <button
      {...attributes}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`vs-ui vs-button inline-block max-w-full appearance-none align-middle ${className}`}
      data-variant={variant}
      data-density={density}
      data-loading={loading || undefined}
    >
      <span className="vs-button-surface relative isolate flex items-center justify-center gap-2">
        <span className="vs-button-rest" aria-hidden={loading || undefined}>
          <span>{children}</span>
          {trailing}
        </span>
        {loading && (
          <span className="vs-button-loading">
            <span>{loadingLabel}</span>
          </span>
        )}
      </span>
    </button>
  );
}
