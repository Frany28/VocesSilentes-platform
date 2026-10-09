import { Icon } from './Icon.jsx';

/**
 * Enlace de navegación; el consumidor controla destino y página actual, sin permisos.
 * @param {object} props Atributos de enlace, ref y contenido.
 * @param {boolean} [props.active] Anuncia la página actual mediante aria-current.
 * @param {import('react').ElementType} [props.as] Elemento a, button o Link del router.
 * @param {import('react').ReactNode} [props.icon] Icono inicial; por defecto Book.
 * @param {import('react').ReactNode} [props.children] Etiqueta del destino.
 * @param {string} [props.className] Clases del enlace.
 * @returns {import('react').ReactElement} Enlace accesible con indicador activo.
 */
export function NavigationItem({
  as: Element = 'a',
  active = false,
  icon,
  children,
  className = '',
  ...attributes
}) {
  return (
    <Element
      {...attributes}
      className={`vs-ui vs-navigation ${className}`}
      aria-current={active ? 'page' : undefined}
    >
      <span className="vs-navigation-marker" aria-hidden="true" />
      {icon === undefined ? (
        <Icon name="book" size={20} tone={active ? 'active' : 'default'} />
      ) : (
        icon
      )}
      <span>{children}</span>
    </Element>
  );
}
