import { useRoutes } from 'react-router';
import { createRoutes } from './router.jsx';

/**
 * Resuelve las rutas dentro del router y proveedores de la aplicación.
 * @returns {import('react').ReactElement | null} Ruta activa.
 */
export function App() {
  return useRoutes(createRoutes());
}
