import { NavLink } from 'react-router';
import { ProfileIdentity } from './ProfileIdentity.jsx';

/**
 * Composición común: identidad, configuración y pestañas con rutas reales.
 * @param {{user: object, basePath: string, children: import('react').ReactNode}} props Sesión y panel operativo.
 * @returns {import('react').ReactElement} Perfil adaptable según 300:11971 y el estándar compartido.
 */
export function ProfilePage({ user, basePath, children }) {
  return (
    <div className="account-profile-page account-page">
      <header className="account-heading">
        <p className="account-kicker">
          {user.role === 'ADMIN' ? 'ADMINISTRACIÓN' : 'MI APRENDIZAJE'} / MI CUENTA
        </p>
        <h1>Tu perfil, a tu manera.</h1>
        <p>Una identidad que te representa. Un espacio que sientes tuyo.</p>
      </header>
      <div className="account-profile-grid">
        <ProfileIdentity user={user} />
        <section className="account-panel account-profile-settings">
          <nav aria-label="Configuración de mi perfil" className="account-profile-tabs">
            <NavLink to={basePath} end>
              Datos personales
            </NavLink>
            <NavLink to={`${basePath}/security`}>Seguridad</NavLink>
          </nav>
          {children}
        </section>
      </div>
    </div>
  );
}
