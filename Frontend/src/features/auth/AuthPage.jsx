import { AuthForm } from './AuthForm.jsx';
import { useAuthForm } from './use-auth-form.js';

/**
 * Conecta formulario provisional y estado de autenticación sin rediseñar Figma.
 * @param {{mode: string}} props login o register.
 * @returns {import('react').ReactElement} Página pública de autenticación.
 */
export function AuthPage({ mode }) {
  const form = useAuthForm(mode);
  return (
    <section>
      <h1>{mode === 'register' ? 'Registro' : 'Iniciar sesión'}</h1>
      <AuthForm mode={mode} {...form} />
    </section>
  );
}
