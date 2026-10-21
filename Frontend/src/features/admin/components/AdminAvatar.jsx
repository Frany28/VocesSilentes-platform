/**
 * Iniciales o imagen de la cuenta proporcionada; no solicita ni sustituye imágenes remotas.
 * @param {{user: object, large?: boolean}} props Identidad de sesión/DTO y tamaño de perfil.
 * @returns {import('react').ReactElement} Avatar decorativo junto al nombre de la cuenta.
 */
export function AdminAvatar({ user, large = false }) {
  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((part) => part[0])
    .join('');
  return (
    <span className={`admin-avatar ${large ? 'admin-avatar-large' : ''}`} aria-hidden="true">
      {user.profileImagePath ? <img src={user.profileImagePath} alt="" /> : initials.toUpperCase()}
    </span>
  );
}
