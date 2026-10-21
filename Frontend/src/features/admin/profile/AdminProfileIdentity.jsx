import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { AdminAvatar } from '../components/AdminAvatar.jsx';
import { AdminConfirmation } from '../components/AdminConfirmation.jsx';
import { PhotoDialog } from './PhotoDialog.jsx';
import { fullName } from '../data/admin-labels.js';

/**
 * Identidad real y acciones de foto; cualquier previsualización local queda confinada al diálogo.
 * @param {{user: object}} props DTO autenticado.
 * @returns {import('react').ReactElement} Tarjeta personal con foto/iniciales, sin datos de ejemplo.
 */
export function AdminProfileIdentity({ user }) {
  const [photo, setPhoto] = useState(false);
  const [remove, setRemove] = useState(false);
  return (
    <aside className="admin-profile-identity">
      <section className="admin-profile-card">
        <div className="admin-profile-card-label">
          <p className="admin-demo-note">TU IDENTIDAD</p>
          <Icon name="modern-identity-check" size={16} />
        </div>
        <div className="admin-profile-person">
          <AdminAvatar user={user} large />
          <div>
            <h2>{fullName(user)}</h2>
            <p className="admin-muted">@{user.username}</p>
            <Badge tone="info">Administrador</Badge>
          </div>
        </div>
        <div className="admin-profile-photo-actions">
          <Button icon={null} onClick={() => setPhoto(true)}>
            {user.profileImagePath ? 'Cambiar foto' : 'Agregar foto'}
          </Button>
          <Button
            icon={null}
            variant="secondary"
            disabled={!user.profileImagePath}
            onClick={() => setRemove(true)}
          >
            Quitar foto
          </Button>
        </div>
        <p className="admin-demo-note">
          Tu foto es opcional. Tus iniciales también te representan.
        </p>
      </section>
      <p className="admin-profile-privacy">
        <Icon name="modern-privacy-check" size={20} />
        Tu correo y tu contraseña no aparecen en esta vista previa.
      </p>
      {photo && <PhotoDialog onClose={() => setPhoto(false)} />}
      {remove && (
        <AdminConfirmation
          title="¿Quitar tu foto?"
          confirm="Quitar foto"
          disabled
          onCancel={() => setRemove(false)}
          onConfirm={() => {}}
        >
          Se eliminará la foto de tu perfil y volverán a mostrarse tus iniciales. Acción no
          disponible: falta el servicio para eliminar fotos.
        </AdminConfirmation>
      )}
    </aside>
  );
}
