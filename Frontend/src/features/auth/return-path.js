/**
 * Permite solo destinos publicados y autorizados, sin URLs, query ni traversal.
 * @param {unknown} target Destino solicitado en estado del router.
 * @param {string} role Rol confirmado por el backend.
 * @returns {string} Destino autorizado o inicio disponible según el rol confirmado.
 */
export function safeReturnPath(target, role) {
  if (target === '/admin' && role === 'ADMIN') return target;
  if (
    role === 'ADMIN' &&
    typeof target === 'string' &&
    /^\/admin\/(?:users(?:\/(?:new|demo-user-\d+|[0-9a-f-]{36})(?:\/(?:edit|created))?)?|reports(?:\/demo-report-\d+)?)$/.test(
      target,
    )
  )
    return target;
  if (target === '/account') return target;
  if (
    role === 'USER' &&
    [
      '/student',
      '/student/modules',
      '/student/practice',
      '/student/progress',
      '/student/profile',
    ].includes(target)
  )
    return target;
  return role === 'ADMIN' ? '/admin' : '/student';
}
