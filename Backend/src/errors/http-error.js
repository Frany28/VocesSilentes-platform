/** Error conocido con mensaje público seguro; no incluir datos de entrada. */
export class HttpError extends Error {
  /**
   * @param {number} status Estado HTTP.
   * @param {string} code Código estable para consumidores.
   * @param {string} message Mensaje público.
   */
  constructor(status, code, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}
