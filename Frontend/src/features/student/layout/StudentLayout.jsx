import { Outlet, useLocation } from 'react-router';
import { Brand } from '../../../components/ui/Brand.jsx';
import { ThemeToggle } from '../../../components/ui/ThemeToggle.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { StudentProvider } from '../data/StudentProvider.jsx';
import { StudentSidebar } from './StudentSidebar.jsx';
import { StudentNavigation } from './StudentNavigation.jsx';
import { StudentDemoControls } from './StudentDemoControls.jsx';
import { useStudentActions } from './use-student-actions.js';
import { publicConfig } from '../../../lib/config.js';
import '../student.css';

/**
 * Comparte layout protegido con contenido fluido de hasta 1044 px después de la barra lateral.
 * @returns {import('react').ReactElement} Páginas de estudiante protegidas por el guard existente.
 */
export function StudentLayout() {
  const actions = useStudentActions();
  const page = useLocation().pathname.split('/')[2] || 'home';
  const title = {
    modules: 'Mis módulos',
    practice: 'Practicar',
    progress: 'Mi progreso',
    profile: 'Mi perfil',
  }[page];
  return (
    <StudentProvider>
      <div
        className="student-shell flex min-h-svh gap-6 bg-page p-6 text-content [font:var(--type-secondary)]
        [overflow-wrap:anywhere]"
        data-page={page}
      >
        <a href="#student-content" className="student-skip sr-only focus:not-sr-only">
          Saltar al contenido
        </a>
        <StudentSidebar
          onUnavailable={actions.onUnavailable}
          onLogout={actions.logout}
          pending={actions.pending}
        />
        <div className="min-w-0 flex-1">
          <div className="student-container mx-auto flex w-full flex-col gap-6">
            <header className="flex min-h-13 items-center gap-4">
              <div className="min-[600px]:hidden">
                <Brand />
              </div>
              <p className="hidden min-w-0 flex-1 text-muted [font:var(--type-label)] min-[600px]:block">
                Mi aprendizaje{title ? ` / ${title}` : ''}
              </p>
              <ThemeToggle
                className="student-theme flex-none max-[600px]:w-28! max-[600px]:gap-4!
                max-[600px]:[&_.vs-theme-label]:hidden! max-[360px]:w-20!
                max-[360px]:[&>.vs-icon]:hidden!"
              />
            </header>
            <main id="student-content" tabIndex={-1}>
              <Outlet context={{ onOpen: actions.openLearning }} />
            </main>
            <div className="empty:hidden" role="status" aria-live="polite" aria-atomic="true">
              {actions.notice && (
                <Alert key={actions.notice.id} className="w-full!" title="Próximamente">
                  {actions.notice.message}
                </Alert>
              )}
            </div>
            {actions.error && (
              <Alert tone="error" className="w-full!" title="Sesión activa">
                {actions.error}
              </Alert>
            )}
            <footer className="flex flex-wrap items-center justify-between gap-3 text-muted [font:var(--type-label)]">
              <p>VocesSilentes · Más señas, menos barreras.</p>
              <button
                type="button"
                onClick={actions.logout}
                disabled={actions.pending}
                className="min-h-11 rounded-lg bg-transparent! p-2! text-content! min-[600px]:hidden
                  focus-visible:outline-3 focus-visible:outline-focus"
              >
                {actions.pending ? 'Cerrando…' : 'Cerrar sesión'}
              </button>
            </footer>
            {publicConfig.studentDemo && <StudentDemoControls />}
            <div className="min-[600px]:hidden">
              <StudentNavigation bottom />
            </div>
          </div>
        </div>
      </div>
    </StudentProvider>
  );
}
