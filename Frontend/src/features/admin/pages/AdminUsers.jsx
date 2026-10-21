import { useEffect, useRef } from 'react';
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

/**
 * Lista real con filtros/paginación de servidor; no calcula censos de actividad desde una sola página.
 * @returns {import('react').ReactElement} Gestión compacta y estados HTTP verificables.
 */
export function AdminUsers() {
  const list = useUsersList();
  const { state } = useLocation();
  const page = useRef();
  useEffect(() => {
    if (state?.focusAction === 'create') page.current.querySelector('[data-admin-to]')?.focus();
  }, [state]);
  return (
    <div className="admin-page" ref={page}>
      <div className="admin-title-row">
        <AdminHeading title="Gestión de usuarios">
          Cuentas, roles y accesos en un solo lugar.
        </AdminHeading>
        <AdminAction to="/admin/users/new" variant="primary">
          Crear usuario
        </AdminAction>
      </div>
      {state?.message && (
        <Alert tone="success" title="Información de la cuenta">
          {state.message}
        </Alert>
      )}
      {list.status === 'ready' && (
        <div className="admin-status-line">
          <Badge tone="info">
            {list.total} cuentas{list.query || list.filter ? ' encontradas' : ''}
          </Badge>
        </div>
      )}
      <section className="admin-panel">
        <div className="admin-filters">
          <Input
            appearance="plain"
            label="Buscar usuarios"
            placeholder="Nombre, usuario o correo"
            value={list.query}
            maxLength={100}
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
          <AdminFeedback
            status={list.total ? 'empty-page' : list.query || list.filter ? 'empty' : 'no-data'}
            retry={
              list.total ? () => list.go(1) : list.query || list.filter ? list.reset : undefined
            }
          />
        ) : (
          <>
            <div className="admin-list-head" aria-hidden="true">
              <span>Cuenta</span>
              <span>Rol</span>
              <span>Estado</span>
              <span>Registro</span>
              <span>Acción</span>
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
