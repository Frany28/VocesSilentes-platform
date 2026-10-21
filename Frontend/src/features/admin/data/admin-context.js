import { createContext, useContext } from 'react';
export const AdminContext = createContext(null);
/**
 * Accede al cliente real y la protección de borradores del proveedor administrativo.
 * @returns {object} Contexto; requiere AdminProvider dentro del guard de administrador.
 */
export function useAdmin() {
  return useContext(AdminContext);
}
