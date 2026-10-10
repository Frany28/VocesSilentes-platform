import { publicUser } from '../auth/public-user.js';

/**
 * Proyecta los campos de administración permitidos; nunca incluye el hash ni sesiones.
 * @param {object} user Fila privada de Prisma.
 * @returns {object} Cuenta administrativa serializable.
 */
export function adminUser(user) {
  return {
    ...publicUser(user),
    isActive: user.isActive,
    isDeleted: user.isDeleted,
    deletedAt: user.deletedAt,
    lockedUntil: user.lockedUntil,
    failedLoginAttempts: user.failedLoginAttempts,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
