import { Link } from 'react-router';

/**
 * Presenta controles accesibles sin hacer peticiones ni guardar credenciales.
 * @param {{mode: string, pending: boolean, error: string, onSubmit: Function}} props Contrato del formulario.
 * @returns {import('react').ReactElement} Formulario mínimo provisional.
 */
export function AuthForm({ mode, pending, error, onSubmit }) {
  const register = mode === 'register';
  return (
    <form onSubmit={onSubmit} aria-describedby={error ? 'auth-error' : undefined}>
      <fieldset disabled={pending}>
        <legend>{register ? 'Crear cuenta' : 'Iniciar sesión'}</legend>
        {register && (
          <>
            <p>
              <label>
                Nombre <input name="firstName" autoComplete="given-name" required maxLength={100} />
              </label>
            </p>
            <p>
              <label>
                Apellido (opcional){' '}
                <input name="lastName" autoComplete="family-name" maxLength={100} />
              </label>
            </p>
            <p>
              <label>
                Nombre de usuario{' '}
                <input name="username" autoComplete="username" required maxLength={50} />
              </label>
            </p>
          </>
        )}
        <p>
          <label>
            Correo <input name="email" type="email" autoComplete="email" required maxLength={254} />
          </label>
        </p>
        <p>
          <label>
            Contraseña{' '}
            <input
              name="password"
              type="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              required
              maxLength={256}
              aria-describedby={register ? 'password-policy' : undefined}
            />
          </label>
        </p>
        {register && (
          <p id="password-policy">
            De 15 a 128 caracteres. Puedes usar espacios y un gestor de contraseñas.
          </p>
        )}
        <button type="submit">
          {pending ? 'Procesando…' : register ? 'Registrarme' : 'Entrar'}
        </button>
      </fieldset>
      {error && (
        <p id="auth-error" role="alert">
          {error}
        </p>
      )}
      <p>
        <Link to={register ? '/login' : '/register'}>
          {register ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
        </Link>
      </p>
    </form>
  );
}
