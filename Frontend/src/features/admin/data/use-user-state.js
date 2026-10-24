import { useAuth } from '../../auth/use-auth.js';
import { useAdmin } from './admin-context.js';
import { useAccountOperation } from '../../account/use-account-operation.js';

/**
 * Confirma el estado persistido y actualiza detalle/sesión; no confunde desactivación con borrado.
 * @param {object} user Cuenta seleccionada.
 * @param {Function} onSaved Recarga del detalle tras confirmar la escritura.
 * @returns {object} Estado de operación y cambio idempotente.
 */
export function useUserState(user, onSaved) {
  const { api } = useAdmin();
  const auth = useAuth();
  const operation = useAccountOperation();
  return {
    ...operation,
    change: (done) =>
      operation.run(
        (signal) => api.state(user.id, !user.isActive, signal),
        (saved) => {
          done();
          if (saved.id === auth.user.id) auth.refresh();
          else onSaved();
        },
      ),
  };
}
