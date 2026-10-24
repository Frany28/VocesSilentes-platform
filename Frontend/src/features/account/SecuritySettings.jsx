import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

/**
 * Presenta seguridad sin recoger contraseñas para un servicio inexistente.
 * @returns {import('react').ReactElement} Campos deshabilitados y dependencia real, sin éxito/carga simulados.
 */
export function SecuritySettings() {
  return (
    <section className="account-form">
      <h2>Tu acceso, bajo control</h2>
      <p className="account-muted">Actualiza tu contraseña desde un solo lugar.</p>
      <Input
        density="compact"
        type="password"
        appearance="plain"
        label="Contraseña actual"
        className="max-w-80"
        placeholder="Contraseña actual"
        autoComplete="current-password"
        disabled
      />
      <div className="account-name-row">
        <Input
          density="compact"
          type="password"
          appearance="plain"
          label="Nueva contraseña"
          placeholder="Crea una contraseña segura"
          help="Entre 15 y 128 caracteres."
          autoComplete="new-password"
          disabled
        />
        <Input
          density="compact"
          type="password"
          appearance="plain"
          label="Confirma la nueva contraseña"
          placeholder="Repite la nueva contraseña"
          autoComplete="new-password"
          disabled
        />
      </div>
      <div className="account-profile-role flex flex-col gap-2 bg-secondary">
        <p>Una contraseña solo para ti</p>
        <p className="account-caption">Evita reutilizar la contraseña de otros servicios.</p>
      </div>
      <Alert density="compact" title="Cambio de contraseña no disponible">
        Falta un servicio que valide la contraseña actual, actualice la credencial y gestione las
        sesiones.
      </Alert>
      <div className="account-profile-submit">
        <p className="account-caption">Confirma tus datos para actualizar.</p>
        <Button density="compact" icon={null} disabled>
          Actualizar contraseña
        </Button>
      </div>
    </section>
  );
}
