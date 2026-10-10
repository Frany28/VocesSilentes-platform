import { Link, Navigate } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { RegistrationPage } from '../features/auth/registration/RegistrationPage.jsx';
import { AuthGuard, AdminGuard } from '../features/auth/AuthGuard.jsx';
import { SessionPage } from '../features/auth/SessionPage.jsx';
import { LoginPage } from '../features/auth/login/LoginPage.jsx';
import { StudentLayout } from '../features/student/layout/StudentLayout.jsx';
import { StudentHome } from '../features/student/pages/StudentHome.jsx';
import { StudentModules } from '../features/student/pages/StudentModules.jsx';

/**
 * Define las rutas mínimas; permite BrowserRouter y MemoryRouter en pruebas.
 * @returns {import('react-router').RouteObject[]} Contrato inicial del router.
 */
export function createRoutes() {
  return [
    { path: '/', element: <Navigate to="/login" replace /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegistrationPage /> },
    {
      element: <AuthGuard />,
      children: [
        {
          element: <StudentLayout />,
          children: [
            { path: '/student', element: <StudentHome /> },
            { path: '/student/modules', element: <StudentModules /> },
          ],
        },
      ],
    },
    {
      element: <AppLayout />,
      children: [
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
