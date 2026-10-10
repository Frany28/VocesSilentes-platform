import { Link } from 'react-router';
import { useAuth } from '../../auth/use-auth.js';
import { Input } from '../../../components/ui/Input.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { StudentPageHeader } from '../components/StudentPageHeader.jsx';

/**
 * Muestra exclusivamente el DTO real de sesión, sin edición ficticia ni campos sensibles.
 * Composición con controles existentes; pendiente de un frame propio de perfil en Figma.
 * @returns {import('react').ReactElement} Identidad de la cuenta autenticada en modo solo lectura.
 */
export function StudentProfile() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col gap-6">
      <StudentPageHeader title="Mi perfil" description="Los datos de tu cuenta de VocesSilentes." />
      <section className="student-profile flex min-w-0 flex-col gap-6 rounded-3xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-20 items-center justify-center rounded-full bg-(--surface-secondary) [font:var(--type-h3)]">
            {user.firstName.slice(0, 1)}
            {user.lastName?.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="[font:var(--type-h3)]">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-muted">Datos reales de tu sesión · Perfil de estudiante</p>
          </div>
          <Badge>Estudiante</Badge>
        </div>
        <div className="student-profile-fields grid gap-4">
          <Input appearance="plain" label="Nombre" value={user.firstName} readOnly />
          <Input appearance="plain" label="Apellido" value={user.lastName || ''} readOnly />
          <Input appearance="plain" label="Nombre de usuario" value={user.username} readOnly />
          <Input appearance="plain" label="Correo electrónico" value={user.email} readOnly />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone={user.emailVerified ? 'success' : 'warning'}>
            {user.emailVerified ? 'Correo verificado' : 'Correo pendiente de verificación'}
          </Badge>
          <p className="text-muted">
            La edición de perfil y el envío de verificación están pendientes de integración.
          </p>
        </div>
        <Link to="/account" className="min-h-11 self-start rounded-lg p-2 text-action underline">
          Ver mi sesión
        </Link>
      </section>
    </div>
  );
}
