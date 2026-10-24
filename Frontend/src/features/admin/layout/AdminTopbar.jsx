import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ThemeAction } from '../../../components/ui/ThemeAction.jsx';
import { useAuth } from '../../auth/use-auth.js';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { IconAction } from '../../../components/ui/IconAction.jsx';
import { Dialog } from '../../../components/ui/Dialog.jsx';
import { AdminNavigation } from './AdminNavigation.jsx';
import { Brand } from '../../../components/ui/Brand.jsx';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Breadcrumb, tema persistido y acceso a perfil real; menú móvil accesible por teclado.
 * @param {{onLogout: Function}} props Confirmación de logout del layout.
 * @returns {import('react').ReactElement} Barra superior común.
 */
export function AdminTopbar({ onLogout }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [menu, setMenu] = useState(false);
  const profile = pathname.startsWith('/admin/profile');
  const section = pathname.includes('/profile')
    ? 'Mi perfil'
    : pathname.includes('/reports')
      ? 'Reportes'
      : pathname.includes('/audit')
        ? 'Bitácora'
        : pathname.includes('/users')
          ? 'Usuarios'
          : 'Resumen';
  return (
    <div className="admin-topbar">
      {profile ? (
        <IconAction to="/admin" icon="back" label="Volver al resumen" />
      ) : (
        <p className="admin-breadcrumb">Administración / {section}</p>
      )}
      <div className="admin-mobile-brand">
        <IconAction
          icon="menu"
          label="Abrir menú de administración"
          onClick={() => setMenu(true)}
        />
        <Brand />
      </div>
      <div className="admin-topbar-actions">
        <ThemeAction />
        <Link to="/admin/profile" aria-label="Mi perfil" className="account-profile-link">
          <Avatar user={user} />
          <span>Mi perfil</span>
        </Link>
      </div>
      {menu && (
        <Dialog title="Administración" onClose={() => setMenu(false)} className="admin-menu">
          <div
            onClick={(event) => {
              if (event.target.closest('a')) setMenu(false);
            }}
          >
            <AdminNavigation />
          </div>
          <Button
            density="compact"
            icon={null}
            variant="secondary"
            onClick={() => {
              setMenu(false);
              onLogout();
            }}
          >
            Cerrar sesión
          </Button>
        </Dialog>
      )}
    </div>
  );
}
