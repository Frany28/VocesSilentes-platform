import { Link } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { SystemPage } from '../features/system/SystemPage.jsx';
import { AuthPage } from '../features/auth/AuthPage.jsx';
import { AuthGuard, AdminGuard } from '../features/auth/AuthGuard.jsx';
import { SessionPage } from '../features/auth/SessionPage.jsx';
import { LoginPage } from '../features/auth/login/LoginPage.jsx';

/**
 * Define las rutas mínimas; permite BrowserRouter y MemoryRouter en pruebas.
 * @returns {import('react-router').RouteObject[]} Contrato inicial del router.
 */
export function createRoutes() {
  return [
    { path: '/login', element: <LoginPage /> },
    {
      element: <AppLayout />,
      children: [
        { path: '/', element: <SystemPage /> },
        { path: '/register', element: <AuthPage mode="register" /> },
        {
          element: <AuthGuard />,
          children: [
            { path: '/account', element: <SessionPage /> },
            {
              element: <AdminGuard />,
              children: [{ path: '/admin', element: <SessionPage admin /> }],
            },
          ],
        },
        {
          path: '*',
          element: (
            <p>
              Ruta no encontrada. <Link to="/">Volver al inicio</Link>
            </p>
          ),
        },
      ],
    },
  ];
}
