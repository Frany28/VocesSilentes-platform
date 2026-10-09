const listeners = new Set();

/**
 * Suscribe al proveedor a invalidaciones 401 confirmadas por el backend.
 * @param {function(): void} listener Callback sin datos sensibles.
 * @returns {function(): void} Desuscripción.
 */
export function onSessionInvalidated(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Notifica una sesión inválida; los 403 y fallos de red no invocan esta señal.
 * @returns {void}
 */
export function invalidateSession() {
  for (const listener of listeners) listener();
}
