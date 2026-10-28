import { useAuth } from './use-auth.js';
import { useLogout } from './use-logout.js';
import { LogoutConfirmation } from './LogoutConfirmation.jsx';

/**
 * Verifica el flujo con una vista provisional de usuario/administrador y logout explícito.
 * @param {{admin?: boolean}} props Tipo de destino protegido.
 * @returns {import('react').ReactElement} Datos públicos y controles de sesión.
 */
export function SessionPage({ admin = false }) {
  const auth = useAuth();
  const logout = useLogout();
  return (
    <section>
      <h1>{admin ? 'Administración' : 'Mi cuenta'}</h1>
      <p>Vista provisional para verificar autenticación y permisos.</p>
      <p>
        {auth.user.firstName} {auth.user.lastName}
      </p>
      <p>
        {auth.user.email} · {auth.user.role}
      </p>
      <p>Correo {auth.user.emailVerified ? 'verificado' : 'pendiente de verificación'}.</p>
      <button onClick={auth.refresh} disabled={logout.pending}>
        Comprobar sesión
      </button>
      <button onClick={logout.open} disabled={logout.pending}>
        {logout.pending ? 'Cerrando…' : 'Cerrar sesión'}
      </button>
      <LogoutConfirmation operation={logout} />
    </section>
  );
}
