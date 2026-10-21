import { Icon } from '../../../components/ui/Icon.jsx';
import { AdminBrand } from './AdminBrand.jsx';
import { AdminNavigation } from './AdminNavigation.jsx';

/**
 * Sidebar con navegación compartida; ayuda/cuenta y logout permanecen al final.
 * @param {{onLogout: Function}} props Abre la confirmación de cierre de sesión.
 * @returns {import('react').ReactElement} Navegación de escritorio/tablet sin reporte de errores.
 */
export function AdminSidebar({ onLogout }) {
  return (
    <aside className="admin-sidebar">
      <AdminBrand />
      <span className="admin-tablet-mark">
        <Icon name="modern-tablet" size={28} />
      </span>
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
        <button type="button" className="admin-logout" title="Cerrar sesión" onClick={onLogout}>
          <Icon name="modern-logout" size={20} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
