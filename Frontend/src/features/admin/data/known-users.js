const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Lee solo IDs recordados por administrador; cada cuenta se vuelve a consultar al servidor.
 * @param {string} actorId Administrador actual.
 * @returns {string[]} IDs válidos, sin datos personales ni contraseñas almacenados.
 */
export function readKnownUsers(actorId) {
  try {
    const values = JSON.parse(localStorage.getItem(`vs-admin-users:${actorId}`) ?? '[]');
    return Array.isArray(values)
      ? [...new Set(values.filter((id) => typeof id === 'string' && uuid.test(id)))].slice(0, 50)
      : [];
  } catch {
    return [];
  }
}
function writeKnownUsers(actorId, ids) {
  try {
    localStorage.setItem(`vs-admin-users:${actorId}`, JSON.stringify(ids.slice(0, 50)));
  } catch {
    /* El navegador puede negar almacenamiento; el enlace por UUID sigue funcionando. */
  }
}
/**
 * Recuerda una cuenta confirmada para recuperarla por ID tras recargar; almacenamiento opcional.
 * @param {string} actorId Administrador actual.
 * @param {string} id UUID devuelto por el servidor.
 * @returns {void} No persiste los campos de la cuenta ni oculta fallos HTTP.
 */
export function rememberUser(actorId, id) {
  if (!uuid.test(id)) return;
  writeKnownUsers(actorId, [id, ...readKnownUsers(actorId).filter((value) => value !== id)]);
}
/**
 * Olvida un ID que el servidor confirmó inexistente, para que no bloquee futuras cargas.
 * @param {string} actorId Administrador actual.
 * @param {string} id UUID sin cuenta en la base actual.
 * @returns {void} Ignora fallos de almacenamiento, igual que rememberUser.
 */
export function forgetUser(actorId, id) {
  writeKnownUsers(
    actorId,
    readKnownUsers(actorId).filter((value) => value !== id),
  );
}
