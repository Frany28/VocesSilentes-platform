import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { AdminUnavailable } from '../components/AdminUnavailable.jsx';

/**
 * Presenta seguridad sin recoger contraseñas para un servicio inexistente.
 * @returns {import('react').ReactElement} Campos deshabilitados y dependencia real, sin éxito/carga simulados.
 */
export function AdminSecurityForm() {
  return (
    <section className="admin-form">
      <h2>Tu acceso, bajo control</h2>
      <p className="admin-muted">Actualiza tu contraseña desde un solo lugar.</p>
      <Input
        type="password"
        appearance="plain"
        label="Contraseña actual"
        placeholder="Contraseña actual"
        autoComplete="current-password"
        disabled
      />
      <div className="admin-name-row">
        <Input
          type="password"
          appearance="plain"
          label="Nueva contraseña"
          placeholder="Crea una contraseña segura"
          help="Entre 15 y 128 caracteres."
          autoComplete="new-password"
          disabled
        />
        <Input
          type="password"
          appearance="plain"
          label="Confirma la nueva contraseña"
          placeholder="Repite la nueva contraseña"
          autoComplete="new-password"
          disabled
        />
      </div>
      <div className="admin-profile-role">
        <p>Una contraseña solo para ti</p>
        <p className="admin-demo-note">Evita reutilizar la contraseña de otros servicios.</p>
      </div>
      <AdminUnavailable title="Cambio de contraseña no disponible">
        Falta un servicio que valide la contraseña actual, actualice la credencial y gestione las
        sesiones.
      </AdminUnavailable>
      <div className="admin-profile-submit">
        <p className="admin-demo-note">Confirma tus datos para actualizar.</p>
        <Button icon={null} disabled>
          Actualizar contraseña
        </Button>
      </div>
    </section>
  );
}
