/**
 * Permite solo destinos publicados y autorizados, sin URLs, query ni traversal.
 * @param {unknown} target Destino solicitado en estado del router.
 * @param {string} role Rol confirmado por el backend.
 * @returns {string} Destino autorizado o inicio disponible según el rol confirmado.
 */
export function safeReturnPath(target, role) {
  if (target === '/admin' && role === 'ADMIN') return target;
  if (target === '/account') return target;
  if (target === '/student' || target === '/student/modules') return target;
  return role === 'ADMIN' ? '/admin' : '/student';
}
