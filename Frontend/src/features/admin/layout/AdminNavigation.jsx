import { Link, useLocation } from 'react-router';
import { Icon } from '../../../components/ui/Icon.jsx';
import { NavigationItem } from '../../../components/ui/NavigationItem.jsx';

/**
 * Cuatro destinos de Admin; móvil compacto conserva los tres principales y perfil en la barra.
 * @param {{compact?: boolean}} props Navegación horizontal móvil.
 * @returns {import('react').ReactElement} Enlaces con selección, nombre accesible y SVG por tema.
 */
export function AdminNavigation({ compact = false }) {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label={compact ? 'Secciones de administración' : 'Administración'}
      className="admin-nav"
    >
      {[
        ['/admin', 'Resumen', 'grid'],
        ['/admin/users', 'Usuarios', 'users'],
        ['/admin/reports', 'Reportes', 'flag'],
        ...(!compact ? [['/admin/profile', 'Mi perfil', 'profile']] : []),
      ].map(([to, label, icon]) => (
        <NavigationItem
          as={Link}
          key={to}
          to={to}
          title={label}
          active={pathname === to || (to !== '/admin' && pathname.startsWith(`${to}/`))}
          className="admin-nav-item"
          icon={<Icon name={`modern-${icon}`} size={20} />}
        >
          <span className="admin-nav-label">{label}</span>
        </NavigationItem>
      ))}
    </nav>
  );
}
