import { useContext } from 'react';
import { AuthContext } from './auth-context.js';

/**
 * Expone estado y acciones de sesión del proveedor, sin acceder a cookies HttpOnly.
 * @returns {object} Estado loading/authenticated/unauthenticated/error y acciones.
 * @throws {Error} Si se usa fuera de AuthProvider.
 */
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth requiere AuthProvider');
  return value;
}
