import { Dialog } from '../../../components/ui/Dialog.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useAuth } from '../../auth/use-auth.js';
import { accountApi } from '../account.api.js';
import { useAccountOperation } from '../use-account-operation.js';

/**
 * Confirma y elimina la foto privada mediante backend; conserva el diálogo si falla el almacenamiento.
 * @param {{user: object, onClose: Function}} props Cuenta y cierre.
 * @returns {import('react').ReactElement} Confirmación original con guardado real.
 */
export function RemovePhotoDialog({ user, onClose }) {
  const auth = useAuth();
  const operation = useAccountOperation();
  return (
    <Dialog
      title="¿Quitar tu foto?"
      className="account-photo-dialog"
      onClose={onClose}
      pending={operation.pending}
      initialFocus="[data-cancel]"
    >
      <p>Se eliminará la foto de tu perfil y volverán a mostrarse tus iniciales.</p>
      <Avatar user={{ ...user, profileImagePath: null }} large />
      {operation.error && (
        <Alert tone="error" title="No se pudo quitar la foto">
          {operation.error}
        </Alert>
      )}
      <div className="account-actions">
        <Button
          density="compact"
          variant="secondary"
          icon={null}
          onClick={onClose}
          disabled={operation.pending}
          data-cancel
        >
          Conservar foto
        </Button>
        <Button
          density="compact"
          icon={null}
          loading={operation.pending}
          loadingLabel="Quitando…"
          onClick={() =>
            operation.run(accountApi.removePhoto, (saved) => {
              auth.updateUser(saved);
              onClose();
            })
          }
        >
          Quitar foto
        </Button>
      </div>
    </Dialog>
  );
}
