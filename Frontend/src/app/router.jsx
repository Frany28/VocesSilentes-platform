import { Link, Navigate } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { RegistrationPage } from '../features/auth/registration/RegistrationPage.jsx';
import { AuthGuard, AdminGuard, StudentGuard } from '../features/auth/AuthGuard.jsx';
import { SessionPage } from '../features/auth/SessionPage.jsx';
import { LoginPage } from '../features/auth/login/LoginPage.jsx';
import { studentRoutes } from '../features/student/student.routes.jsx';
import { adminRoutes } from '../features/admin/admin.routes.jsx';

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
        { element: <AdminGuard />, children: [adminRoutes()] },
        { element: <StudentGuard />, children: [studentRoutes()] },
      ],
    },
    {
      element: <AppLayout />,
      children: [
        {
          element: <AuthGuard />,
          children: [{ path: '/account', element: <SessionPage /> }],
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
