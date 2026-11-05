import { StudentLayout } from './layout/StudentLayout.jsx';
import { StudentHome } from './pages/StudentHome.jsx';
import { StudentModules } from './pages/StudentModules.jsx';
import { StudentPractice } from './pages/StudentPractice.jsx';
import { StudentProgress } from './pages/StudentProgress.jsx';
import { StudentProfile } from './pages/StudentProfile.jsx';
import { ReportForm } from '../reports/ReportForm.jsx';
import { StudentLesson } from './lesson/StudentLesson.jsx';

/**
 * Publica las vistas académicas y la lectura por IDs bajo el guard USER existente.
 * @returns {import('react-router').RouteObject} Layout y destinos de estudiante.
 */
export function studentRoutes() {
  return {
    element: <StudentLayout />,
    children: [
      { path: '/student', element: <StudentHome /> },
      { path: '/student/modules', element: <StudentModules /> },
      { path: '/student/modules/:moduleId/lessons/:lessonId', element: <StudentLesson /> },
      { path: '/student/practice', element: <StudentPractice /> },
      { path: '/student/progress', element: <StudentProgress /> },
      { path: '/student/profile', element: <StudentProfile /> },
      { path: '/student/profile/security', element: <StudentProfile /> },
      { path: '/student/reports/new', element: <ReportForm /> },
    ],
  };
}
