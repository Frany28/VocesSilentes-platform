import { useState } from 'react';
import { useAuth } from './use-auth.js';

/**
 * Verifica el flujo con una vista provisional de usuario/administrador y logout explícito.
 * @param {{admin?: boolean}} props Tipo de destino protegido.
 * @returns {import('react').ReactElement} Datos públicos y controles de sesión.
 */
export function SessionPage({ admin = false }) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const logout = async () => {
    setPending(true);
    setError('');
    try {
      await auth.logout();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setPending(false);
    }
  };
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
      <button onClick={auth.refresh} disabled={pending}>
        Comprobar sesión
      </button>
      <button onClick={logout} disabled={pending}>
        {pending ? 'Cerrando…' : 'Cerrar sesión'}
      </button>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
