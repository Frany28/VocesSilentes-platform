import { useLocation } from 'react-router';
import { useAuth } from '../../auth/use-auth.js';
import { ProfilePage } from '../../account/ProfilePage.jsx';
import { ProfileForm } from '../../account/ProfileForm.jsx';
import { SecuritySettings } from '../../account/SecuritySettings.jsx';

/**
 * Perfil real con composición común y dependencias de guardado explícitas.
 * @returns {import('react').ReactElement} Identidad, seguridad y vista previa local de foto.
 */
export function StudentProfile() {
  const { user } = useAuth();
  const security = useLocation().pathname.endsWith('/security');
  return (
    <ProfilePage user={user} basePath="/student/profile">
      {security ? <SecuritySettings /> : <ProfileForm user={user} />}
    </ProfilePage>
  );
}
