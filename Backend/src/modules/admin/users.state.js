import { adminUser } from './admin-user.js';
import {
  requireAdministrator,
  requireEditableUser,
  requireRemainingAdmin,
} from './users.policy.js';

/**
 * Cambia actividad y revoca sesiones al desactivar, con bloqueo y bitácora atómicos.
 * @param {object} repository Repositorio administrativo compartido.
 * @param {string} actorId ADMIN autenticado.
 * @param {string} id Cuenta seleccionada.
 * @param {boolean} isActive Estado solicitado explícitamente.
 * @returns {Promise<object>} Cuenta actualizada; rechaza desactivar al último ADMIN.
 */
export async function changeUserState(repository, actorId, id, isActive) {
  return adminUser(
    await repository.write(actorId, id, async (operations) => {
      requireAdministrator(operations.actor);
      requireEditableUser(operations.current);
      if (operations.current.isActive === isActive) return operations.current;
      if (!isActive) await requireRemainingAdmin(operations);
      const user = await operations.update({ isActive });
      if (!isActive) await operations.revokeSessions();
      await operations.audit('USER_UPDATED', id);
      return user;
    }),
  );
}
