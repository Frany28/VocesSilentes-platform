import { NavLink } from 'react-router';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Cuatro destinos de Admin; móvil compacto conserva los tres principales y perfil en la barra.
 * @param {{compact?: boolean}} props Navegación horizontal móvil.
 * @returns {import('react').ReactElement} Enlaces con selección, nombre accesible y SVG por tema.
 */
export function AdminNavigation({ compact = false }) {
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
        <NavLink
          key={to}
          to={to}
          end={to === '/admin'}
          title={label}
          className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
        >
          <Icon name={`modern-${icon}`} size={20} />
          <span className="admin-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
