import { StudentLayout } from './layout/StudentLayout.jsx';
import { StudentHome } from './pages/StudentHome.jsx';
import { StudentModules } from './pages/StudentModules.jsx';
import { StudentPractice } from './pages/StudentPractice.jsx';
import { StudentProgress } from './pages/StudentProgress.jsx';
import { StudentProfile } from './pages/StudentProfile.jsx';

/**
 * Publica las cinco vistas académicas bajo el guard USER del router, sin bypass de sesión.
 * @returns {import('react-router').RouteObject} Layout y destinos de estudiante.
 */
export function studentRoutes() {
  return {
    element: <StudentLayout />,
    children: [
      { path: '/student', element: <StudentHome /> },
      { path: '/student/modules', element: <StudentModules /> },
      { path: '/student/practice', element: <StudentPractice /> },
      { path: '/student/progress', element: <StudentProgress /> },
      { path: '/student/profile', element: <StudentProfile /> },
    ],
  };
}
