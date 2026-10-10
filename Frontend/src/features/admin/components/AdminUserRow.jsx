import { Icon } from '../../../components/ui/Icon.jsx';
import { AccountStatus } from './AccountStatus.jsx';
import { AdminAction } from './AdminAction.jsx';
import { adminDate, fullName } from '../data/admin-labels.js';
/**
 * Cuenta del listado; indica procedencia y permite abrir detalle real por UUID o demo.
 * @param {{user: object, card?: boolean}} props Cuenta y composición de resumen.
 * @returns {import('react').ReactElement} Fila que se apila en tablet/móvil.
 */
export function AdminUserRow({ user, card = false }) {
  return (
    <article className={card ? 'admin-panel admin-list-row admin-user-card' : 'admin-list-row'}>
      <div className="admin-row-identity">
        <div className="admin-avatar admin-avatar-icon">
          <Icon name="admin-avatar" size={20} />
        </div>
        <div className="admin-row-name">
          <strong>{fullName(user)}</strong>
          <p>{user.email}</p>
          <p>{user.source === 'server' ? 'Cuenta real' : 'Demostración'}</p>
        </div>
      </div>
      {card ? (
        <div className="admin-row-access">
          <span>{user.role === 'ADMIN' ? 'Admin' : 'Usuario'}</span>
          <AccountStatus user={user} />
        </div>
      ) : (
        <>
          <span>{user.role === 'ADMIN' ? 'Admin' : 'Usuario'}</span>
          <AccountStatus user={user} />
        </>
      )}
      {!card && (
        <time className="admin-list-date" dateTime={user.createdAt}>
          {adminDate(user.createdAt)}
        </time>
      )}
      <AdminAction to={`/admin/users/${user.id}`} arrow>
        {card ? 'Gestionar cuenta' : 'Gestionar'}
      </AdminAction>
    </article>
  );
}
