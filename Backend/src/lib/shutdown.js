/**
 * Deja terminar peticiones y desconecta Prisma incluso si falla el cierre HTTP.
 * @param {import('node:http').Server} server Servidor en ejecución.
 * @param {{ $disconnect: () => Promise<void> } | undefined} database Cliente opcional.
 * @returns {Promise<void>} Finaliza después de liberar los recursos.
 */
export async function closeResources(server, database) {
  try {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  } finally {
    await database?.$disconnect();
  }
}
