import { AuthForm } from '../AuthForm.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { PasswordInput } from '../../../components/ui/PasswordInput.jsx';

/**
 * Compone los campos de login sin peticiones ni estado de credenciales.
 * @param {object} props Estado y acciones de useAuthForm.
 * @param {boolean} props.pending Petición en curso.
 * @param {object} props.fieldErrors Errores locales asociados a campos.
 * @returns {import('react').ReactElement} Formulario accesible de inicio de sesión.
 */
export function LoginForm({ pending, fieldErrors, ...actions }) {
  return (
    <AuthForm mode="login" pending={pending} fieldErrors={fieldErrors} {...actions}>
      <Input
        appearance="plain"
        id="login-email"
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="Ingresa tu correo electrónico"
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
    </AuthForm>
  );
}
