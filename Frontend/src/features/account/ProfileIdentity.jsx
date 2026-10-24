import { useState } from 'react';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { RemovePhotoDialog } from './photo/RemovePhotoDialog.jsx';
import { PhotoDialog } from './photo/PhotoDialog.jsx';

/**
 * Identidad real y acciones de foto; cualquier previsualización local queda confinada al diálogo.
 * @param {{user: object}} props DTO autenticado.
 * @returns {import('react').ReactElement} Tarjeta personal con foto/iniciales, sin datos de ejemplo.
 */
export function ProfileIdentity({ user }) {
  const [photo, setPhoto] = useState(false);
  const [remove, setRemove] = useState(false);
  return (
    <aside className="account-profile-identity">
      <section className="account-profile-card">
        <div className="account-profile-card-label">
          <p className="account-caption">TU IDENTIDAD</p>
          <Icon name="modern-identity-check" size={16} />
        </div>
        <div className="account-profile-person">
          <Avatar user={user} large />
          <div>
            <h2>{[user.firstName, user.lastName].filter(Boolean).join(' ')}</h2>
            <p className="account-muted">@{user.username}</p>
            <Badge tone="info">{user.role === 'ADMIN' ? 'Administrador' : 'Estudiante'}</Badge>
          </div>
        </div>
        <div className="account-profile-photo-actions">
          <Button density="compact" icon={null} onClick={() => setPhoto(true)}>
            {user.profileImagePath ? 'Cambiar foto' : 'Agregar foto'}
          </Button>
          <Button
            density="compact"
            icon={null}
            variant="secondary"
            disabled={!user.profileImagePath}
            onClick={() => setRemove(true)}
          >
            Quitar foto
          </Button>
        </div>
        <p className="account-caption">
          Tu foto es opcional. Tus iniciales también te representan.
        </p>
      </section>
      <p className="account-profile-privacy">
        <Icon name="modern-privacy-check" size={20} />
        Tu correo y tu contraseña no aparecen en esta vista previa.
      </p>
      {photo && <PhotoDialog onClose={() => setPhoto(false)} />}
      {remove && <RemovePhotoDialog user={user} onClose={() => setRemove(false)} />}
    </aside>
  );
}
