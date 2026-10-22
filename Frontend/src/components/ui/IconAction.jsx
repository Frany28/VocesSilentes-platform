import { Link } from 'react-router';
import { Icon } from './Icon.jsx';

/**
 * Acción compartida de navegación, regreso y apariencia de 44 × 44 px.
 * @param {{icon: string, label: string, to?: string, className?: string}} props Icono y atributos nativos.
 * @returns {import('react').ReactElement} Enlace o botón con nombre accesible y foco visible.
 */
export function IconAction({ icon, label, to, className = '', ...attributes }) {
  const Component = to ? Link : 'button';
  return (
    <Component
      {...attributes}
      {...(to ? { to } : { type: 'button' })}
      className={`vs-icon-action ${className}`}
      aria-label={label}
      title={label}
    >
      <Icon name={`modern-${icon}`} size={20} />
    </Component>
  );
}
