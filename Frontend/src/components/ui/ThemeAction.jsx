import { useTheme } from '../../hooks/use-theme.js';
import { IconAction } from './IconAction.jsx';

/**
 * Cambia la preferencia persistida; el icono indica el tema de destino de Figma.
 * @returns {import('react').ReactElement} Luna en claro y sol en oscuro, sin peticiones.
 */
export function ThemeAction() {
  const { theme, toggleTheme } = useTheme();
  return (
    <IconAction
      icon={theme === 'dark' ? 'sun' : 'moon'}
      label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={toggleTheme}
    />
  );
}
