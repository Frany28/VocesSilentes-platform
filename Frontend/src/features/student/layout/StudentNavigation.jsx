import { Link, useLocation } from 'react-router';
import { NavigationItem } from '../../../components/ui/NavigationItem.jsx';
import { BottomNavigation } from '../../../components/ui/BottomNavigation.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

const entries = [
  { label: 'Mi inicio', short: 'Inicio', icon: 'home', to: '/student' },
  { label: 'Mis módulos', short: 'Módulos', icon: 'book', to: '/student/modules' },
  { label: 'Practicar', short: 'Practicar', icon: 'camera', to: '/student/practice' },
  { label: 'Mi progreso', short: 'Progreso', icon: 'chart', to: '/student/progress' },
  { label: 'Mi perfil', short: 'Perfil', icon: 'user', to: '/student/profile' },
];

/**
 * Navegación de las cinco vistas publicadas, compartida por sidebar y barra inferior móvil.
 * @param {{bottom?: boolean}} props bottom usa BottomNavigation con etiquetas cortas.
 * @returns {import('react').ReactElement} Navegación activa con etiquetas de teclado.
 */
export function StudentNavigation({ bottom = false }) {
  const { pathname } = useLocation();
  const isActive = (to) => pathname === to || (to !== '/student' && pathname.startsWith(`${to}/`));
  if (bottom)
    return (
      <BottomNavigation
        label="Navegación inferior de estudiante"
        items={entries.map((entry) => ({
          to: entry.to,
          label: entry.short,
          title: entry.label,
          active: isActive(entry.to),
          icon: <Icon name={`student-nav-${entry.icon}`} size={entry.icon === 'chart' ? 20 : 22} />,
        }))}
      />
    );
  return (
    <nav aria-label="Navegación de estudiante" className="student-navigation">
      {entries.map((entry) => (
        <NavigationItem
          key={entry.icon}
          as={Link}
          to={entry.to}
          active={isActive(entry.to)}
          aria-label={entry.label}
          title={entry.label}
          className="student-nav-item"
          icon={<Icon name={`student-nav-${entry.icon}`} size={20} />}
        >
          <span className="hidden min-[1200px]:inline">{entry.label}</span>
        </NavigationItem>
      ))}
    </nav>
  );
}
