import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { usePasswordChange } from './use-password-change.js';

/**
 * Actualiza credenciales propias y revoca las demás sesiones, conservando la sesión actual.
 * @returns {import('react').ReactElement} Formulario diseñado con verificación real de contraseña actual.
 */
export function SecuritySettings() {
  const operation = usePasswordChange();
  const field = (name) => ({
    name,
    value: operation.values[name],
    onChange: operation.change,
    disabled: operation.pending,
    required: true,
    maxLength: 256,
  });
  return (
    <form className="account-form" onSubmit={operation.submit}>
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
        {...field('currentPassword')}
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
          {...field('newPassword')}
        />
        <Input
          density="compact"
          type="password"
          appearance="plain"
          label="Confirma la nueva contraseña"
          placeholder="Repite la nueva contraseña"
          autoComplete="new-password"
          {...field('confirmation')}
        />
      </div>
      <div className="account-profile-role flex flex-col gap-2 bg-secondary">
        <p>Una contraseña solo para ti</p>
        <p className="account-caption">Evita reutilizar la contraseña de otros servicios.</p>
      </div>
      {operation.error && (
        <Alert density="compact" tone="error" title="No se pudo actualizar">
          {operation.error}
        </Alert>
      )}
      {operation.success && (
        <Alert density="compact" tone="success" title="Contraseña actualizada">
          Las demás sesiones se cerraron. Esta sesión permanece abierta.
        </Alert>
      )}
      <div className="account-profile-submit">
        <p className="account-caption">Confirma tus datos para actualizar.</p>
        <Button
          density="compact"
          type="submit"
          icon={null}
          loading={operation.pending}
          loadingLabel="Actualizando…"
        >
          Actualizar contraseña
        </Button>
      </div>
    </form>
  );
}
