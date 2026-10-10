import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert } from '../../../components/ui/Alert.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { AdminFacts } from '../components/AdminFacts.jsx';
import { AdminConfirmation } from '../components/AdminConfirmation.jsx';
import { UserFormHeader } from './UserFormHeader.jsx';
import { useUserDraft } from './use-user-draft.js';
import { UserFields } from './UserFields.jsx';
import { useUserSubmit } from './use-user-submit.js';

/**
 * Formulario de identidad; mantiene contraseña solo en memoria y confirma cancelación de cambios.
 * @param {{user?: object}} props Cuenta consultada para editar; undefined para crear.
 * @returns {import('react').ReactElement} Formulario con errores, carga, cancelación y estados reales.
 */
export function UserForm({ user }) {
  const [confirm, setConfirm] = useState(false);
  const operation = useUserSubmit(user);
  const { values, dirty, change } = useUserDraft(user, operation.pending);
  const navigate = useNavigate();
  const leave = () => navigate(user ? `/admin/users/${user.id}` : '/admin/users');
  return (
    <form
      className="admin-panel admin-form"
      noValidate
      onSubmit={(event) => operation.submit(event, values)}
    >
      <UserFormHeader user={user} values={values} />
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
          Corrige los datos antes de enviar.
        </Alert>
      )}
      <fieldset disabled={operation.pending} aria-busy={operation.pending}>
        <UserFields values={values} errors={operation.errors} creating={!user} change={change} />
        {user ? (
          <AdminFacts
            items={[
              [
                'Verificación del correo',
                user.emailVerified
                  ? 'Verificado; cambiar el correo lo deja pendiente.'
                  : 'Pendiente de verificación',
              ],
              ['Método de acceso', 'Correo y contraseña'],
            ]}
          />
        ) : (
          <p className="admin-demo-note">El correo queda pendiente de verificación.</p>
        )}
        <div className="admin-actions">
          <Button
            type="submit"
            icon={user ? null : undefined}
            loading={operation.pending}
            loadingLabel={user ? 'Guardando…' : 'Creando usuario…'}
          >
            {user ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
          <Button
            variant="secondary"
            icon={user ? null : undefined}
            disabled={operation.pending}
            onClick={() => (dirty ? setConfirm(true) : leave())}
          >
            Cancelar
          </Button>
        </div>
      </fieldset>
      {confirm && (
        <AdminConfirmation
          title="¿Descartar los cambios?"
          confirm="Descartar cambios"
          onConfirm={leave}
          onCancel={() => setConfirm(false)}
        >
          Los datos que no has guardado se perderán.
        </AdminConfirmation>
      )}
    </form>
  );
}
