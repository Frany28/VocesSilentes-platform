import { render } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router';
import { AuthProvider } from '../features/auth/AuthProvider.jsx';
import { AuthGuard } from '../features/auth/AuthGuard.jsx';
import { StudentProvider } from '../features/student/data/StudentProvider.jsx';
import { StudentHome } from '../features/student/pages/StudentHome.jsx';
import { StudentModules } from '../features/student/pages/StudentModules.jsx';

/**
 * Monta páginas reales con un lector controlado; fetch de sesión se prepara en cada prueba.
 * @param {Function} read Lector sin persistencia usado por la prueba.
 * @param {string} [path] Ruta a inspeccionar.
 * @returns {object} Utilidades Testing Library.
 */
export function renderStudentRead(read, path = '/student/modules') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route element={<AuthGuard />}>
            <Route
              element={
                <StudentProvider read={read}>
                  <Outlet context={{ onOpen: () => {} }} />
                </StudentProvider>
              }
            >
              <Route path="/student" element={<StudentHome />} />
              <Route path="/student/modules" element={<StudentModules />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}
