import { Badge } from '../../../components/ui/Badge.jsx';
/**
 * Estado administrativo de la cuenta expresado con texto y color del sistema.
 * @param {{user: object}} props Cuenta real o demo identificada.
 * @returns {import('react').ReactElement} Badge semántico.
 */
export function AccountStatus({ user }) {
  return (
    <Badge tone={user.isActive && !user.isDeleted ? 'success' : 'warning'}>
      {user.isDeleted ? 'Eliminada' : user.isActive ? 'Activo' : 'Desactivado'}
    </Badge>
  );
}
