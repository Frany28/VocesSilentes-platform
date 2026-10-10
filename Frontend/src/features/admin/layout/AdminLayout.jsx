import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Brand } from '../../../components/ui/Brand.jsx';
import { ThemeToggle } from '../../../components/ui/ThemeToggle.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { useAuth } from '../../auth/use-auth.js';
import { AdminProvider } from '../data/AdminProvider.jsx';
import { AdminNavigation } from './AdminNavigation.jsx';
import { AdminConfirmation } from '../components/AdminConfirmation.jsx';
import { AdminPreview } from './AdminPreview.jsx';
import { AdminLeaveGuard } from './AdminLeaveGuard.jsx';
import '../styles/admin.css';

/**
 * Estructura responsive original y logout existente; solo se monta tras autorización ADMIN.
 * @returns {import('react').ReactElement} Sidebar, navegación móvil y contenido con temas persistidos.
 */
export function AdminLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const logout = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await auth.logout();
      navigate('/login', { replace: true });
    } catch (reason) {
      setError(reason.message);
      setPending(false);
    }
  };
  const section = pathname.includes('/reports')
    ? 'Reportes'
    : pathname.includes('/users')
      ? 'Usuarios'
      : 'Resumen';
  return (
    <AdminProvider>
      <AdminLeaveGuard>
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <div className="admin-brand-full">
              <Brand />
            </div>
            <div className="admin-brand-compact">
              <Brand compact />
            </div>
            <p className="admin-sidebar-label">ADMINISTRACIÓN</p>
            <AdminNavigation />
            <p className="admin-sidebar-label">AYUDA Y CUENTA</p>
            <button
              type="button"
              className="admin-logout"
              title="Cerrar sesión"
              onClick={() => setConfirm(true)}
            >
              <Icon name="admin-logout" size={20} />
              <span>Cerrar sesión</span>
            </button>
          </aside>
          <div className="admin-content">
            <div className="admin-topbar">
              <p className="admin-breadcrumb">Administración / {section}</p>
              <div className="admin-mobile-brand">
                <Brand />
              </div>
              <ThemeToggle />
            </div>
            <div className="admin-mobile-nav">
              <AdminNavigation compact />
            </div>
            <main>
              <Outlet />
            </main>
            <button type="button" className="admin-mobile-logout" onClick={() => setConfirm(true)}>
              Cerrar sesión
            </button>
            <footer>VocesSilentes · Más señas, menos barreras.</footer>
            {import.meta.env.DEV && <AdminPreview />}
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
