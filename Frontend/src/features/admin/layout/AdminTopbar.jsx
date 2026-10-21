import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useTheme } from '../../../hooks/use-theme.js';
import { useAuth } from '../../auth/use-auth.js';
import { AdminAvatar } from '../components/AdminAvatar.jsx';
import { AdminIconButton } from '../components/AdminIconButton.jsx';
import { AdminDialog } from '../components/AdminDialog.jsx';
import { AdminNavigation } from './AdminNavigation.jsx';
import { AdminBrand } from './AdminBrand.jsx';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Breadcrumb, tema persistido y acceso a perfil real; menú móvil accesible por teclado.
 * @param {{onLogout: Function}} props Confirmación de logout del layout.
 * @returns {import('react').ReactElement} Barra superior común.
 */
export function AdminTopbar({ onLogout }) {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const profile = pathname.startsWith('/admin/profile');
  const section = pathname.includes('/profile')
    ? 'Mi perfil'
    : pathname.includes('/reports')
      ? 'Reportes'
      : pathname.includes('/users')
        ? 'Usuarios'
        : 'Resumen';
  return (
    <div className="admin-topbar">
      {profile ? (
        <AdminIconButton to="/admin" icon="back" label="Volver al resumen" />
      ) : (
        <p className="admin-breadcrumb">Administración / {section}</p>
      )}
      <div className="admin-mobile-brand">
        <AdminIconButton
          icon="menu"
          label="Abrir menú de administración"
          onClick={() => setMenu(true)}
        />
        <AdminBrand />
      </div>
      <div className="admin-topbar-actions">
        <AdminIconButton
          icon="sun"
          label={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          onClick={toggleTheme}
          className="admin-theme"
        />
        <Link to="/admin/profile" aria-label="Mi perfil" className="admin-profile-link">
          <AdminAvatar user={user} />
          <span>Mi perfil</span>
        </Link>
      </div>
      {menu && (
        <AdminDialog title="Administración" onClose={() => setMenu(false)} className="admin-menu">
          <div
            onClick={(event) => {
              if (event.target.closest('a')) setMenu(false);
            }}
          >
            <AdminNavigation />
          </div>
          <Button
            icon={null}
            variant="secondary"
            onClick={() => {
              setMenu(false);
              onLogout();
            }}
          >
            Cerrar sesión
          </Button>
        </AdminDialog>
      )}
    </div>
  );
}
