import { AuthLayout } from '../AuthLayout.jsx';
import { useAuthForm } from '../use-auth-form.js';
import { LoginForm } from './LoginForm.jsx';

/**
 * Presenta una composición adaptable de Auth con el flujo real de sesión.
 * @returns {import('react').ReactElement} Inicio de sesión público en ambos temas.
 */
export function LoginPage() {
  const form = useAuthForm('login');
  return (
    <AuthLayout {...form}>
      <LoginForm {...form} />
    </AuthLayout>
  );
}
