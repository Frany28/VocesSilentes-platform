import { AdminLayout } from './layout/AdminLayout.jsx';
import { AdminSummary } from './pages/AdminSummary.jsx';
import { AdminUsers } from './pages/AdminUsers.jsx';
import { AdminUserDetail } from './pages/AdminUserDetail.jsx';
import { AdminUserForm } from './pages/AdminUserForm.jsx';
import { AdminUserCreated } from './pages/AdminUserCreated.jsx';
import { AdminReportsRoute } from './pages/AdminReportsRoute.jsx';
import { AdminReportRoute } from './pages/AdminReportRoute.jsx';
import { AdminProfile } from './pages/AdminProfile.jsx';
/**
 * Rutas del entorno administrativo; el consumidor debe montarlas debajo de AdminGuard.
 * @returns {import('react-router').RouteObject} Layout y siete pantallas, incluida respuesta de creación.
 */
export function adminRoutes() {
  return {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminSummary /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'users/new', element: <AdminUserForm /> },
      { path: 'users/:id', element: <AdminUserDetail /> },
      { path: 'users/:id/edit', element: <AdminUserForm /> },
      { path: 'users/:id/created', element: <AdminUserCreated /> },
      { path: 'reports', element: <AdminReportsRoute /> },
      { path: 'reports/:id', element: <AdminReportRoute /> },
      { path: 'profile', element: <AdminProfile /> },
      { path: 'profile/security', element: <AdminProfile /> },
    ],
  };
}
