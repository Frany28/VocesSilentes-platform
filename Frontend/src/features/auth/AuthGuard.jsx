import { Link, Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './use-auth.js';

/**
 * Oculta contenido protegido hasta confirmar sesión; diferencia red de ausencia de sesión.
 * @returns {import('react').ReactElement} Guard, estado de conexión o rutas autorizadas.
 */
export function AuthGuard() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === 'loading') return <p role="status">Comprobando sesión…</p>;
  if (auth.status === 'error')
    return (
      <div role="alert">
        <p>No se pudo comprobar la sesión. Revisa la conexión.</p>
        <button onClick={auth.refresh}>Reintentar</button>
      </div>
    );
  if (auth.status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/**
 * Limita la vista administrativa; un 403 no elimina la sesión existente.
 * @returns {import('react').ReactElement} Vista autorizada o aviso de permisos.
 */
export function AdminGuard() {
  const auth = useAuth();
  if (auth.user?.role !== 'ADMIN')
    return (
      <div>
        <p role="alert">No tienes permiso para acceder a esta vista.</p>
        <Link to="/account">Mi cuenta</Link>
      </div>
    );
  return <Outlet />;
}

/**
 * Restringe Student al rol USER confirmado; no sustituye autorización de los recursos de la API.
 * @returns {import('react').ReactElement} Entorno de estudiante o aviso de permisos sin cerrar sesión.
 */
export function StudentGuard() {
  const auth = useAuth();
  if (auth.user?.role !== 'USER')
    return (
      <div>
        <p role="alert">No tienes permiso para acceder al área de estudiante.</p>
        <Link to={auth.user?.role === 'ADMIN' ? '/admin' : '/account'}>
          {auth.user?.role === 'ADMIN' ? 'Ir a administración' : 'Mi cuenta'}
        </Link>
      </div>
    );
  return <Outlet />;
}
