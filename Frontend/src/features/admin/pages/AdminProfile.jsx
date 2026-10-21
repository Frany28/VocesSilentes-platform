import { NavLink, useLocation } from 'react-router';
import { useAuth } from '../../auth/use-auth.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminProfileIdentity } from '../profile/AdminProfileIdentity.jsx';
import { AdminProfileForm } from '../profile/AdminProfileForm.jsx';
import { AdminSecurityForm } from '../profile/AdminSecurityForm.jsx';

/**
 * Perfil y seguridad del ADMIN autenticado, con tabs navegables y datos de sesión reales.
 * @returns {import('react').ReactElement} Identidad, foto y configuración según Figma 298:1724/1840.
 */
export function AdminProfile() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const security = pathname.endsWith('/security');
  return (
    <div className="admin-page admin-profile-page">
      <header className="admin-heading">
        <p className="admin-kicker">ADMINISTRACIÓN / MI CUENTA</p>
        <AdminHeading title="Tu perfil, a tu manera.">
          Una identidad que te representa. Un espacio que sientes tuyo.
        </AdminHeading>
      </header>
      <div className="admin-profile-grid">
        <AdminProfileIdentity user={user} />
        <section className="admin-panel admin-profile-settings">
          <nav aria-label="Configuración de mi perfil" className="admin-profile-tabs">
            <NavLink to="/admin/profile" end>
              Datos personales
            </NavLink>
            <NavLink to="/admin/profile/security">Seguridad</NavLink>
          </nav>
          {security ? <AdminSecurityForm /> : <AdminProfileForm key={user.id} user={user} />}
        </section>
      </div>
    </div>
  );
}
