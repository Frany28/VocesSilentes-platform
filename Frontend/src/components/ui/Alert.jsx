import { Icon } from './Icon.jsx';

/**
 * Mensaje semántico sin acciones de negocio ni cierre no especificado.
 * @param {object} props Atributos HTML y ref; role puede ajustarse para mensajes estáticos.
 * @param {'info'|'success'|'warning'|'error'} [props.tone] Variante del diseño.
 * @param {import('react').ReactNode} props.title Título breve.
 * @param {import('react').ReactNode} [props.children] Mensaje visible.
 * @param {string} [props.className] Clases del contenedor.
 * @returns {import('react').ReactElement} Error urgente o estado informativo accesible.
 */
export function Alert({ tone = 'info', title, children, className = '', ...attributes }) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      {...attributes}
      className={`vs-ui vs-alert ${className}`}
      data-tone={tone}
    >
      <div className="vs-alert-heading">
        <span className="vs-alert-icon">
          <Icon name={tone === 'success' ? 'check' : 'info'} size={20} tone={tone} />
        </span>
        <span>{title}</span>
      </div>
      <p>{children}</p>
    </div>
  );
}
