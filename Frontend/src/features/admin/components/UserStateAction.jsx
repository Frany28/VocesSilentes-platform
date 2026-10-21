import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { AdminConfirmation } from './AdminConfirmation.jsx';
import { AdminAvatar } from './AdminAvatar.jsx';
import { fullName } from '../data/admin-labels.js';

/**
 * Presenta el modal diseñado sin confundir isActive con eliminación lógica ni enviar un PATCH no soportado.
 * @param {{user: object}} props Cuenta actual.
 * @returns {import('react').ReactElement} Confirmación con dependencia y mutación deshabilitada.
 */
export function UserStateAction({ user }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="admin-state-action">
      <Button
        variant="secondary"
        icon={null}
        className="admin-danger"
        onClick={() => setConfirm(true)}
      >
        {user.isActive ? 'Desactivar cuenta' : 'Reactivar cuenta'}
      </Button>
      {confirm && (
        <AdminConfirmation
          title={user.isActive ? '¿Desactivar esta cuenta?' : '¿Reactivar esta cuenta?'}
          confirm={user.isActive ? 'Desactivar cuenta' : 'Reactivar cuenta'}
          disabled
          danger
          onConfirm={() => {}}
          onCancel={() => setConfirm(false)}
        >
          <div className="admin-page">
            <p>
              {user.isActive
                ? `${fullName(user)} no podrá iniciar sesión. Sus datos y progreso se conservarán.`
                : 'La cuenta podrá volver a iniciar sesión.'}
            </p>
            <div className="admin-user-banner">
              <AdminAvatar user={user} />
              <div>
                <strong>{fullName(user)}</strong>
                <p>{user.email}</p>
              </div>
            </div>
            <p>
              Acción no disponible: el backend todavía no permite cambiar el estado de una cuenta.
            </p>
          </div>
        </AdminConfirmation>
      )}
    </div>
  );
}
