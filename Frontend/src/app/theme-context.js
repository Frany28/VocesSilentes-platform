import { createContext } from 'react';

/** @typedef {{theme: 'light' | 'dark', toggleTheme: () => void}} ThemeState */
/** @type {import('react').Context<ThemeState | undefined>} */
export const ThemeContext = createContext(undefined);
