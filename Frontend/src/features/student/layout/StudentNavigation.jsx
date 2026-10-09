import { Link, useLocation } from 'react-router';
import { NavigationItem } from '../../../components/ui/NavigationItem.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

const entries = [
  { label: 'Mi inicio', short: 'Inicio', icon: 'home', to: '/student' },
  { label: 'Mis módulos', short: 'Módulos', icon: 'book', to: '/student/modules' },
  { label: 'Practicar', short: 'Practicar', icon: 'camera' },
  { label: 'Mi progreso', short: 'Progreso', icon: 'chart' },
  { label: 'Mi perfil', short: 'Perfil', icon: 'user' },
];

/**
 * Navegación de estudiante compartida, con destinos publicados y apartados pendientes anunciados.
 * @param {{bottom?: boolean, onUnavailable: Function}} props Composición y anuncio.
 * @returns {import('react').ReactElement} Navegación activa con etiquetas de teclado.
 */
export function StudentNavigation({ bottom = false, onUnavailable }) {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label={bottom ? 'Navegación inferior de estudiante' : 'Navegación de estudiante'}
      className={
        bottom
          ? 'student-bottom grid grid-cols-4 gap-1 border border-border bg-surface p-2'
          : 'student-navigation flex w-full flex-col gap-4'
      }
    >
      {entries
        .filter((entry) => !bottom || entry.icon !== 'chart')
        .map((entry) => {
          const active = pathname === entry.to;
          const label = bottom ? entry.short : entry.label;
          return (
            <NavigationItem
              key={entry.icon}
              as={entry.to ? Link : 'button'}
              to={entry.to}
              type={entry.to ? undefined : 'button'}
              active={active}
              aria-label={entry.to ? label : `${label}, próximamente`}
              aria-disabled={entry.to ? undefined : true}
              onClick={entry.to ? undefined : () => onUnavailable(entry.label)}
              className={bottom ? 'student-bottom-item' : 'student-nav-item'}
              icon={<Icon name={`student-nav-${entry.icon}`} size={bottom ? 22 : 20} />}
            >
              <span className={bottom ? '' : 'hidden min-[1200px]:inline'}>{label}</span>
            </NavigationItem>
          );
        })}
    </nav>
  );
}
