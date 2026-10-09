import { useContext } from 'react';
import { ThemeContext } from '../app/theme-context.js';

/**
 * Obtiene el tema y su acción de cambio sin depender de componentes visuales.
 * @returns {import('../app/theme-context.js').ThemeState} Estado compartido del tema.
 * @throws {Error} Si se usa fuera de ThemeProvider.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme requiere ThemeProvider');
  return context;
}
