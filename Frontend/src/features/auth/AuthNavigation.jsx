import { Link } from 'react-router';
import { useAuth } from './use-auth.js';

/**
 * Muestra enlaces acordes al estado confirmado; no solicita datos desde la presentación.
 * @returns {import('react').ReactElement} Navegación accesible.
 */
export function AuthNavigation() {
  const auth = useAuth();
  return (
    <nav aria-label="Cuenta">
      <Link to="/">Inicio</Link>
      {' · '}
      {auth.status === 'authenticated' ? (
        <>
          <Link to="/student">Mi aprendizaje</Link> · <Link to="/account">Mi cuenta</Link>
          {auth.user.role === 'ADMIN' && (
            <>
              {' '}
              · <Link to="/admin">Administración</Link>
            </>
          )}
        </>
      ) : (
        <>
          <Link to="/login">Iniciar sesión</Link> · <Link to="/register">Registro</Link>
        </>
      )}
    </nav>
  );
}
