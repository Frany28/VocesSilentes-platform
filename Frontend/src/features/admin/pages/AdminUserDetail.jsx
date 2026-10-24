import { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useAdminUser } from '../data/use-admin-user.js';
import { fullName } from '../data/admin-labels.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminAction } from '../components/AdminAction.jsx';
import { IconAction } from '../../../components/ui/IconAction.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AccountStatus } from '../components/AccountStatus.jsx';
import { UserAccountData } from '../components/UserAccountData.jsx';
import { UserStateAction } from '../components/UserStateAction.jsx';
import { UserDeleteAction } from '../components/UserDeleteAction.jsx';

/**
 * Detalle actual de una cuenta: identidad, acceso y seguridad; conserva borrado lógico real.
 * @returns {import('react').ReactElement} Vista adaptable con edición modal y vuelta por icono.
 */
export function AdminUserDetail() {
  const { id } = useParams();
  const result = useAdminUser(id);
  const { state } = useLocation();
  const page = useRef();
  const user = result.user;
  useEffect(() => {
    if (state?.focusAction === 'edit' && result.status === 'ready')
      page.current.querySelector('[data-admin-to]')?.focus();
  }, [state, result.status]);
  return (
    <div className="admin-page" ref={page}>
      <div className="admin-title-row">
        <IconAction to="/admin/users" icon="back" label="Volver a usuarios" />
        <AdminHeading title="Detalle de usuario">
          Identidad, acceso y actividad de la cuenta.
        </AdminHeading>
        {user && !user.isDeleted && (
          <AdminAction to={`/admin/users/${id}/edit`} variant="primary">
            Editar cuenta
          </AdminAction>
        )}
      </div>
      {result.status !== 'ready' ? (
        <AdminFeedback
          status={result.status}
          error={result.error}
          retry={result.retry}
          noun="la cuenta"
        />
      ) : (
        <>
          {state?.message && (
            <Alert tone="success" title="Información de la cuenta">
              {state.message}
            </Alert>
          )}
          <section className="admin-panel">
            <div className="admin-user-banner">
              <Avatar user={user} />
              <div>
                <h2>{fullName(user)}</h2>
                <p className="admin-muted">{user.email}</p>
                <AccountStatus user={user} />
              </div>
            </div>
          </section>
          <UserAccountData user={user} />
          {!user.isDeleted && (
            <>
              <UserStateAction user={user} onSaved={result.retry} />
              <details className="admin-demo-note">
                <summary>Otras acciones de cuenta</summary>
                <UserDeleteAction user={user} />
              </details>
            </>
          )}
        </>
      )}
    </div>
  );
}
