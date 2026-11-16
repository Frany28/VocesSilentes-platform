import { useState } from 'react';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { useAdmin } from '../data/admin-context.js';

/**
 * Permite al administrador establecer una nueva contraseña, sin revelar credenciales previas.
 * @param {{user: object}} props Cuenta seleccionada.
 * @returns {import('react').ReactElement} Formulario protegido con confirmación y feedback.
 */
export function UserPasswordAction({ user }) {
  const { api } = useAdmin();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (pending) return;
    setError('');
    setSuccess(false);
    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setPending(true);
    try {
      await api.resetPassword(user.id, password);
      setPassword('');
      setConfirmation('');
      setSuccess(true);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setPending(false);
    }
  };
  return (
    <details className="admin-demo-note">
      <summary>Cambiar contraseña</summary>
      <p>Se cerrarán las sesiones de esta cuenta. La nueva contraseña se comunicará por un canal seguro.</p>
      {error && <Alert tone="error" title="No se pudo cambiar la contraseña">{error}</Alert>}
      {success && <Alert tone="success" title="Contraseña actualizada">Las sesiones anteriores fueron revocadas.</Alert>}
      <form className="admin-form" onSubmit={submit}>
        <fieldset disabled={pending}>
          <Input
            label="Nueva contraseña"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            help="Mínimo 8 caracteres, una mayúscula y un carácter especial."
            required
          />
          <Input
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
          />
          <Button type="submit" loading={pending} loadingLabel="Guardando…">
            Guardar nueva contraseña
          </Button>
        </fieldset>
      </form>
    </details>
  );
}
