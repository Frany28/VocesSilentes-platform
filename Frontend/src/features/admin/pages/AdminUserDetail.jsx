import { useLocation, useParams } from 'react-router';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useAdminUser } from '../data/use-admin-user.js';
import { adminDate, fullName } from '../data/admin-labels.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminAction } from '../components/AdminAction.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AccountStatus } from '../components/AccountStatus.jsx';
import { UserAccountData } from '../components/UserAccountData.jsx';
import { UserStateAction } from '../components/UserStateAction.jsx';

/**
 * Detalle real por UUID o demo identificada; cambios de estado solo se simulan en cuentas demo.
 * @returns {import('react').ReactElement} Información permitida y acciones del diseño.
 */
export function AdminUserDetail() {
  const { id } = useParams();
  const result = useAdminUser(id);
  const { state } = useLocation();
  const user = result.user;
  return (
    <div className="admin-page">
      <AdminHeading title="Detalle de usuario">
        Información de la cuenta y acciones de administración.
      </AdminHeading>
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
            <Alert tone="info" title="Información de la cuenta">
              {state.message}
            </Alert>
          )}
          <p className="admin-demo-note">
            {user.source === 'server'
              ? 'Cuenta real: información consultada al servidor.'
              : 'Cuenta de demostración. Sus cambios solo afectan esta vista y se reinician al recargar.'}
          </p>
          <section className="admin-panel">
            <p className="admin-kicker">CUENTA / {user.role === 'ADMIN' ? 'ADMIN' : 'USUARIO'}</p>
            <h2>{fullName(user)}</h2>
            <p className="admin-muted">{user.email}</p>
            <AccountStatus user={user} />
            <p className="admin-muted">Registro · {adminDate(user.createdAt)}</p>
            <p>Rol de acceso · {user.role === 'ADMIN' ? 'Admin' : 'Usuario'}</p>
            <div className="admin-avatar-line">
              <span className="admin-avatar">
                {user.firstName.slice(0, 1)}
                {user.lastName?.slice(0, 1)}
              </span>
              <p className="admin-demo-note">Avatar por defecto · Sin foto de perfil</p>
            </div>
            <UserAccountData user={user} />
            <div className="admin-actions">
              <AdminAction to={`/admin/users/${id}/edit`} variant="primary">
                Editar cuenta
              </AdminAction>
              <UserStateAction user={user} />
            </div>
          </section>
          <section className="admin-panel admin-info">
            <p>Un acceso claro para cada persona</p>
            <p className="admin-muted">
              El rol Usuario permite aprender y practicar. El rol Admin permite gestionar cuentas y
              revisar reportes.
            </p>
          </section>
        </>
      )}
      <AdminAction to="/admin/users">Volver a usuarios</AdminAction>
    </div>
  );
}
