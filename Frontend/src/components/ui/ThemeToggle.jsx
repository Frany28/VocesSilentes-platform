import { useTheme } from '../../hooks/use-theme.js';

/**
 * Control accesible de la preferencia de tema; no realiza peticiones de red.
 * @returns {import('react').ReactElement} Botón de tema.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" aria-pressed={theme === 'dark'} onClick={toggleTheme}>
      Tema oscuro
    </button>
  );
}
