import { useState } from 'react';

/**
 * Mantiene anotaciones manuales separadas del reproductor; invalida borradores y permisos al cambiar sus datos.
 * @param {Function} clear Descarta una extracción anterior sin modificar el lote de muestras.
 * @returns {object} Metadatos, procedencia, límites y cambios controlados.
 */
export function useVideoAnnotation(clear) {
  const [metadata, setMetadata] = useState({
    participantId: '',
    partition: 'train',
    label: 'A',
    consent: false,
  });
  const [source, setSource] = useState({
    origin: '',
    authorization: '',
    authorized: false,
    executionId: '',
  });
  const [range, setRange] = useState({ start: '', end: '' });
  const changeMetadata = (field, value) => {
    clear();
    setMetadata((previous) => ({
      ...previous,
      [field]: value,
      consent: field === 'participantId' ? false : field === 'consent' ? value : previous.consent,
    }));
  };
  const changeSource = (field, value) => {
    clear();
    setSource((previous) => ({
      ...previous,
      [field]: value,
      authorized: ['origin', 'authorization'].includes(field)
        ? false
        : field === 'authorized'
          ? value
          : previous.authorized,
    }));
  };
  const changeRange = (field, value) => {
    clear();
    setRange((previous) => ({ ...previous, [field]: value }));
  };
  return { metadata, source, range, changeMetadata, changeSource, changeRange };
}
