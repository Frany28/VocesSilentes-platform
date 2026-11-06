/**
 * Restringe datos/modelos provisionales al servidor de desarrollo y al loopback del navegador.
 * @returns {boolean} Si el entorno permite el flujo experimental local.
 */
export function isLocalExperiment() {
  return (
    import.meta.env.DEV &&
    ['localhost', '127.0.0.1', '[::1]'].includes(globalThis.location?.hostname)
  );
}
