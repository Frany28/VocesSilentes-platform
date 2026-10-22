import { useLocation } from 'react-router';
import { ProfileFields } from '../../account/ProfileFields.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useUserDraft } from '../forms/use-user-draft.js';
import { useUserSubmit } from '../forms/use-user-submit.js';

/**
 * Edita identidad propia usando el PATCH ADMIN existente, conservando rol, CSRF y refresh de sesión.
 * @param {{user: object}} props Usuario autenticado; no se acepta otro ID desde el formulario.
 * @returns {import('react').ReactElement} Perfil con validación y éxito solo tras respuesta confirmada.
 */
export function AdminProfileForm({ user }) {
  const operation = useUserSubmit(user, { profile: true });
  const { values, dirty, change } = useUserDraft(user, operation.pending);
  const { state } = useLocation();
  return (
    <form className="account-form" noValidate onSubmit={(event) => operation.submit(event, values)}>
      <h2>Lo que te hace tú</h2>
      <p className="admin-muted">
        Mantén tus datos al día y personaliza cómo se muestra tu cuenta.
      </p>
      {state?.message && (
        <Alert tone="success" title="Cambios guardados">
          {state.message}
        </Alert>
      )}
      {operation.error && (
        <Alert tone="error" title="No se pudo guardar">
          {operation.error}
        </Alert>
      )}
      {Object.keys(operation.errors).length > 0 && (
        <Alert tone="error" title="Revisa los campos indicados">
          Corrige los datos antes de guardar.
        </Alert>
      )}
      <fieldset disabled={operation.pending}>
        <ProfileFields
          values={values}
          role={user.role}
          errors={operation.errors}
          onChange={change}
        />
        <div className="account-profile-submit">
          <p className="admin-demo-note">Revisa tus datos antes de guardar.</p>
          <Button
            density="compact"
            type="submit"
            icon={null}
            loading={operation.pending}
            loadingLabel="Guardando…"
            disabled={!dirty}
          >
            Guardar cambios
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
