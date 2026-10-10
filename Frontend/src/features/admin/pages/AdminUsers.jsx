import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { useAdmin } from '../data/admin-context.js';
import { useAdminList } from '../data/use-admin-list.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminAction } from '../components/AdminAction.jsx';
import { AdminSelect } from '../components/AdminSelect.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminUserRow } from '../components/AdminUserRow.jsx';
import { AdminPagination } from '../components/AdminPagination.jsx';

/**
 * Listado demo y cuentas reales conocidas, búsqueda, filtro, paginación y consulta mínima por ID.
 * @returns {import('react').ReactElement} Gestión; no solicita un listado backend fuera del alcance.
 */
export function AdminUsers() {
  const { users, status, error, retry } = useAdmin();
  const list = useAdminList(users, 'role');
  const [id, setId] = useState('');
  const navigate = useNavigate();
  return (
    <div className="admin-page">
      <AdminHeading title="Usuarios">Gestiona las cuentas y sus permisos de acceso.</AdminHeading>
      <div className="admin-actions">
        <AdminAction to="/admin/users/new" variant="primary" arrow>
          Crear usuario
        </AdminAction>
      </div>
      <p className="admin-demo-note">
        Listado de demostración y cuentas reales consultadas en este navegador. Cada cuenta indica
        su origen.
      </p>
      <form
        className="admin-lookup"
        onSubmit={(event) => {
          event.preventDefault();
          if (id.trim()) navigate(`/admin/users/${encodeURIComponent(id.trim())}`);
        }}
      >
        <Input
          appearance="plain"
          label="Abrir cuenta real por ID"
          placeholder="UUID de la cuenta"
          value={id}
          onChange={(event) => setId(event.target.value)}
          required
        />
        <Button type="submit" variant="secondary" icon={null}>
          Consultar
        </Button>
      </form>
      {status !== 'ready' && status !== 'empty' ? (
        <AdminFeedback status={status} error={error} retry={retry} />
      ) : (
        <section className="admin-panel">
          <div className="admin-list-heading">
            <div>
              <h2>Gestión de usuarios</h2>
              <p className="admin-muted">Gestiona cuentas y roles de acceso.</p>
            </div>
            <Badge tone="info">{list.total} cuentas visibles</Badge>
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
          {status === 'empty' || !list.total ? (
            <AdminFeedback status="empty" retry={status === 'empty' ? retry : list.reset} />
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
      )}
    </div>
  );
}
