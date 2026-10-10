import { Link, useLocation } from 'react-router';
import { NavigationItem } from '../../../components/ui/NavigationItem.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

const entries = [
  { label: 'Mi inicio', short: 'Inicio', icon: 'home', to: '/student' },
  { label: 'Mis módulos', short: 'Módulos', icon: 'book', to: '/student/modules' },
  { label: 'Practicar', short: 'Practicar', icon: 'camera', to: '/student/practice' },
  { label: 'Mi progreso', short: 'Progreso', icon: 'chart', to: '/student/progress' },
  { label: 'Mi perfil', short: 'Perfil', icon: 'user', to: '/student/profile' },
];

/**
 * Navegación de las cinco vistas publicadas, compartida por sidebar y barra móvil.
 * @param {{bottom?: boolean}} props Composición del navegador.
 * @returns {import('react').ReactElement} Navegación activa con etiquetas de teclado.
 */
export function StudentNavigation({ bottom = false }) {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label={bottom ? 'Navegación inferior de estudiante' : 'Navegación de estudiante'}
      className={
        bottom
          ? 'student-bottom grid grid-cols-5 gap-1 border border-border bg-surface p-2'
          : 'student-navigation flex w-full flex-col gap-4'
      }
    >
      {entries.map((entry) => {
        const active = pathname === entry.to;
        const label = bottom ? entry.short : entry.label;
        return (
          <NavigationItem
            key={entry.icon}
            as={Link}
            to={entry.to}
            active={active}
            aria-label={label}
            className={bottom ? 'student-bottom-item' : 'student-nav-item'}
            icon={
              <Icon
                name={`student-nav-${entry.icon}`}
                size={bottom && entry.icon !== 'chart' ? 22 : 20}
              />
            }
          >
            <span className={bottom ? '' : 'hidden min-[1200px]:inline'}>{label}</span>
          </NavigationItem>
        );
      })}
    </nav>
  );
}
