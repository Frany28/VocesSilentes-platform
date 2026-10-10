import { createContext, useContext } from 'react';
export const AdminContext = createContext(null);
/**
 * Accede a cuentas consultadas, datos demo y acciones del proveedor administrativo.
 * @returns {object} Contexto; requiere AdminProvider dentro del guard de administrador.
 */
export function useAdmin() {
  return useContext(AdminContext);
}
