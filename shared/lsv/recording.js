import { LSV_LABELS } from './labels.js';
import { validateVideoSource } from './video-source.js';

const code = /^[a-zA-Z0-9_-]{1,64}$/;
const validCode = (value) => typeof value === 'string' && code.test(value);

/**
 * Valida una muestra consentida y continua, sin inferir que su etiqueta corresponde a una seña correcta.
 * @param {unknown} value Muestra exportada por el laboratorio local.
 * @returns {object} Muestra con campos permitidos; la revisión lingüística es explícita e independiente.
 * @throws {Error} Estructura, consentimiento, puntos, tiempo o lateralidad incompatibles.
 */
export function validateRecording(value) {
  if (
    !value ||
    value.version !== 1 ||
    !validCode(value.participantId) ||
    !validCode(value.sessionId) ||
    !validCode(value.id) ||
    !LSV_LABELS.includes(value.label) ||
    value.consent !== true ||
    !['train', 'validation', 'test'].includes(value.partition) ||
    !['PENDING_LSV_REVIEW', 'APPROVED_LSV'].includes(value.reviewStatus)
  )
    throw new Error('Muestra inválida: revisa etiqueta, códigos, grupo y consentimiento');
  if (value.reviewStatus === 'APPROVED_LSV' && !validCode(value.reviewerId))
    throw new Error('Falta el código de la persona que revisó la muestra');
  const frames = validateFrames(value.frames);
  return {
    version: 1,
    id: value.id,
    label: value.label,
    participantId: value.participantId,
    sessionId: value.sessionId,
    partition: value.partition,
    consent: true,
    reviewStatus: value.reviewStatus,
    reviewerId: value.reviewerId ?? null,
    frames,
    ...(value.source !== undefined ? { source: validateVideoSource(value.source, frames) } : {}),
  };
}

/**
 * Comprueba continuidad, duración y geometría de una secuencia capturada, sin asignarle una letra.
 * @param {unknown} frames Observaciones reales del detector.
 * @returns {object[]} Frames compatibles con el extractor de características.
 * @throws {Error} Mano ausente, cambio de lateralidad, pausas largas o coordenadas inválidas.
 */
export function validateFrames(frames) {
  if (!Array.isArray(frames) || frames.length < 16 || frames.length > 60)
    throw new Error('Se necesitan entre 16 y 60 frames reales de una sola mano');
  let previous = -1;
  for (const frame of frames) {
    if (
      !Number.isFinite(frame.t) ||
      frame.t <= previous ||
      (previous >= 0 && frame.t - previous > 400) ||
      !['Left', 'Right'].includes(frame.hand) ||
      frame.hand !== frames[0].hand ||
      !Number.isInteger(frame.width) ||
      !Number.isInteger(frame.height) ||
      frame.width < 16 ||
      frame.height < 16 ||
      frame.width > 4096 ||
      frame.height > 4096 ||
      frame.width !== frames[0].width ||
      frame.height !== frames[0].height ||
      !Array.isArray(frame.points) ||
      frame.points.length !== 21 ||
      frame.points.some(
        (point) =>
          !Array.isArray(point) ||
          point.length !== 3 ||
          point.some((coordinate) => !Number.isFinite(coordinate) || Math.abs(coordinate) > 10),
      )
    )
      throw new Error(
        'Muestra incompleta: mantén una mano visible, sin interrupciones ni cambio de cámara',
      );
    previous = frame.t;
  }
  const duration = frames.at(-1).t - frames[0].t;
  if (duration < 1500 || duration > 6000)
    throw new Error('La muestra debe durar entre 1,5 y 6 segundos');
  return frames.map(({ t, hand, width, height, points }) => ({ t, hand, width, height, points }));
}
