import { Brand } from '../../../components/ui/Brand.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { NavigationItem } from '../../../components/ui/NavigationItem.jsx';
import { StudentNavigation } from './StudentNavigation.jsx';

/**
 * Barra lateral completa en escritorio y de iconos en tablet, sin rutas pendientes falsas.
 * @param {{onUnavailable: Function, onLogout: Function, pending: boolean}} props Acciones del layout.
 * @returns {import('react').ReactElement} Barra lateral original adaptada.
 */
export function StudentSidebar({ onUnavailable, onLogout, pending }) {
  return (
    <aside
      className="student-sidebar hidden w-20 flex-none flex-col gap-4 self-stretch rounded-3xl
      border border-border bg-surface p-4 min-[600px]:flex min-[1200px]:w-60 min-[1200px]:p-6"
      aria-label="Área de estudiante"
    >
      <div className="min-[1200px]:hidden">
        <Brand compact />
      </div>
      <div className="hidden min-[1200px]:block">
        <Brand />
      </div>
      <p className="hidden text-muted [font:var(--type-label)] min-[1200px]:block">
        MI APRENDIZAJE
      </p>
      <StudentNavigation />
      <p className="hidden text-muted [font:var(--type-label)] min-[1200px]:block">
        AYUDA Y CUENTA
      </p>
      <NavigationItem
        as="button"
        type="button"
        className="student-nav-item hidden! min-[1200px]:inline-flex!"
        icon={<Icon name="student-nav-flag" size={20} />}
        aria-disabled="true"
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
        aria-label={pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
      >
        <span className="hidden min-[1200px]:inline">
          {pending ? 'Cerrando…' : 'Cerrar sesión'}
        </span>
      </NavigationItem>
    </aside>
  );
}
