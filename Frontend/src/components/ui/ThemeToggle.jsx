import { useTheme } from '../../hooks/use-theme.js';
import { ThemeSwitch } from './ThemeSwitch.jsx';

/**
 * Control accesible de la preferencia de tema; no realiza peticiones de red.
 * @param {object} props Atributos de ThemeSwitch para adaptar el control al contexto.
 * @returns {import('react').ReactElement} Botón de tema.
 */
export function ThemeToggle(props) {
  const { theme, toggleTheme } = useTheme();
  return <ThemeSwitch {...props} dark={theme === 'dark'} onClick={toggleTheme} />;
}
