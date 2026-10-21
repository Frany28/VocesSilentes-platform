import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { useUserDelete } from '../data/use-user-delete.js';
import { AdminConfirmation } from './AdminConfirmation.jsx';

/**
 * Confirma explícitamente la eliminación lógica y explica la revocación del acceso.
 * @param {{user: object}} props Cuenta real; el backend conserva la decisión de autorización.
 * @returns {import('react').ReactElement} Acción y diálogo con estado pendiente/error.
 */
export function UserDeleteAction({ user }) {
  const [confirm, setConfirm] = useState(false);
  const deletion = useUserDelete(user);
  return (
    <div className="admin-state-action">
      <Button
        variant="secondary"
        icon={null}
        disabled={user.isDeleted}
        onClick={() => setConfirm(true)}
      >
        Eliminar cuenta
      </Button>
      {confirm && (
        <AdminConfirmation
          title="¿Eliminar esta cuenta?"
          confirm="Confirmar eliminación"
          onConfirm={deletion.remove}
          onCancel={() => setConfirm(false)}
          pending={deletion.pending}
          error={deletion.error}
        >
          Se revocarán sus sesiones y se impedirá su acceso. Sus datos relacionados se conservarán.
        </AdminConfirmation>
      )}
    </div>
  );
}
