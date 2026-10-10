import { useParams } from 'react-router';
import { useAdminUser } from '../data/use-admin-user.js';
import { AdminHeading } from '../components/AdminHeading.jsx';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { UserForm } from '../forms/UserForm.jsx';
/**
 * Crea una cuenta o consulta la versión actual del servidor antes de abrir la edición.
 * @returns {import('react').ReactElement} Pantalla de formulario y estados de lectura.
 */
export function AdminUserForm() {
  const { id } = useParams();
  const result = useAdminUser(id);
  return (
    <div className="admin-page">
      <AdminHeading title={id ? 'Editar cuenta' : 'Crear usuario'}>
        {id
          ? 'Revisa la información y los permisos antes de guardar.'
          : 'Crea una cuenta con sus datos de identidad y acceso.'}
      </AdminHeading>
      {result.status === 'ready' ? (
        <UserForm key={id ?? 'new'} user={result.user} />
      ) : (
        <AdminFeedback
          status={result.status}
          error={result.error}
          retry={result.retry}
          noun="la cuenta"
        />
      )}
    </div>
  );
}
