import { Link, useLocation } from 'react-router';
import { Icon } from '../../../components/ui/Icon.jsx';
import { NavigationItem } from '../../../components/ui/NavigationItem.jsx';
import { BottomNavigation } from '../../../components/ui/BottomNavigation.jsx';

const entries = [
  ['/admin', 'Resumen', 'grid'],
  ['/admin/users', 'Usuarios', 'users'],
  ['/admin/reports', 'Reportes', 'flag'],
  ['/admin/audit', 'Bitácora', 'grid'],
  ['/admin/profile', 'Mi perfil', 'profile'],
];
// La barra móvil conserva los tres destinos principales; perfil está en la barra superior.
const bottomEntries = entries.slice(0, 3);

/**
 * Destinos de Admin para sidebar/menú o para la barra inferior móvil compartida.
 * @param {{bottom?: boolean}} props bottom usa BottomNavigation con los tres destinos principales.
 * @returns {import('react').ReactElement} Enlaces con selección, nombre accesible y SVG por tema.
 */
export function AdminNavigation({ bottom = false }) {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || (to !== '/admin' && pathname.startsWith(`${to}/`));
  const icon = (name) => <Icon name={`modern-${name}`} size={20} />;
  if (bottom)
    return (
      <BottomNavigation
        label="Secciones de administración"
        items={bottomEntries.map(([to, label, name]) => ({
          to,
          label,
          icon: icon(name),
          active: isActive(to),
        }))}
      />
    );
  return (
    <nav aria-label="Administración" className="admin-nav">
      {entries.map(([to, label, name]) => (
        <NavigationItem
          as={Link}
          key={to}
          to={to}
          title={label}
          active={isActive(to)}
          className="admin-nav-item"
          icon={icon(name)}
        >
          <span className="admin-nav-label">{label}</span>
        </NavigationItem>
      ))}
    </nav>
  );
}
