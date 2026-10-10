import { useParams } from 'react-router';
import { useAdminUser } from '../data/use-admin-user.js';
import { adminDate, fullName } from '../data/admin-labels.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminFacts } from '../components/AdminFacts.jsx';
import { AdminAction } from '../components/AdminAction.jsx';
import { AccountStatus } from '../components/AccountStatus.jsx';
/**
 * Resultado de creación confirmado mediante consulta real; recargar vuelve a leer persistencia.
 * @returns {import('react').ReactElement} Cuenta persistida sin contraseña ni progreso inventado.
 */
export function AdminUserCreated() {
  const { id } = useParams();
  const result = useAdminUser(id);
  const user = result.user;
  return (
    <div className="admin-page">
      <AdminHeading title="Cuenta guardada">
        Consulta la identidad y el acceso de la cuenta.
      </AdminHeading>
      {result.status !== 'ready' ? (
        <AdminFeedback
          status={result.status}
          error={result.error}
          retry={result.retry}
          noun="la cuenta"
        />
      ) : (
        <section className="admin-panel">
          <p className="admin-kicker">IDENTIDAD Y ACCESO</p>
          <h2>{fullName(user)}</h2>
          <p className="admin-muted">
            @{user.username} · {user.email}
          </p>
          <AccountStatus user={user} />
          <p className="admin-demo-note">
            {user.source === 'server'
              ? 'Cuenta real consultada al servidor.'
              : 'Cuenta de demostración, sin persistencia.'}
          </p>
          <AdminFacts
            items={[
              ['Rol', user.role === 'ADMIN' ? 'Admin' : 'Usuario'],
              ['Estado', user.isActive ? 'Activo' : 'Desactivado'],
              ['Correo', user.emailVerified ? 'Verificado' : 'Pendiente de verificación'],
              ['Método de acceso', 'Correo y contraseña'],
              ['Actividad de aprendizaje', 'Requiere una integración futura'],
              ['Registro', adminDate(user.createdAt)],
            ]}
          />
          <p className="admin-muted">
            La contraseña permanece privada. El acceso depende del estado de la cuenta.
          </p>
          <div className="admin-actions">
            <AdminAction to="/admin/users">Volver a usuarios</AdminAction>
            <AdminAction to="/admin/users/new" variant="primary">
              Crear otro usuario
            </AdminAction>
          </div>
          <AdminAction to={`/admin/users/${id}`}>Ver detalle de cuenta</AdminAction>
        </section>
      )}
    </div>
  );
}
