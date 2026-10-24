import { adminDate } from '../data/admin-labels.js';
import { AdminFacts } from './AdminFacts.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Separa identidad, progreso ya registrado y seguridad usando exclusivamente el detalle autorizado.
 * @param {{user: object}} props Cuenta leída al servidor.
 * @returns {import('react').ReactElement} Paneles del detalle sin métricas ficticias.
 */
export function UserAccountData({ user }) {
  return (
    <div className="admin-detail-grid">
      <section className="admin-panel">
        <h2 className="admin-panel-heading">
          <Icon name="modern-person" size={20} />
          Identidad y acceso
        </h2>
        <AdminFacts
          items={[
            ['Nombre de usuario', `@${user.username}`],
            ['Rol', user.role === 'ADMIN' ? 'Admin' : 'Usuario'],
            ['Correo', user.email],
            [
              'Verificación del correo',
              user.emailVerified ? 'Verificado' : 'Pendiente de verificación',
            ],
            ['Método de acceso', 'Correo y contraseña'],
            ['Registro', adminDate(user.createdAt)],
            ['Última actualización', adminDate(user.updatedAt)],
          ]}
        />
      </section>
      <div className="admin-detail-aside">
        <section className="admin-panel">
          <h2 className="admin-panel-heading">
            <Icon name="modern-book" size={20} />
            Aprendizaje
          </h2>
          <p className="admin-muted">Actividad registrada en la plataforma.</p>
          <AdminFacts
            items={[
              ['Lecciones completadas', String(user.activity?.lessons ?? 0)],
              ['Ejercicios completados', String(user.activity?.exercises ?? 0)],
              ['Módulo en curso', user.activity?.currentModule || 'Sin módulo iniciado'],
              ['Última actividad', adminDate(user.activity?.lastActivity)],
            ]}
          />
        </section>
        <section className="admin-panel">
          <h2 className="admin-panel-heading">
            <Icon name="modern-lock" size={20} />
            Seguridad
          </h2>
          <AdminFacts
            items={[
              ['Intentos fallidos registrados', String(user.failedLoginAttempts)],
              ['Bloqueo temporal', user.lockedUntil ? adminDate(user.lockedUntil) : 'Sin bloqueo'],
              ['Eliminación lógica', user.isDeleted ? 'Eliminada' : 'No eliminada'],
              ['Fecha de eliminación', adminDate(user.deletedAt)],
            ]}
          />
        </section>
      </div>
    </div>
  );
}
