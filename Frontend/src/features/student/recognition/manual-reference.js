import provenance from '../../../assets/lsv-manual/provenance.json';
import { publicConfig } from '../../../lib/config.js';

/**
 * Reserva el material privado para revisión explícita en desarrollo; no importa imágenes en el build.
 * @param {string} letter Letra de estudio, nunca una opción de respuesta oculta.
 * @returns {object | null} URL local y metadatos de origen; no valida la ejecución de la seña.
 */
export function manualReference(letter) {
  if (!import.meta.env.DEV || !publicConfig.studentDemo) return null;
  const entry = provenance.images[letter];
  if (!entry) return null;
  return {
    ...entry,
    url: `/src/assets/lsv-manual/${entry.file}`,
    credit: provenance.credit,
    validationStatus: provenance.validationStatus,
  };
}
