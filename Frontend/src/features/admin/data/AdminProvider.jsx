import { useState } from 'react';
import { AdminContext } from './admin-context.js';
import { createUsersApi } from './users.api.js';

/**
 * Comparte cliente real y protección de borradores; no inyecta colecciones sintéticas.
 * @param {{children: import('react').ReactNode}} props Panel protegido por ADMIN.
 * @returns {import('react').ReactElement} Contexto sin caché personal ni simulaciones de escrituras.
 */
export function AdminProvider({ children }) {
  const [api] = useState(createUsersApi);
  const [draft, setDraft] = useState({ dirty: false, pending: false });
  return <AdminContext.Provider value={{ api, draft, setDraft }}>{children}</AdminContext.Provider>;
}
