import { Link } from 'react-router';
import { Avatar } from '../../../components/ui/Avatar.jsx';
import { useAuth } from '../../auth/use-auth.js';

/**
 * Enlaza al perfil con la foto autenticada o sus iniciales, reutilizando carga privada y controles existentes.
 * @returns {import('react').ReactElement} Acceso de 44 px al perfil de la sesión actual.
 */
export function StudentProfileLink() {
  const { user } = useAuth();
  return (
    <Link
      to="/student/profile"
      className="vs-icon-action student-profile-link"
      aria-label="Abrir mi perfil"
      title="Mi perfil"
    >
      <Avatar user={user} />
    </Link>
  );
}
