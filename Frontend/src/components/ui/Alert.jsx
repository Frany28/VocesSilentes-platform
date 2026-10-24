import { Icon } from './Icon.jsx';

/**
 * Mensaje semántico sin acciones de negocio ni cierre no especificado.
 * @param {object} props Atributos HTML y ref; role puede ajustarse para mensajes estáticos.
 * @param {'info'|'success'|'warning'|'error'} [props.tone] Variante del diseño.
 * @param {'compact'|'comfortable'} [props.density] Resumen interno compacto o aviso del UI Kit.
 * @param {import('react').ReactNode} props.title Título breve.
 * @param {import('react').ReactNode} [props.children] Mensaje visible.
 * @param {string} [props.className] Clases del contenedor.
 * @param {import('react').ReactNode} [props.icon] Icono original específico; predeterminado según tono.
 * @returns {import('react').ReactElement} Error urgente o estado informativo accesible.
 */
export function Alert({
  tone = 'info',
  density = 'comfortable',
  title,
  children,
  className = '',
  icon,
  ...attributes
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      {...attributes}
      className={`vs-ui vs-alert flex max-w-full flex-col ${className}`}
      data-tone={tone}
      data-density={density}
    >
      <div className="vs-alert-heading flex items-center gap-3">
        <span className="vs-alert-icon">
          {icon || <Icon name={tone === 'success' ? 'check' : 'info'} size={20} tone={tone} />}
        </span>
        <span>{title}</span>
      </div>
      <p>{children}</p>
    </div>
  );
}
