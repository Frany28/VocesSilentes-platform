import { Outlet } from 'react-router';
import { useLogout } from '../../auth/use-logout.js';
import { LogoutConfirmation } from '../../auth/LogoutConfirmation.jsx';
import { AdminProvider } from '../data/AdminProvider.jsx';
import { AdminNavigation } from './AdminNavigation.jsx';
import { AdminSidebar } from './AdminSidebar.jsx';
import { AdminTopbar } from './AdminTopbar.jsx';
import { AdminLeaveGuard } from './AdminLeaveGuard.jsx';
import '../styles/admin.css';

/**
 * Panel adaptable bajo AdminGuard; comparte sesión/tema existentes y confirma logout real.
 * @returns {import('react').ReactElement} Navegación y contenido administrativo.
 */
export function AdminLayout() {
  const logout = useLogout();
  return (
    <AdminProvider>
      <AdminLeaveGuard>
        <div className="admin-shell">
          <AdminSidebar onLogout={logout.open} />
          <div className="admin-content">
            <AdminTopbar onLogout={logout.open} />
            <div className="admin-mobile-nav">
              <AdminNavigation compact />
            </div>
            <main>
              <Outlet />
            </main>
            <footer>VocesSilentes · Más señas, menos barreras.</footer>
            <button type="button" className="admin-mobile-logout" onClick={logout.open}>
              Cerrar sesión
            </button>
          </div>
          <LogoutConfirmation operation={logout} />
        </div>
      </AdminLeaveGuard>
    </AdminProvider>
  );
}
