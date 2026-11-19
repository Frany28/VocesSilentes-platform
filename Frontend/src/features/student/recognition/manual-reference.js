import provenance from '../../../assets/lsv-manual/provenance.json';
import { publicConfig } from '../../../lib/config.js';
import { isLocalExperiment } from './local-experiment.js';

/**
 * Reserva el material privado para revisión explícita en desarrollo; no importa imágenes en el build.
 * @param {string} letter Letra de estudio, nunca una opción de respuesta oculta.
 * @param {boolean} [laboratory] Revisión educativa en el laboratorio de desarrollo local.
 * @returns {object | null} URL local y metadatos de origen; no valida la ejecución de la seña.
 */
export function manualReference(letter, laboratory = false) {
  if (!import.meta.env.DEV || !(publicConfig.studentDemo || (laboratory && isLocalExperiment())))
    return null;
  const entry = provenance.images[letter];
  if (!entry) return null;
  return {
    ...entry,
    url: `/src/assets/lsv-manual/${entry.file}`,
    credit: provenance.credit,
    validationStatus: provenance.validationStatus,
  };
}
