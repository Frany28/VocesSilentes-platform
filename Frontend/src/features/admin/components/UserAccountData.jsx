import { adminDate } from '../data/admin-labels.js';
import { AdminFacts } from './AdminFacts.jsx';
/**
 * Separa identidad y estado reales de la actividad demo o aún no integrada.
 * @param {{user: object}} props Cuenta con procedencia explícita.
 * @returns {import('react').ReactElement} Grupos de datos de la cuenta.
 */
export function UserAccountData({ user }) {
  const demo = user.source === 'demo';
  return (
    <>
      <AdminFacts
        items={[
          ['Nombre', user.firstName],
          ['Apellido', user.lastName || 'No indicado'],
          ['Nombre de usuario', `@${user.username}`],
          ['Correo', user.email],
          [
            'Verificación del correo',
            user.emailVerified ? 'Verificado' : 'Pendiente de verificación',
          ],
          ['Método de acceso', 'Correo y contraseña'],
          ['Registro', adminDate(user.createdAt)],
          ['Última actualización', adminDate(user.updatedAt)],
          ['ID de cuenta', user.id],
        ]}
      />
      <p className="admin-demo-note">
        {demo
          ? 'Actividad de aprendizaje de demostración'
          : 'Actividad de aprendizaje: requiere una integración futura'}
      </p>
      <AdminFacts
        tone="info"
        items={[
          ['Lecciones completadas', demo ? '3 de 5 · 60%' : 'Sin datos disponibles'],
          ['Ejercicios completados', demo ? '3' : 'Sin datos disponibles'],
          ['Módulo en curso', demo ? 'Saludos y presentaciones' : 'Sin datos disponibles'],
          [
            'Última actividad de aprendizaje',
            demo ? '09 oct 2026 · 14:30' : 'Sin datos disponibles',
          ],
        ]}
      />
      <AdminFacts
        items={[
          ['Intentos fallidos registrados', String(user.failedLoginAttempts)],
          ['Bloqueo temporal', user.lockedUntil ? adminDate(user.lockedUntil) : 'Sin bloqueo'],
          ['Eliminación lógica', user.isDeleted ? 'Eliminada' : 'No eliminada'],
          ['Fecha de eliminación', adminDate(user.deletedAt)],
        ]}
      />
    </>
  );
}
