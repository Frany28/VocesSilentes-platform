/**
 * Proyecta únicamente datos públicos del usuario autenticado; omite credenciales y bloqueo.
 * @param {object} user Fila User privada.
 * @returns {object} DTO para register/login/me.
 */
export function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    profileImagePath: user.profileImagePath,
    role: user.role,
    emailVerified: user.emailVerified,
  };
}

/**
 * Comprueba estados vigentes sin exigir verificación de correo en este MVP.
 * @param {object | null} user Cuenta encontrada.
 * @param {Date} now Instante de autorización.
 * @returns {boolean} Si puede acceder; no implementa reglas nuevas de bloqueo.
 */
export function accountAllowed(user, now) {
  return Boolean(
    user && user.isActive && !user.isDeleted && (!user.lockedUntil || user.lockedUntil <= now),
  );
}
