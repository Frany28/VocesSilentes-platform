import { AccountStatus } from './AccountStatus.jsx';
import { IconAction } from '../../../components/ui/IconAction.jsx';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { adminDate, fullName } from '../data/admin-labels.js';

/**
 * Cuenta real con columnas idénticas a la cabecera y composición compacta para móvil.
 * @param {{user: object}} props DTO permitido de la API.
 * @returns {import('react').ReactElement} Fila con acción Ver cuenta e icono de ojo.
 */
export function AdminUserRow({ user }) {
  return (
    <article className="admin-list-row admin-user-row">
      <div className="admin-row-identity">
        <Avatar user={user} />
        <div className="admin-row-name">
          <strong>{fullName(user)}</strong>
          <p>{user.email}</p>
          <AccountStatus user={user} />
        </div>
      </div>
      <span className="admin-row-role">{user.role === 'ADMIN' ? 'Admin' : 'Usuario'}</span>
      <div className="admin-row-status">
        <AccountStatus user={user} />
      </div>
      <time className="admin-list-date" dateTime={user.createdAt}>
        {adminDate(user.createdAt)}
      </time>
      <IconAction
        to={`/admin/users/${user.id}`}
        icon="eye"
        label={`Ver cuenta · ${fullName(user)}`}
      />
    </article>
  );
}
