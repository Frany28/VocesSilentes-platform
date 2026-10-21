import { Link } from 'react-router';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Acción de 44 px con SVG original y nombre accesible; enlace para navegación, botón para acciones.
 * @param {{icon: string, label: string, to?: string, className?: string}} props Icono y atributos HTML adicionales.
 * @returns {import('react').ReactElement} Control de icono con hover y foco visibles.
 */
export function AdminIconButton({ icon, label, to, className = '', ...attributes }) {
  const Component = to ? Link : 'button';
  return (
    <Component
      {...attributes}
      {...(to ? { to } : { type: 'button' })}
      className={`admin-icon-button ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon name={`modern-${icon}`} size={20} />
    </Component>
  );
}
