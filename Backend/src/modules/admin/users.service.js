import { HttpError } from '../../errors/http-error.js';
import { createPasswords } from '../auth/passwords.js';
import { adminUser } from './admin-user.js';
import { createUsersRepository } from './users.repository.js';
import { persistAdminUser } from './users.persistence.js';
import {
  createUserSchema,
  editUserSchema,
  userIdSchema,
  listUsersSchema,
  paginationSchema,
} from './users.validation.js';
import { createUsersReadRepository } from './users.read.repository.js';
import {
  requireAdministrator,
  requireEditableUser,
  requireRemainingAdmin,
} from './users.policy.js';
import { deleteAdminUser } from './users.deletion.js';
import { changeUserState } from './users.state.js';
import { readAdminSummary, readUserActivity } from './users.summary.js';

/**
 * Administra cuentas con las reglas de auth, bloqueo y auditoría persistente, sin emitir sesiones.
 * @param {import('../../../generated/client.js').PrismaClient} database Cliente existente.
 * @returns {Promise<object>} CRUD y lectura de auditoría; HttpError para conflictos o permisos.
 */
export async function createUsersService(database) {
  const repository = createUsersRepository(database);
  const reads = createUsersReadRepository(database);
  const passwords = await createPasswords();
  return {
    list: (input) => reads.list(listUsersSchema.parse(input)),
    audit: (input) => reads.audit(paginationSchema.parse(input)),
    delete: (actorId, id) => deleteAdminUser(repository, actorId, id),
    state: (actorId, id, isActive) => changeUserState(repository, actorId, id, isActive),
    summary: () => readAdminSummary(database),
    async get(id) {
      const user = await repository.find(userIdSchema.parse(id));
      if (!user) throw new HttpError(404, 'USER_NOT_FOUND', 'Usuario no encontrado');
      return { ...adminUser(user), activity: await readUserActivity(database, id) };
    },
    async create(actorId, input) {
      const { password, ...identity } = createUserSchema.parse(input);
      const passwordHash = await passwords.hash(password);
      return persistAdminUser(
        () =>
          repository.write(actorId, null, async (operations) => {
            requireAdministrator(operations.actor);
            const user = await operations.create({
              ...identity,
              passwordHash,
              emailVerified: false,
            });
            await operations.audit('USER_CREATED', user.id);
            return user;
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
            requireEditableUser(current);
            if (identity.role !== 'ADMIN') await requireRemainingAdmin(operations);
            const user = await operations.update({
              ...identity,
              lastName: identity.lastName ?? null,
              ...(identity.email !== current.email ? { emailVerified: false } : {}),
            });
            await operations.audit('USER_UPDATED', user.id);
            return user;
          }),
        () => repository.conflicts(identity, id),
      );
    },
  };
}
