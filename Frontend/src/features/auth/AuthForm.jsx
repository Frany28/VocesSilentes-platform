import { LoginLink } from './login/LoginLink.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

/**
 * Comparte tarjeta, mensajes y acciones de acceso sin guardar credenciales.
 * @param {object} props Estado y acciones del formulario.
 * @param {'login'|'register'} props.mode Flujo y textos de presentación.
 * @param {boolean} props.pending Petición en curso.
 * @param {object | null} props.feedback Mensaje público de servidor.
 * @param {object} props.fieldErrors Errores locales asociados a campos.
 * @param {number} props.retryIn Segundos restantes de Retry-After.
 * @param {Function} props.onSubmit Envío con validación y exclusión de concurrencia.
 * @param {Function} props.onChange Corrección de errores sin almacenar valores.
 * @param {import('react').ReactNode} props.children Campos propios de cada flujo.
 * @returns {import('react').ReactElement} Formulario accesible en ambos temas.
 */
export function AuthForm({
  mode,
  pending,
  feedback,
  fieldErrors,
  retryIn,
  onSubmit,
  onChange,
  children,
}) {
  const register = mode === 'register';
  const action = register ? 'Crear cuenta' : 'Iniciar sesión';
  const loadingLabel = register ? 'Creando tu cuenta…' : 'Iniciando sesión…';
  const localErrors = Object.values(fieldErrors).filter(Boolean).join(' ');
  return (
    <form
      className="login-card relative flex w-full max-w-full flex-none flex-col gap-8 rounded-3xl
        border border-border bg-surface p-6 shadow-(--login-card-shadow) min-[600px]:w-120 min-[600px]:p-10"
      noValidate
      onSubmit={onSubmit}
      onChange={onChange}
      aria-labelledby={`${mode}-title`}
      aria-describedby={feedback ? `${mode}-result` : undefined}
      aria-busy={pending}
    >
      <div className="login-welcome flex flex-col items-start gap-3">
        <span className="rounded-full bg-tertiary p-2 [font:var(--type-label)]">
          {register ? 'COMIENZA TU CAMINO' : 'APRENDE A CONECTAR'}
        </span>
        <h1
          id={`${mode}-title`}
          className="text-[30px]/[38px] font-bold min-[600px]:[font:var(--type-h1)]"
        >
          {register ? 'Crea tu cuenta' : 'Inicia sesión'}
        </h1>
        <p className="text-base/[26px] text-muted">
          {register
            ? 'Da el primer paso para aprender Lengua de Señas Venezolana.'
            : 'Retoma tu aprendizaje de Lengua de Señas Venezolana.'}
        </p>
      </div>
      {feedback && (
        <Alert
          tone="error"
          title={feedback.title}
          id={`${mode}-result`}
          className="login-feedback w-full!"
        >
          {feedback.message}
        </Alert>
      )}
      <div className="login-fields flex flex-col gap-6">{children}</div>
      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          loading={pending}
          loadingLabel={loadingLabel}
          disabled={retryIn > 0}
          className="w-full! [--size-control:48px]"
        >
          {retryIn > 0 ? `Reintentar en ${retryIn} s` : feedback?.retry ? 'Reintentar' : action}
        </Button>
        <div className="flex flex-col items-center gap-1 py-2 text-muted">
          <p>{register ? '¿Ya tienes una cuenta?' : '¿Aún no tienes una cuenta?'}</p>
          <LoginLink to={register ? '/login' : '/register'}>
            {register ? 'Iniciar sesión' : 'Crear una cuenta'}
          </LoginLink>
        </div>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {pending ? loadingLabel : localErrors}
      </span>
    </form>
  );
}
