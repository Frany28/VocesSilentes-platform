import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';
import { Brand } from '../../components/ui/Brand.jsx';
import { LoginVisual } from './login/LoginVisual.jsx';
import { LoginLink } from './login/LoginLink.jsx';
import './login/login.css';

/**
 * Comparte la composición de acceso; la altura crece con los campos y errores.
 * @param {object} props Presentación de la página, sin credenciales ni peticiones.
 * @param {boolean} props.pending Envío en curso.
 * @param {object | null} props.feedback Mensaje de servidor.
 * @param {object} props.fieldErrors Errores locales por campo.
 * @param {import('react').ReactNode} props.children Formulario de login o registro.
 * @returns {import('react').ReactElement} Acceso adaptable en ambos temas.
 */
export function AuthLayout({ pending, feedback, fieldErrors, children }) {
  const hasErrors = Boolean(feedback) || Object.values(fieldErrors).some(Boolean);
  return (
    <main
      id="main-content"
      className="login-page relative isolate overflow-clip text-content
        [font:var(--type-secondary)] [overflow-wrap:anywhere]"
      data-state={hasErrors ? 'error' : pending ? 'loading' : 'initial'}
    >
      <div className="login-access relative">
        <header className="login-header relative flex w-full items-center justify-between gap-4">
          <Brand smallDark />
          <ThemeToggle
            className="login-theme max-[600px]:absolute! max-[600px]:top-0 max-[600px]:right-0
              max-[600px]:size-11! max-[600px]:min-h-11! max-[600px]:p-3!
              max-[600px]:[&_.vs-theme-label]:hidden! max-[600px]:[&_.vs-theme-track]:hidden!"
          />
        </header>
        <div className="login-spacer" aria-hidden="true" />
        {children}
        <div className="login-spacer" aria-hidden="true" />
        <footer className="login-footer flex w-full flex-col items-center gap-1">
          <LoginLink to="/">← Volver al inicio</LoginLink>
          <p className="text-muted [font:var(--type-label)]">Más señas, menos barreras.</p>
        </footer>
      </div>
      <LoginVisual />
    </main>
  );
}
