import { NavLink } from 'react-router';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Navegación desktop/tablet/móvil con enlaces y selección del router, sin peticiones.
 * @param {{compact?: boolean}} props Ubicación de los tres enlaces.
 * @returns {import('react').ReactElement} Navegación accesible con SVG originales por tema.
 */
export function AdminNavigation({ compact = false }) {
  return (
    <nav
      aria-label={compact ? 'Secciones de administración' : 'Administración'}
      className="admin-nav"
    >
      {[
        ['/admin', 'Resumen', 'chart'],
        ['/admin/users', 'Usuarios', 'user'],
        ['/admin/reports', 'Reportes', 'flag'],
      ].map(([to, label, icon]) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/admin'}
          title={label}
          className={({ isActive }) => `admin-nav-item ${isActive ? 'is-active' : ''}`}
        >
          <span className="admin-nav-icon">
            <Icon name={`admin-${icon}`} size={20} />
          </span>
          <span className="admin-nav-tablet">
            <Icon name={`admin-${icon}`} tone="tablet" size={20} />
          </span>
          <span className="admin-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
