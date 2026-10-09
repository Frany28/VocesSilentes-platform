import { useState } from 'react';
import { AuthContext } from './auth-context.js';
import { createAuthApi } from './auth.api.js';
import { useAuthSession } from './use-auth-session.js';

/**
 * Mantiene autenticación en memoria y confirma la cookie con /me al montar.
 * @param {{children: import('react').ReactNode}} props Contenido de aplicación.
 * @returns {import('react').ReactElement} Proveedor de sesión.
 */
export function AuthProvider({ children }) {
  const [api] = useState(createAuthApi);
  const value = useAuthSession(api);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
