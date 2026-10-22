import { Brand } from '../../../components/ui/Brand.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { NavigationItem } from '../../../components/ui/NavigationItem.jsx';
import { StudentNavigation } from './StudentNavigation.jsx';
import { useLocation } from 'react-router';

/**
 * Barra alineada con Admin: navegación arriba y ayuda/cuenta al pie, con iconos en tablet.
 * @param {{onUnavailable: Function, onLogout: Function, pending: boolean}} props Acciones del layout.
 * @returns {import('react').ReactElement} Barra lateral con acciones existentes y nombres accesibles.
 */
export function StudentSidebar({ onUnavailable, onLogout, pending }) {
  const report = useLocation().pathname.startsWith('/student/reports');
  return (
    <aside className="student-sidebar" aria-label="Área de estudiante">
      <div className="min-[1200px]:hidden">
        <Brand compact />
      </div>
      <div className="hidden min-[1200px]:block">
        <Brand />
      </div>
      <p className="student-sidebar-label">MI APRENDIZAJE</p>
      <StudentNavigation />
      <div className="student-sidebar-account">
        <p className="student-sidebar-label">AYUDA Y CUENTA</p>
        <NavigationItem
          as="button"
          type="button"
          className="student-nav-item"
          active={report}
          icon={<Icon name="student-nav-flag" size={20} />}
          aria-label="Reportar un error"
          title="Reportar un error"
          onClick={() => onUnavailable('Reportar un error')}
        >
          Reportar un error
        </NavigationItem>
        <NavigationItem
          as="button"
          type="button"
          className="student-nav-item"
          disabled={pending}
          icon={<Icon name="student-nav-logout" size={20} />}
          onClick={onLogout}
          title="Cerrar sesión"
          aria-label={pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
        >
          {pending ? 'Cerrando…' : 'Cerrar sesión'}
        </NavigationItem>
      </div>
    </aside>
  );
}
