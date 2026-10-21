import { useLocation } from 'react-router';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
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
  const field = (name, label, help, attributes = {}) => (
    <Input
      appearance="plain"
      name={name}
      label={label}
      value={values[name]}
      help={help}
      error={operation.errors[name]}
      onChange={change}
      {...attributes}
    />
  );
  return (
    <form className="admin-form" noValidate onSubmit={(event) => operation.submit(event, values)}>
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
        <div className="admin-name-row">
          {field('firstName', 'Nombre', undefined, {
            required: true,
            maxLength: 100,
            autoComplete: 'given-name',
          })}
          {field('lastName', 'Apellido (opcional)', undefined, {
            maxLength: 100,
            autoComplete: 'family-name',
          })}
        </div>
        <div className="admin-profile-contact">
          {field(
            'username',
            'Nombre de usuario',
            'Tu identificador: letras, números o guiones bajos.',
            { required: true, maxLength: 50, autoComplete: 'username' },
          )}
          {field('email', 'Correo de acceso', 'Usado para acceder a tu cuenta.', {
            type: 'email',
            required: true,
            maxLength: 254,
            autoComplete: 'email',
          })}
        </div>
        <div className="admin-profile-role">
          <Icon name="modern-profile" size={20} />
          <div>
            <p>Rol · Administrador</p>
            <p className="admin-demo-note">Tu rol no se modifica desde el perfil.</p>
          </div>
        </div>
        <div className="admin-profile-submit">
          <p className="admin-demo-note">Revisa tus datos antes de guardar.</p>
          <Button
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
