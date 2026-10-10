import { AuthLayout } from '../AuthLayout.jsx';
import { useAuthForm } from '../use-auth-form.js';
import { RegistrationForm } from './RegistrationForm.jsx';

/**
 * Presenta el registro con la composición de login y el servicio existente.
 * @returns {import('react').ReactElement} Registro público adaptable.
 */
export function RegistrationPage() {
  const form = useAuthForm('register');
  return (
    <AuthLayout {...form}>
      <RegistrationForm {...form} />
    </AuthLayout>
  );
}
