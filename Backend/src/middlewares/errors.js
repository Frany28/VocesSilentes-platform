import { ZodError } from 'zod';
import { HttpError } from '../errors/http-error.js';

/**
 * Convierte rutas desconocidas en el contrato común de errores.
 * @param {import('express').Request} _request Petición.
 * @param {import('express').Response} _response Respuesta.
 * @param {import('express').NextFunction} next Continuación.
 * @returns {void}
 */
export function notFound(_request, _response, next) {
  next(new HttpError(404, 'NOT_FOUND', 'Ruta no encontrada'));
}

/**
 * Centraliza errores HTTP, JSON y validación, ocultando errores internos.
 * @param {Error} error Error capturado.
 * @param {import('express').Request} request Petición con logger.
 * @param {import('express').Response} response Respuesta.
 * @param {import('express').NextFunction} next Continuación si ya se enviaron cabeceras.
 * @returns {void}
 */
export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);
  let publicError = error;
  if (error instanceof ZodError || error.type === 'entity.parse.failed') {
    publicError = new HttpError(400, 'INVALID_INPUT', 'Datos de entrada inválidos');
  } else if (error.type === 'entity.too.large') {
    publicError = new HttpError(413, 'PAYLOAD_TOO_LARGE', 'Cuerpo de petición demasiado grande');
  }
  if (!(publicError instanceof HttpError)) {
    request.log?.error({ err: error }, 'Error de petición');
    publicError = new HttpError(500, 'INTERNAL_ERROR', 'Error interno del servidor');
  }
  response.status(publicError.status).json({
    error: { code: publicError.code, message: publicError.message },
  });
}
