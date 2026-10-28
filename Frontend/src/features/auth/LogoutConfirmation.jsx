import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog.jsx';
import { useAuth } from './use-auth.js';

/**
 * Reutiliza la confirmación existente de Admin para cada entrada de cierre de sesión.
 * @param {{operation: object}} props Estado y acciones de useLogout del consumidor.
 * @returns {import('react').ReactElement | null} Modal con cancelación inicial o ninguna vista.
 */
export function LogoutConfirmation({ operation }) {
  const { user } = useAuth();
  if (!operation.confirm) return null;
  return (
    <ConfirmationDialog
      title="¿Cerrar sesión?"
      confirm="Cerrar sesión"
      pending={operation.pending}
      error={operation.error}
      onCancel={operation.cancel}
      onConfirm={operation.logout}
    >
      Tendrás que iniciar sesión para volver{' '}
      {user.role === 'ADMIN' ? 'al panel de administración' : 'a tu aprendizaje'}.
    </ConfirmationDialog>
  );
}
