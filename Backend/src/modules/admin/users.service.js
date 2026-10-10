import { HttpError } from '../../errors/http-error.js';
import { createPasswords } from '../auth/passwords.js';
import { accountAllowed } from '../auth/public-user.js';
import { adminUser } from './admin-user.js';
import { createUsersRepository } from './users.repository.js';
import { createUserSchema, editUserSchema, userIdSchema } from './users.validation.js';

function requireAdministrator(actor) {
  if (!accountAllowed(actor, new Date()) || actor.role !== 'ADMIN')
    throw new HttpError(403, 'FORBIDDEN', 'Permiso insuficiente');
}

async function persisted(operation) {
  try {
    return adminUser(await operation());
  } catch (error) {
    if (error.code === 'P2002')
      throw new HttpError(
        409,
        'ACCOUNT_UNAVAILABLE',
        'El correo o nombre de usuario ya está registrado',
      );
    throw error;
  }
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
      return persisted(() =>
        repository.write(actorId, null, async (operations) => {
          requireAdministrator(operations.actor);
          return operations.create({ ...identity, passwordHash, emailVerified: false });
        }),
      );
    },
    async edit(actorId, id, input) {
      userIdSchema.parse(id);
      const identity = editUserSchema.parse(input);
      return persisted(() =>
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
      );
    },
  };
}
