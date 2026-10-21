import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Conserva el acceso directo a una cuenta por UUID desde la gestión administrativa.
 * @returns {import('react').ReactElement} Formulario de navegación sin peticiones propias.
 */
export function UserLookup() {
  const [id, setId] = useState('');
  const navigate = useNavigate();
  return (
    <form
      className="admin-lookup"
      onSubmit={(event) => {
        event.preventDefault();
        if (id.trim()) navigate(`/admin/users/${encodeURIComponent(id.trim())}`);
      }}
    >
      <Input
        appearance="plain"
        label="Abrir cuenta real por ID"
        placeholder="UUID de la cuenta"
        value={id}
        onChange={(event) => setId(event.target.value)}
        required
      />
      <Button type="submit" variant="secondary" icon={null}>
        Consultar
      </Button>
    </form>
  );
}
