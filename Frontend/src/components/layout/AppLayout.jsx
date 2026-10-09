import { Outlet } from 'react-router';
import { ThemeToggle } from '../ui/ThemeToggle.jsx';
import { AuthNavigation } from '../../features/auth/AuthNavigation.jsx';

/**
 * Estructura mínima compartida y punto de salida del router.
 * @returns {import('react').ReactElement} Contenido de la ruta activa.
 */
export function AppLayout() {
  return (
    <div className="bg-page text-content">
      <header>
        <p>VocesSilentes · Lengua de Señas Venezolana</p>
        <ThemeToggle />
        <AuthNavigation />
      </header>
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
