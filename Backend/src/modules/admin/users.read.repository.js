const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  profileImagePath: true,
  role: true,
  emailVerified: true,
  isActive: true,
  isDeleted: true,
  deletedAt: true,
  lockedUntil: true,
  failedLoginAttempts: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Lee páginas coherentes en una instantánea PostgreSQL, sin recuperar credenciales.
 * @param {object} database Prisma existente.
 * @returns {object} Consultas paginadas de usuarios y bitácora; propagan errores de DB.
 */
export function createUsersReadRepository(database) {
  const paginate = async (model, where, { page, pageSize }, select, orderBy) => {
    const [total, items] = await database.$transaction(
      [
        database[model].count({ where }),
        database[model].findMany({
          where,
          select,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ],
      { isolationLevel: 'RepeatableRead' },
    );
    return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
  };
  return {
    list: ({ q, role, ...pagination }) =>
      paginate(
        'user',
        {
          isDeleted: false,
          ...(role ? { role } : {}),
          ...(q
            ? {
                OR: ['firstName', 'lastName', 'email', 'username'].map((field) => ({
                  [field]: { contains: q, mode: 'insensitive' },
                })),
              }
            : {}),
        },
        pagination,
        userSelect,
        [{ createdAt: 'desc' }, { id: 'asc' }],
      ),
    audit: (pagination) =>
      paginate('auditLog', {}, pagination, undefined, [{ createdAt: 'desc' }, { id: 'desc' }]),
  };
}
