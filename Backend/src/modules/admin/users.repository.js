/**
 * Serializa escrituras administrativas entre procesos y vuelve a leer actor y cuenta.
 * @param {import('../../../generated/client.js').PrismaClient} database Conexión existente.
 * @returns {object} Lectura por ID y transacción de escritura; propaga errores de persistencia.
 */
export function createUsersRepository(database) {
  return {
    find: (id) => database.user.findUnique({ where: { id } }),
    async conflicts(identity, excludedId) {
      const rows = await database.user.findMany({
        where: {
          OR: [{ email: identity.email }, { username: identity.username }],
          ...(excludedId ? { id: { not: excludedId } } : {}),
        },
        select: { email: true, username: true },
      });
      return {
        email: rows.some((row) => row.email === identity.email),
        username: rows.some((row) => row.username === identity.username),
      };
    },
    write: (actorId, userId, operation) =>
      database.$transaction(async (tx) => {
        // Un bloqueo compartido por todas las escrituras evita dos degradaciones simultáneas.
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(21811858)::text`;
        await tx.$queryRaw`
          SELECT id FROM vocessilentes."User"
          WHERE id = ${actorId}::uuid OR id = ${userId ?? actorId}::uuid
          ORDER BY id FOR UPDATE
        `;
        return operation({
          actor: await tx.user.findUnique({ where: { id: actorId } }),
          current: userId ? await tx.user.findUnique({ where: { id: userId } }) : null,
          activeAdmins: () =>
            tx.user.count({ where: { role: 'ADMIN', isActive: true, isDeleted: false } }),
          create: (data) => tx.user.create({ data }),
          update: (data) => tx.user.update({ where: { id: userId }, data }),
        });
      }),
  };
}
