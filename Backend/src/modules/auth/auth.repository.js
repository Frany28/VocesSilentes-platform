/**
 * Centraliza persistencia Prisma y las escrituras atómicas de cuentas y sesiones.
 * @param {import('../../../generated/client.js').PrismaClient} database Cliente conectado.
 * @returns {object} Operaciones privadas usadas por servicios; errores Prisma se propagan.
 */
export function createAuthRepository(database) {
  return {
    findUser: (email) => database.user.findUnique({ where: { email } }),
    register: (data, session) =>
      database.$transaction(async (tx) => {
        const user = await tx.user.create({ data: { ...data, sessions: { create: session } } });
        await tx.auditLog.create({
          data: {
            actorId: user.id,
            operation: 'USER_REGISTERED',
            entityType: 'User',
            entityId: user.id,
          },
        });
        return user;
      }),
    findSession: (tokenHash) =>
      database.session.findUnique({ where: { tokenHash }, include: { user: true } }),
    revoke: (tokenHash, revokedAt) =>
      database.session.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt },
      }),
    recordFailure: (user) => database.$executeRaw`
      UPDATE vocessilentes."User"
      SET "failedLoginAttempts" = LEAST("failedLoginAttempts"::bigint + 1, 2147483647)::integer,
        "updatedAt" = GREATEST(clock_timestamp(), "createdAt", "updatedAt")
      WHERE id = ${user.id}::uuid AND "passwordHash" = ${user.passwordHash}
    `,
    // Se bloquea la fila y se vuelve a leer: estado y hash pueden cambiar durante Argon2.
    finalizeLogin: (userId, run) =>
      database.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM vocessilentes."User" WHERE id = ${userId}::uuid FOR UPDATE`;
        const user = await tx.user.findUnique({ where: { id: userId } });
        return run(user, {
          reset: () =>
            tx.user.update({
              where: { id: userId },
              data: { failedLoginAttempts: 0, lockedUntil: null },
            }),
          createSession: (session) => tx.session.create({ data: { ...session, userId } }),
        });
      }),
  };
}
