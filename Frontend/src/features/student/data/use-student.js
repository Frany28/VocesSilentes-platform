import { useContext } from 'react';
import { StudentContext } from './student-context.js';

/**
 * Obtiene datos/estado compartidos por las dos páginas; no mezcla demostración y sesión.
 * @returns {object} Instantánea y acciones del adaptador.
 */
export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('Se requiere StudentProvider');
  return context;
}
