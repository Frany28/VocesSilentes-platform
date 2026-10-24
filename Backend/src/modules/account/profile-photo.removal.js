import { lockActor } from '../auth/auth-transaction.js';
import { publicUser } from '../auth/public-user.js';

/**
 * Elimina foto con bitácora y conserva bytes para compensar un rollback después del borrado S3.
 * @param {object} database Prisma compartido.
 * @param {object} storage Almacenamiento privado configurado.
 * @param {string} actorId Titular autenticado.
 * @returns {Promise<object>} Usuario sin foto; no confirma ante fallo SQL o S3.
 */
export async function removeProfilePhoto(database, storage, actorId) {
  let removed;
  let bytes;
  try {
    return await database.$transaction(
      async (tx) => {
        await lockActor(tx, actorId);
        const user = await tx.user.findUnique({ where: { id: actorId } });
        if (user.profileImagePath) {
          bytes = await storage.read(user.profileImagePath);
          await tx.user.update({ where: { id: actorId }, data: { profileImagePath: null } });
          await tx.auditLog.create({
            data: { actorId, operation: 'USER_UPDATED', entityType: 'User', entityId: actorId },
          });
          removed = user.profileImagePath;
          await storage.remove(removed);
        }
        return publicUser({ ...user, profileImagePath: null });
      },
      { timeout: 30000 },
    );
  } catch (error) {
    if (removed) await storage.upload(removed, bytes);
    throw error;
  }
}
