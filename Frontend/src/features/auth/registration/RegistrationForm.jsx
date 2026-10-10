import { AuthForm } from '../AuthForm.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { PasswordInput } from '../../../components/ui/PasswordInput.jsx';

/**
 * Presenta solo los campos admitidos por POST /auth/register, con los controles de login.
 * maxLength permite 200 unidades UTF-16; la validación limita los nombres a 100 puntos de código.
 * @param {object} props Estado y acciones de useAuthForm.
 * @param {boolean} props.pending Petición en curso.
 * @param {object} props.fieldErrors Errores locales por campo.
 * @returns {import('react').ReactElement} Registro accesible sin almacenar credenciales.
 */
export function RegistrationForm({ pending, fieldErrors, ...actions }) {
  return (
    <AuthForm mode="register" pending={pending} fieldErrors={fieldErrors} {...actions}>
      <Input
        appearance="plain"
        id="register-first-name"
        name="firstName"
        label="Nombre"
        autoComplete="given-name"
        placeholder="Tu nombre"
        required
        maxLength={200}
        disabled={pending}
        error={fieldErrors.firstName}
      />
      <Input
        appearance="plain"
        id="register-last-name"
        name="lastName"
        label="Apellido (opcional)"
        autoComplete="family-name"
        placeholder="Tu apellido"
        maxLength={200}
        disabled={pending}
        error={fieldErrors.lastName}
      />
      <Input
        appearance="plain"
        id="register-username"
        name="username"
        label="Nombre de usuario"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="tu_usuario"
        help="De 3 a 50 letras (a–z), números o guiones bajos."
        required
        maxLength={50}
        disabled={pending}
        error={fieldErrors.username}
      />
      <Input
        appearance="plain"
        id="register-email"
        name="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
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
        id="register-password"
        name="password"
        label="Contraseña"
        autoComplete="new-password"
        placeholder="Crea tu contraseña"
        help="De 15 a 128 caracteres, hasta 512 bytes. Puedes usar espacios y un gestor de contraseñas."
        required
        disabled={pending}
        error={fieldErrors.password}
      />
    </AuthForm>
  );
}
