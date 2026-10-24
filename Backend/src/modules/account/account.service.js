import { HttpError } from '../../errors/http-error.js';
import { createPasswords } from '../auth/passwords.js';
import { publicUser, accountAllowed } from '../auth/public-user.js';
import { createUsersRepository } from '../admin/users.repository.js';
import { persistAdminUser } from '../admin/users.persistence.js';
import { profileSchema, passwordSchema } from './account.validation.js';
import { createProfilePhotoService } from './profile-photo.service.js';

/**
 * Gestiona identidad propia y credenciales; permisos y cambios se revalidan bajo bloqueo.
 * @param {object} database Prisma compartido.
 * @param {object | undefined} storage Almacenamiento privado de fotos.
 * @returns {Promise<object>} Perfil, contraseña y fotos; errores públicos sin credenciales.
 */
export async function createAccountService(database, storage) {
  const passwords = await createPasswords();
  const repository = createUsersRepository(database);
  const allowed = (actor) => {
    if (!accountAllowed(actor, new Date()))
      throw new HttpError(403, 'FORBIDDEN', 'La cuenta no permite esta operación');
  };
  return {
    ...createProfilePhotoService(database, storage),
    async profile(actorId, input) {
      const identity = profileSchema.parse(input);
      const saved = await persistAdminUser(
        () =>
          repository.write(actorId, actorId, async (op) => {
            allowed(op.actor);
            const user = await op.update({
              ...identity,
              lastName: identity.lastName ?? null,
              ...(identity.email !== op.actor.email ? { emailVerified: false } : {}),
            });
            await op.audit('USER_UPDATED', actorId);
            return user;
          }),
        () => repository.conflicts(identity, actorId),
      );
      return publicUser(saved);
    },
    async password(actorId, sessionHash, input) {
      const { currentPassword, newPassword } = passwordSchema.parse(input);
      const before = await database.user.findUnique({ where: { id: actorId } });
      if (!(await passwords.verify(before?.passwordHash, currentPassword)))
        throw new HttpError(400, 'CURRENT_PASSWORD_INVALID', 'La contraseña actual no es correcta');
      const passwordHash = await passwords.hash(newPassword);
      await repository.write(actorId, actorId, async (op) => {
        allowed(op.actor);
        if (op.actor.passwordHash !== before.passwordHash)
          throw new HttpError(
            409,
            'CREDENTIALS_CHANGED',
            'La contraseña cambió. Vuelve a intentarlo.',
          );
        await op.update({ passwordHash });
        await op.revokeOtherSessions(sessionHash);
        await op.audit('USER_UPDATED', actorId);
      });
    },
  };
}
