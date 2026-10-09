/**
 * Define cookies host-only y atributos compartidos de emisión y borrado.
 * @param {object} policy Política validada de sesión.
 * @returns {object} Nombres y opciones, sin Domain; prefijo __Host con HTTPS.
 */
export function authCookies(policy) {
  const prefix = policy.secure ? '__Host-' : '';
  return {
    session: `${prefix}vs-session`,
    context: `${prefix}vs-context`,
    csrf: `${prefix}vs-csrf`,
    options: { httpOnly: true, secure: policy.secure, sameSite: policy.sameSite, path: '/' },
  };
}
