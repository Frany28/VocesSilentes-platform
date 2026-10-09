/**
 * Permite solo destinos publicados y autorizados, sin URLs, query ni traversal.
 * @param {unknown} target Destino solicitado en estado del router.
 * @param {string} role Rol confirmado por el backend.
 * @returns {string} Ruta interna permitida; /account como fallback.
 */
export function safeReturnPath(target, role) {
  if (target === '/admin' && role === 'ADMIN') return target;
  return '/account';
}
