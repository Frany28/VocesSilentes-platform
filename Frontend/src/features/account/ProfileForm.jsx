import { useState } from 'react';
import { useAuth } from '../auth/use-auth.js';
import { ProfileFields } from './ProfileFields.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { validateRegistration } from '../auth/registration/registration-validation.js';
import { accountApi } from './account.api.js';
import { useAccountOperation } from './use-account-operation.js';

/**
 * Edita identidad propia de ambos roles; el servidor determina el usuario y conserva sus permisos.
 * @param {{user: object}} props Identidad autenticada.
 * @returns {import('react').ReactElement} Formulario existente con guardado real y errores recuperables.
 */
export function ProfileForm({ user }) {
  const auth = useAuth();
  const [values, setValues] = useState(user);
  const [errors, setErrors] = useState({});
  const operation = useAccountOperation();
  const payload = (value) => {
    return {
      firstName: value.firstName.trim(),
      lastName: value.lastName?.trim() || null,
      username: value.username.trim().toLowerCase(),
      email: value.email.trim().toLowerCase(),
    };
  };
  const dirty = JSON.stringify(payload(values)) !== JSON.stringify(payload(user));
  const submit = (event) => {
    event.preventDefault();
    const invalid = validateRegistration(values);
    delete invalid.password;
    setErrors(invalid);
    if (Object.keys(invalid).length) return;
    operation.run(
      (signal) => accountApi.profile(payload(values), signal),
      (saved) => {
        setValues(saved);
        auth.updateUser(saved);
      },
    );
  };
  return (
    <form className="account-form" onSubmit={submit} noValidate>
      <h2>Lo que te hace tú</h2>
      <p className="account-muted">
        Mantén tus datos al día y personaliza cómo se muestra tu cuenta.
      </p>
      <fieldset disabled={operation.pending}>
        <ProfileFields
          values={values}
          role={user.role}
          errors={errors}
          onChange={(event) => setValues({ ...values, [event.target.name]: event.target.value })}
        />
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
    </form>
  );
}
