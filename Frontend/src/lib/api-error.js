/** Error uniforme para HTTP, red, cancelación y respuestas ilegibles. */
export class ApiError extends Error {
  /**
   * @param {string} code Código estable.
   * @param {string} message Mensaje público.
   * @param {number} [status] Estado HTTP, o 0 cuando no existe respuesta.
   * @param {number} [retryAfter] Segundos de espera indicados por el servidor.
   */
  constructor(code, message, status = 0, retryAfter) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}
