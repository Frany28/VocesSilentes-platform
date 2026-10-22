import { Button } from '../../components/ui/Button.jsx';
import { ProfileFields } from './ProfileFields.jsx';

/**
 * Identidad USER sin ofrecer guardado mientras falta un endpoint propio.
 * @param {{user: object}} props DTO de sesión autorizado.
 * @returns {import('react').ReactElement} Campos de solo lectura y dependencia explícita.
 */
export function ProfileReadOnly({ user }) {
  return (
    <section className="account-form">
      <h2>Lo que te hace tú</h2>
      <p className="account-muted">
        Mantén tus datos al día y personaliza cómo se muestra tu cuenta.
      </p>
      <ProfileFields values={user} role={user.role} readOnly />
      <p className="account-caption">
        {user.emailVerified ? 'Correo verificado' : 'Correo pendiente de verificación'}
      </p>
      <div className="account-profile-submit">
        <p className="account-caption" id="student-profile-unavailable">
          Edición no disponible: falta el servicio para actualizar tu perfil de estudiante.
        </p>
        <Button
          density="compact"
          icon={null}
          disabled
          aria-describedby="student-profile-unavailable"
        >
          Guardar cambios
        </Button>
      </div>
    </section>
  );
}
