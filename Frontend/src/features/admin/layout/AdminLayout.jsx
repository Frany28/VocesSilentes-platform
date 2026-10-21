import { useState } from 'react';
import { Outlet } from 'react-router';
import { useAuth } from '../../auth/use-auth.js';
import { AdminProvider } from '../data/AdminProvider.jsx';
import { AdminNavigation } from './AdminNavigation.jsx';
import { AdminSidebar } from './AdminSidebar.jsx';
import { AdminTopbar } from './AdminTopbar.jsx';
import { AdminConfirmation } from '../components/AdminConfirmation.jsx';
import { AdminLeaveGuard } from './AdminLeaveGuard.jsx';
import '../styles/admin.css';

/**
 * Panel adaptable bajo AdminGuard; comparte sesión/tema existentes y confirma logout real.
 * @returns {import('react').ReactElement} Navegación y contenido administrativo.
 */
export function AdminLayout() {
  const auth = useAuth();
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const logout = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await auth.logout();
    } catch (reason) {
      setError(reason.message);
      setPending(false);
    }
  };
  return (
    <AdminProvider>
      <AdminLeaveGuard>
        <div className="admin-shell">
          <AdminSidebar onLogout={() => setConfirm(true)} />
          <div className="admin-content">
            <AdminTopbar onLogout={() => setConfirm(true)} />
            <div className="admin-mobile-nav">
              <AdminNavigation compact />
            </div>
            <main>
              <Outlet />
            </main>
            <footer>VocesSilentes · Más señas, menos barreras.</footer>
            <button type="button" className="admin-mobile-logout" onClick={() => setConfirm(true)}>
              Cerrar sesión
            </button>
          </div>
          {confirm && (
            <AdminConfirmation
              title="¿Cerrar sesión?"
              confirm="Cerrar sesión"
              pending={pending}
              error={error}
              onCancel={() => {
                setConfirm(false);
                setError(null);
              }}
              onConfirm={logout}
            >
              Tendrás que iniciar sesión para volver al panel de administración.
            </AdminConfirmation>
          )}
        </div>
      </AdminLeaveGuard>
    </AdminProvider>
  );
}
