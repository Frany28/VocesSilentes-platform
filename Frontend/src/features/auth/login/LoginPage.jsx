import { ThemeToggle } from '../../../components/ui/ThemeToggle.jsx';
import { useAuthForm } from '../use-auth-form.js';
import { LoginForm } from './LoginForm.jsx';
import { LoginBrand } from './LoginBrand.jsx';
import { LoginVisual } from './LoginVisual.jsx';
import { LoginLink } from './LoginLink.jsx';
import './login.css';

/**
 * Presenta una composición adaptable de Auth con el flujo real de sesión.
 * @returns {import('react').ReactElement} Inicio de sesión público en ambos temas.
 */
export function LoginPage() {
  const form = useAuthForm('login');
  const hasErrors = Boolean(form.feedback) || Object.values(form.fieldErrors).some(Boolean);
  return (
    <main
      id="main-content"
      className="login-page relative isolate flex min-h-[max(920px,100svh)] flex-col gap-6
        overflow-clip p-6 text-content [font:var(--type-secondary)] [overflow-wrap:anywhere]
        data-[state=error]:min-h-[max(1120px,100svh)]
        min-[600px]:min-h-[max(1100px,100svh)] min-[600px]:p-8
        min-[600px]:data-[state=error]:min-h-[max(1300px,100svh)]
        min-[1200px]:min-h-[max(960px,100svh)] min-[1200px]:flex-row min-[1200px]:p-6
        min-[1200px]:data-[state=error]:min-h-[max(1160px,100svh)]"
      data-state={hasErrors ? 'error' : form.pending ? 'loading' : 'initial'}
    >
      <div className="login-access relative flex min-w-0 flex-1 flex-col items-center gap-6 min-[1200px]:p-6">
        <header className="login-header relative flex w-full items-center justify-between gap-4">
          <LoginBrand />
          <ThemeToggle
            className="login-theme max-[600px]:absolute! max-[600px]:top-0 max-[600px]:right-0
              max-[600px]:size-11! max-[600px]:min-h-11! max-[600px]:p-3!
              max-[600px]:[&_.vs-theme-label]:hidden! max-[600px]:[&_.vs-theme-track]:hidden!"
          />
        </header>
        <div className="min-h-0 flex-1" aria-hidden="true" />
        <LoginForm {...form} />
        <div className="min-h-0 flex-1" aria-hidden="true" />
        <footer className="login-footer flex w-full flex-col items-center gap-3">
          <LoginLink to="/">← Volver al inicio</LoginLink>
          <p className="text-muted [font:var(--type-label)]">Más señas, menos barreras.</p>
        </footer>
      </div>
      <LoginVisual />
    </main>
  );
}
