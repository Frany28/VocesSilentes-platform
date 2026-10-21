import { adminUser } from './admin-user.js';
import { userIdSchema } from './users.validation.js';
import {
  requireAdministrator,
  requireEditableUser,
  requireRemainingAdmin,
} from './users.policy.js';

/**
 * Elimina lógicamente, revoca sesiones y registra auditoría en una única transacción bloqueada.
 * @param {object} repository Repositorio administrativo existente.
 * @param {string} actorId Actor obtenido de la sesión.
 * @param {string} id UUID de la cuenta afectada.
 * @returns {Promise<object>} DTO confirmado; propaga errores de permiso, existencia o último ADMIN.
 */
export async function deleteAdminUser(repository, actorId, id) {
  userIdSchema.parse(id);
  return repository.write(actorId, id, async (operations) => {
    requireAdministrator(operations.actor);
    requireEditableUser(operations.current);
    await requireRemainingAdmin(operations);
    const deletedAt = new Date(Math.max(Date.now(), operations.current.createdAt.getTime()));
    const user = await operations.update({ isDeleted: true, deletedAt, updatedAt: deletedAt });
    await operations.revokeSessions();
    await operations.audit('USER_DELETED', id);
    return adminUser(user);
  });
}
