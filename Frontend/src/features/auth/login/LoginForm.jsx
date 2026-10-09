import { LoginLink } from './LoginLink.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { PasswordInput } from '../../../components/ui/PasswordInput.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';

/**
 * Compone los controles generales sin peticiones ni estado de credenciales.
 * @param {object} props Estado y acciones de useAuthForm.
 * @param {boolean} props.pending Petición en curso.
 * @param {object | null} props.feedback Mensaje de servidor controlado.
 * @param {object} props.fieldErrors Errores locales asociados a campos.
 * @param {number} props.retryIn Segundos restantes de Retry-After.
 * @param {Function} props.onSubmit Envío con validación y exclusión de concurrencia.
 * @param {Function} props.onChange Corrección de errores sin almacenar los valores.
 * @returns {import('react').ReactElement} Formulario accesible y variantes de Figma.
 */
export function LoginForm({ pending, feedback, fieldErrors, retryIn, onSubmit, onChange }) {
  const localErrors = Object.values(fieldErrors).filter(Boolean).join(' ');
  return (
    <form
      className="login-card relative flex w-full max-w-full flex-none flex-col gap-8 rounded-3xl
        border border-border bg-surface p-6 shadow-(--login-card-shadow) min-[600px]:w-120 min-[600px]:p-10"
      noValidate
      onSubmit={onSubmit}
      onChange={onChange}
      aria-labelledby="login-title"
      aria-describedby={feedback ? 'login-result' : undefined}
      aria-busy={pending}
    >
      <div className="login-welcome flex flex-col items-start gap-3">
        <span className="rounded-full bg-tertiary p-2 [font:var(--type-label)]">
          APRENDE A CONECTAR
        </span>
        <h1
          id="login-title"
          className="text-[30px]/[38px] font-bold min-[600px]:[font:var(--type-h1)]"
        >
          Inicia sesión
        </h1>
        <p className="text-base/[26px] text-muted">
          Retoma tu aprendizaje de Lengua de Señas Venezolana.
        </p>
      </div>
      {feedback && (
        <Alert
          tone="error"
          title={feedback.title}
          id="login-result"
          className="login-feedback w-full!"
        >
          {feedback.message}
        </Alert>
      )}
      <div className="login-fields flex flex-col gap-6">
        <Input
          appearance="plain"
          id="login-email"
          name="email"
          label="Correo electrónico"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="tu@correo.com"
          required
          maxLength={254}
          disabled={pending}
          error={fieldErrors.email}
        />
        <PasswordInput
          appearance="plain"
          id="login-password"
          name="password"
          label="Contraseña"
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña"
          required
          disabled={pending}
          error={fieldErrors.password}
        />
      </div>
      <div className="flex flex-col gap-4">
        <Button
          type="submit"
          loading={pending}
          loadingLabel="Iniciando sesión…"
          disabled={retryIn > 0}
          className="w-full! [--size-control:48px]"
        >
          {retryIn > 0
            ? `Reintentar en ${retryIn} s`
            : feedback?.retry
              ? 'Reintentar'
              : 'Iniciar sesión'}
        </Button>
        <div className="flex flex-col items-center gap-1 py-2 text-muted">
          <p>¿Aún no tienes una cuenta?</p>
          <LoginLink to="/register">Crear una cuenta</LoginLink>
        </div>
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {pending ? 'Iniciando sesión…' : localErrors}
      </span>
    </form>
  );
}
