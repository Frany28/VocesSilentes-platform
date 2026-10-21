import { useLocation } from 'react-router';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { useUsersList } from '../data/use-users-list.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminAction } from '../components/AdminAction.jsx';
import { AdminSelect } from '../components/AdminSelect.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminUserRow } from '../components/AdminUserRow.jsx';
import { AdminPagination } from '../components/AdminPagination.jsx';
import { UserLookup } from '../components/UserLookup.jsx';

/**
 * Lista cuentas reales con búsqueda, rol y páginas desde PostgreSQL; muestra estados de la API.
 * @returns {import('react').ReactElement} Gestión administrativa sin demos como respaldo.
 */
export function AdminUsers() {
  const list = useUsersList();
  const { state } = useLocation();
  return (
    <div className="admin-page">
      <AdminHeading title="Usuarios">Gestiona las cuentas y sus permisos de acceso.</AdminHeading>
      <div className="admin-actions">
        <AdminAction to="/admin/users/new" variant="primary" arrow>
          Crear usuario
        </AdminAction>
      </div>
      {state?.message && (
        <Alert tone="info" title="Información de la cuenta">
          {state.message}
        </Alert>
      )}
      <p className="admin-demo-note">
        Cuentas consultadas al servidor. Se excluyen las cuentas eliminadas.
      </p>
      <UserLookup />
      <section className="admin-panel">
        <div className="admin-list-heading">
          <div>
            <h2>Gestión de usuarios</h2>
            <p className="admin-muted">Gestiona cuentas y roles de acceso.</p>
          </div>
          {list.status === 'ready' && <Badge tone="info">{list.total} cuentas</Badge>}
        </div>
        <div className="admin-filters">
          <Input
            appearance="plain"
            label="Buscar"
            placeholder="Nombre, usuario o correo"
            value={list.query}
            onChange={(event) => list.search(event.target.value)}
          />
          <AdminSelect
            label="Rol"
            value={list.filter}
            onChange={(event) => list.select(event.target.value)}
          >
            <option value="">Todos los roles</option>
            <option value="USER">Usuario</option>
            <option value="ADMIN">Admin</option>
          </AdminSelect>
        </div>
        {list.status !== 'ready' ? (
          <AdminFeedback status={list.status} error={list.error} retry={list.retry} />
        ) : !list.items.length ? (
          <AdminFeedback status="empty" retry={list.reset} />
        ) : (
          <>
            <div className="admin-list-head" aria-hidden="true">
              <span>Cuenta</span>
              <span>Rol</span>
              <span>Estado</span>
              <span>Fecha</span>
              <span>Acciones</span>
            </div>
            {list.items.map((user) => (
              <AdminUserRow key={user.id} user={user} />
            ))}
            <AdminPagination list={list} />
          </>
        )}
      </section>
    </div>
  );
}
