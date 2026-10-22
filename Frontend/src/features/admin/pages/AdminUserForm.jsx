import { useNavigate, useParams } from 'react-router';
import { useAdminUser } from '../data/use-admin-user.js';
import { Dialog } from '../../../components/ui/Dialog.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { UserForm } from '../forms/UserForm.jsx';
import { AdminUsers } from './AdminUsers.jsx';
import { AdminUserDetail } from './AdminUserDetail.jsx';

/**
 * Conserva rutas directas/recarga de creación y edición, con la pantalla de origen detrás del modal.
 * @returns {import('react').ReactElement} Fondo inerte y diálogo con lectura real/abortable.
 */
export function AdminUserForm() {
  const { id } = useParams();
  const result = useAdminUser(id);
  const navigate = useNavigate();
  return (
    <>
      <div className="admin-background" inert aria-hidden="true">
        {id ? <AdminUserDetail /> : <AdminUsers />}
      </div>
      {result.status === 'ready' ? (
        <UserForm key={id ?? 'new'} user={result.user} />
      ) : (
        <Dialog title="Editar cuenta" onClose={() => navigate(`/admin/users/${id}`)}>
          <AdminFeedback
            status={result.status}
            error={result.error}
            retry={result.retry}
            noun="la cuenta"
          />
        </Dialog>
      )}
    </>
  );
}
