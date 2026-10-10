import { HttpError } from '../../errors/http-error.js';
import { createPasswords } from '../auth/passwords.js';
import { accountAllowed } from '../auth/public-user.js';
import { adminUser } from './admin-user.js';
import { createUsersRepository } from './users.repository.js';
import { persistAdminUser } from './users.persistence.js';
import { createUserSchema, editUserSchema, userIdSchema } from './users.validation.js';

function requireAdministrator(actor) {
  if (!accountAllowed(actor, new Date()) || actor.role !== 'ADMIN')
    throw new HttpError(403, 'FORBIDDEN', 'Permiso insuficiente');
}

/**
 * Crea y edita cuentas con las reglas de auth y persistencia real, sin emitir sesiones.
 * @param {import('../../../generated/client.js').PrismaClient} database Cliente existente.
 * @returns {Promise<object>} get/create/edit; HttpError para conflictos, permiso o último admin.
 */
export async function createUsersService(database) {
  const repository = createUsersRepository(database);
  const passwords = await createPasswords();
  return {
    async get(id) {
      const user = await repository.find(userIdSchema.parse(id));
      if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
      return adminUser(user);
    },
    async create(actorId, input) {
      const { password, ...identity } = createUserSchema.parse(input);
      const passwordHash = await passwords.hash(password);
      return persistAdminUser(
        () =>
          repository.write(actorId, null, async (operations) => {
            requireAdministrator(operations.actor);
            return operations.create({ ...identity, passwordHash, emailVerified: false });
          }),
        () => repository.conflicts(identity),
      );
    },
    async edit(actorId, id, input) {
      userIdSchema.parse(id);
      const identity = editUserSchema.parse(input);
      return persistAdminUser(
        () =>
          repository.write(actorId, id, async (operations) => {
            requireAdministrator(operations.actor);
            const current = operations.current;
            if (!current) throw new HttpError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
            if (current.isDeleted)
              throw new HttpError(409, 'USER_DELETED', 'No se puede editar una cuenta eliminada');
            if (
              current.role === 'ADMIN' &&
              current.isActive &&
              identity.role !== 'ADMIN' &&
              (await operations.activeAdmins()) <= 1
            )
              throw new HttpError(
                409,
                'LAST_ACTIVE_ADMIN',
                'Debe permanecer al menos un administrador activo',
              );
            return operations.update({
              ...identity,
              lastName: identity.lastName ?? null,
              ...(identity.email !== current.email ? { emailVerified: false } : {}),
            });
          }),
        () => repository.conflicts(identity, id),
      );
    },
  };
}
