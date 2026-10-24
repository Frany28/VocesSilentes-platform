import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { StudentTopbar } from './StudentTopbar.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { StudentProvider } from '../data/StudentProvider.jsx';
import { StudentSidebar } from './StudentSidebar.jsx';
import { StudentNavigation } from './StudentNavigation.jsx';
import { StudentDemoControls } from './StudentDemoControls.jsx';
import { useStudentActions } from './use-student-actions.js';
import { publicConfig } from '../../../lib/config.js';
import '../student.css';

/**
 * Comparte layout protegido: aprendizaje de hasta 1128 px y cuenta/reporte de 904 px.
 * @returns {import('react').ReactElement} Páginas de estudiante protegidas por el guard existente.
 */
export function StudentLayout() {
  const actions = useStudentActions();
  const { pathname } = useLocation();
  const page = pathname.split('/')[2] || 'home';
  const account = ['profile', 'reports'].includes(page);
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return (
    <StudentProvider>
      <div
        className="student-shell flex min-h-svh bg-page text-content [font:var(--type-secondary)]
        [overflow-wrap:anywhere]"
        data-page={page}
        data-account={account || undefined}
      >
        <a href="#student-content" className="student-skip sr-only focus:not-sr-only">
          Saltar al contenido
        </a>
        <StudentSidebar
          onUnavailable={actions.onUnavailable}
          onLogout={actions.logout}
          pending={actions.pending}
        />
        <div className="student-content min-w-0 flex-1">
          <div className="student-container mx-auto flex w-full flex-col">
            <StudentTopbar page={page} account={account} />
            <main id="student-content" tabIndex={-1}>
              <Outlet context={{ onOpen: actions.openLearning }} />
            </main>
            <div className="empty:hidden" role="status" aria-live="polite" aria-atomic="true">
              {actions.notice && (
                <Alert key={actions.notice.id} className="w-full" title="Próximamente">
                  {actions.notice.message}
                </Alert>
              )}
            </div>
            {actions.error && (
              <Alert tone="error" className="w-full" title="Sesión activa">
                {actions.error}
              </Alert>
            )}
            <footer className="flex flex-wrap items-center justify-between gap-3 text-muted [font:var(--type-label)]">
              <p>VocesSilentes · Más señas, menos barreras.</p>
              <button
                type="button"
                onClick={actions.logout}
                disabled={actions.pending}
                className="min-h-11 rounded-lg bg-transparent p-2 text-content min-[600px]:hidden
                  focus-visible:outline-3 focus-visible:outline-focus"
              >
                {actions.pending ? 'Cerrando…' : 'Cerrar sesión'}
              </button>
            </footer>
            {publicConfig.studentDemo && !account && <StudentDemoControls />}
            {page !== 'reports' && (
              <div className="min-[600px]:hidden">
                <StudentNavigation bottom />
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentProvider>
  );
}
