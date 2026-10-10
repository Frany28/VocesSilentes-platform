import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useAdmin } from '../data/admin-context.js';
import { AdminConfirmation } from './AdminConfirmation.jsx';
/**
 * Simula cambio de estado exclusivamente para demos; cuentas reales muestran integración pendiente.
 * @param {{user: object}} props Cuenta y procedencia.
 * @returns {import('react').ReactElement} Acción, confirmación y aviso sin falsa persistencia.
 */
export function UserStateAction({ user }) {
  const { demoAction } = useAdmin();
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState(null);
  const demo = user.source === 'demo';
  const change = () => {
    if (demo) demoAction('users', user.id, { isActive: !user.isActive });
    setNotice(
      demo
        ? 'Demostración: estado cambiado en memoria; no se guardó en la base de datos.'
        : 'El cambio de estado requiere un backend futuro. La cuenta real conserva su estado.',
    );
    setConfirm(false);
  };
  return (
    <div className="admin-state-action">
      <Button variant="secondary" icon={null} onClick={() => setConfirm(true)}>
        {user.isActive ? 'Desactivar cuenta' : 'Reactivar cuenta'}
      </Button>
      {notice && (
        <Alert tone="info" title="Estado de la cuenta">
          {notice}
        </Alert>
      )}
      {confirm && (
        <AdminConfirmation
          title={
            demo
              ? `¿${user.isActive ? 'Desactivar' : 'Reactivar'} esta cuenta de demostración?`
              : 'Cambio de estado pendiente de integración'
          }
          confirm={demo ? 'Aplicar demostración' : 'Entendido'}
          onConfirm={change}
          onCancel={() => setConfirm(false)}
        >
          {demo
            ? 'La simulación cambia el estado solo en memoria. No modifica accesos ni cuentas en la base de datos.'
            : 'Esta función requiere un backend futuro. No se enviará ninguna modificación de estado al servidor.'}
        </AdminConfirmation>
      )}
    </div>
  );
}
