import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { fullName } from '../data/admin-labels.js';
import { useUserState } from '../data/use-user-state.js';

/**
 * Confirma reactivación/desactivación real en el diálogo original.
 * @param {{user: object, onSaved: Function}} props Cuenta actual y recarga del detalle.
 * @returns {import('react').ReactElement} Confirmación con estado pendiente y errores de permisos.
 */
export function UserStateAction({ user, onSaved }) {
  const [confirm, setConfirm] = useState(false);
  const operation = useUserState(user, onSaved);
  return (
    <div className="admin-state-action">
      <Button
        density="compact"
        variant="secondary"
        icon={null}
        className="admin-danger"
        onClick={() => setConfirm(true)}
      >
        {user.isActive ? 'Desactivar cuenta' : 'Reactivar cuenta'}
      </Button>
      {confirm && (
        <ConfirmationDialog
          title={user.isActive ? '¿Desactivar esta cuenta?' : '¿Reactivar esta cuenta?'}
          confirm={user.isActive ? 'Desactivar cuenta' : 'Reactivar cuenta'}
          pending={operation.pending}
          error={operation.error}
          danger
          onConfirm={() => operation.change(() => setConfirm(false))}
          onCancel={() => setConfirm(false)}
        >
          <div className="admin-page">
            <p>
              {user.isActive
                ? `${fullName(user)} no podrá iniciar sesión. Sus datos y progreso se conservarán.`
                : 'La cuenta podrá volver a iniciar sesión.'}
            </p>
            <div className="admin-user-banner">
              <Avatar user={user} />
              <div>
                <strong>{fullName(user)}</strong>
                <p>{user.email}</p>
              </div>
            </div>
          </div>
        </ConfirmationDialog>
      )}
    </div>
  );
}
