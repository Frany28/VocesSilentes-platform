import { useEffect, useState } from 'react';
import { ThemeContext } from './theme-context.js';

function initialTheme() {
  try {
    const saved = localStorage.getItem('vocessilentes-theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // El tema sigue funcionando si el navegador bloquea almacenamiento.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Aplica el tema a la raíz y guarda la preferencia cuando el navegador lo permite.
 * @param {{children: import('react').ReactNode}} props Contenido de la aplicación.
 * @returns {import('react').ReactElement} Proveedor del tema.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('vocessilentes-theme', theme);
    } catch {
      // No convertir una preferencia opcional en un error de la aplicación.
    }
  }, [theme]);
  const toggleTheme = () => setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  return <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>;
}
