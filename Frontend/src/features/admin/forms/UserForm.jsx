import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert } from '../../../components/ui/Alert.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Dialog } from '../../../components/ui/Dialog.jsx';
import { ConfirmationDialog } from '../../../components/ui/ConfirmationDialog.jsx';
import { useUserDraft } from './use-user-draft.js';
import { UserFields } from './UserFields.jsx';
import { useUserSubmit } from './use-user-submit.js';

/**
 * Modal de identidad con escritura real, errores asociados, doble envío bloqueado y descarte confirmado.
 * @param {{user?: object}} props Cuenta actual para edición; undefined crea una cuenta.
 * @returns {import('react').ReactElement} Formulario compacto según 289:30717/30763.
 */
export function UserForm({ user }) {
  const [confirm, setConfirm] = useState(false);
  const operation = useUserSubmit(user);
  const { values, dirty, change } = useUserDraft(user, operation.pending);
  const navigate = useNavigate();
  const leave = () =>
    navigate(user ? `/admin/users/${user.id}` : '/admin/users', {
      state: { focusAction: user ? 'edit' : 'create' },
    });
  const cancel = () => {
    if (!operation.pending) {
      if (dirty) setConfirm(true);
      else leave();
    }
  };
  return (
    <>
      <Dialog
        title={user ? 'Editar cuenta' : 'Crear usuario'}
        onClose={cancel}
        pending={operation.pending}
        initialFocus='input[name="firstName"]'
      >
        <p className="admin-muted">Completa la identidad y los datos de acceso.</p>
        <form
          className="admin-form"
          noValidate
          onSubmit={(event) => operation.submit(event, values)}
        >
          {operation.error && (
            <Alert
              title={user ? 'No se pudo actualizar la cuenta' : 'No se pudo crear la cuenta'}
              tone="error"
            >
              {operation.error} Los datos del formulario se conservaron.
            </Alert>
          )}
          {Object.keys(operation.errors).length > 0 && (
            <Alert title="Revisa los campos indicados" tone="error">
              Hay {Object.keys(operation.errors).length} campos por corregir.
            </Alert>
          )}
          <fieldset disabled={operation.pending} aria-busy={operation.pending}>
            <UserFields
              values={values}
              errors={operation.errors}
              creating={!user}
              change={change}
            />
            <p className="admin-demo-note">
              {user
                ? 'Cambiar el correo lo deja pendiente de verificación.'
                : 'El correo queda pendiente de verificación.'}
            </p>
            <div className="admin-actions">
              <Button
                density="compact"
                type="submit"
                icon={null}
                loading={operation.pending}
                loadingLabel={user ? 'Guardando…' : 'Creando usuario…'}
              >
                {user ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
              <Button
                density="compact"
                variant="secondary"
                icon={null}
                disabled={operation.pending}
                onClick={cancel}
              >
                Cancelar
              </Button>
            </div>
          </fieldset>
        </form>
      </Dialog>
      {confirm && (
        <ConfirmationDialog
          title="¿Descartar los cambios?"
          confirm="Descartar cambios"
          onConfirm={leave}
          onCancel={() => setConfirm(false)}
        >
          Los datos que no has guardado se perderán.
        </ConfirmationDialog>
      )}
    </>
  );
}
