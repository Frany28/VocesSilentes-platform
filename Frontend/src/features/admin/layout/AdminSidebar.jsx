import { Icon } from '../../../components/ui/Icon.jsx';
import { Brand } from '../../../components/ui/Brand.jsx';
import { AdminNavigation } from './AdminNavigation.jsx';
import { NavigationItem } from '../../../components/ui/NavigationItem.jsx';

/**
 * Sidebar con navegación compartida; ayuda/cuenta y logout permanecen al final.
 * @param {{onLogout: Function}} props Abre la confirmación de cierre de sesión.
 * @returns {import('react').ReactElement} Navegación de escritorio/tablet sin reporte de errores.
 */
export function AdminSidebar({ onLogout }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand-full">
        <Brand />
      </div>
      <div className="admin-brand-compact">
        <Brand compact />
      </div>
      <p className="admin-sidebar-label">ADMINISTRACIÓN</p>
      <AdminNavigation />
      <div className="admin-identity-message">
        <h2>
          Más señas.
          <br />
          Menos barreras.
        </h2>
        <p>
          Un espacio para cuidar
          <br />y acompañar a la comunidad.
        </p>
      </div>
      <div className="admin-sidebar-account">
        <p className="admin-sidebar-label">AYUDA Y CUENTA</p>
        <NavigationItem
          as="button"
          type="button"
          className="admin-logout"
          title="Cerrar sesión"
          onClick={onLogout}
          icon={<Icon name="modern-logout" size={20} />}
        >
          <span>Cerrar sesión</span>
        </NavigationItem>
      </div>
    </aside>
  );
}
