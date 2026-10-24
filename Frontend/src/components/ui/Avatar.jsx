import { useState } from 'react';
import { publicConfig } from '../../lib/config.js';

/**
 * Iniciales o imagen de la cuenta proporcionada; no solicita ni sustituye imágenes remotas.
 * @param {{user: object, large?: boolean}} props Identidad de sesión/DTO y tamaño de perfil.
 * @returns {import('react').ReactElement} Avatar decorativo junto al nombre de la cuenta.
 */
export function Avatar({ user, large = false }) {
  const path = user.profileImagePath;
  const source =
    path && /^[a-f0-9-]{36}\/[a-f0-9-]{36}\.webp$/.test(path)
      ? `${publicConfig.apiUrl}/account/photos/${user.id}/image?v=${path.split('/')[1]}`
      : path;
  const [failedSource, setFailedSource] = useState(null);
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((part) => part[0])
    .join('');
  return (
    <span className={`vs-avatar ${large ? 'vs-avatar-large' : ''}`} aria-hidden="true">
      {user.profileImagePath && failedSource !== user.profileImagePath ? (
        <img
          src={source}
          crossOrigin={source === path ? undefined : 'use-credentials'}
          alt=""
          onError={() => setFailedSource(user.profileImagePath)}
        />
      ) : (
        initials.toUpperCase()
      )}
    </span>
  );
}
