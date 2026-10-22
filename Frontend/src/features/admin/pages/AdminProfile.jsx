import { useLocation } from 'react-router';
import { useAuth } from '../../auth/use-auth.js';
import { ProfilePage } from '../../account/ProfilePage.jsx';
import { SecuritySettings } from '../../account/SecuritySettings.jsx';
import { AdminProfileForm } from '../profile/AdminProfileForm.jsx';

/**
 * Conserva la edición ADMIN real dentro de la composición de cuenta común.
 * @returns {import('react').ReactElement} Perfil o seguridad según la ruta autorizada.
 */
export function AdminProfile() {
  const { user } = useAuth();
  const security = useLocation().pathname.endsWith('/security');
  return (
    <ProfilePage user={user} basePath="/admin/profile">
      {security ? <SecuritySettings /> : <AdminProfileForm key={user.id} user={user} />}
    </ProfilePage>
  );
}
