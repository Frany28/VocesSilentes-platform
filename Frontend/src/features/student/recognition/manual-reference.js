import provenance from '../../../assets/lsv-manual/provenance.json';

const files = import.meta.glob('../../../assets/lsv-manual/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

/**
 * Localiza una ilustración auténtica del documento proporcionado, manteniendo crédito y revisión pendiente.
 * @param {string} letter Letra de estudio, nunca una opción de respuesta oculta.
 * @returns {object | null} URL local y metadatos de origen; no valida la ejecución de la seña.
 */
export function manualReference(letter) {
  const entry = provenance.images[letter];
  if (!entry) return null;
  return {
    ...entry,
    url: files[`../../../assets/lsv-manual/${entry.file}`],
    credit: provenance.credit,
    validationStatus: provenance.validationStatus,
  };
}
