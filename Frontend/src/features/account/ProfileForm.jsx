import { ProfileFields } from './ProfileFields.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { useProfileForm } from './use-profile-form.js';
import { useDraftLeave } from '../../hooks/use-draft-leave.js';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog.jsx';

/**
 * Edita identidad propia de Student; el servidor determina el usuario y conserva sus permisos.
 * @param {{user: object}} props Identidad autenticada.
 * @returns {import('react').ReactElement} Formulario existente con guardado real y errores recuperables.
 */
export function ProfileForm({ user }) {
  const { values, errors, operation, dirty, submit, change } = useProfileForm(user);
  const leave = useDraftLeave(dirty, operation.pending, '/student');
  return (
    <form className="account-form" onSubmit={submit} noValidate>
      <h2>Lo que te hace tú</h2>
      <p className="account-muted">
        Mantén tus datos al día y personaliza cómo se muestra tu cuenta.
      </p>
      {Object.keys(errors).length > 0 && (
        <Alert tone="error" title="Revisa los campos indicados">
          Corrige los datos antes de guardar.
        </Alert>
      )}
      <fieldset disabled={operation.pending}>
        <ProfileFields values={values} role={user.role} errors={errors} onChange={change} />
      </fieldset>
      <p className="account-caption">
        {user.emailVerified ? 'Correo verificado' : 'Correo pendiente de verificación'}
      </p>
      {operation.error && (
        <Alert tone="error" title="No se pudo guardar">
          {operation.error}
        </Alert>
      )}
      {operation.success && (
        <Alert tone="success" title="Cambios guardados">
          Tus datos se actualizaron.
        </Alert>
      )}
      <div className="account-profile-submit">
        <p className="account-caption">Revisa tus datos antes de guardar.</p>
        <Button
          density="compact"
          type="submit"
          icon={null}
          disabled={!dirty}
          loading={operation.pending}
          loadingLabel="Guardando…"
        >
          Guardar cambios
        </Button>
      </div>
      {leave.confirm && (
        <ConfirmationDialog
          title="¿Descartar los cambios?"
          confirm="Descartar cambios"
          pending={operation.pending}
          onCancel={leave.cancel}
          onConfirm={leave.proceed}
        >
          Los datos que no has guardado se perderán al cambiar de pantalla.
        </ConfirmationDialog>
      )}
    </form>
  );
}
