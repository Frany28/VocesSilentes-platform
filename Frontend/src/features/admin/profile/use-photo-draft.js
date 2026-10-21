import { useEffect, useState } from 'react';

/**
 * Valida una foto local; libera object URLs al reemplazar/cerrar y nunca sube el archivo.
 * @returns {object} photo/error/select/clear; solo JPEG/PNG/WEBP hasta 5 MB.
 */
export function usePhotoDraft() {
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  useEffect(
    () => () => {
      if (photo?.url) URL.revokeObjectURL(photo.url);
    },
    [photo?.url],
  );
  const select = (file) => {
    if (!file) return;
    setPhoto(null);
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 5 * 1024 * 1024 ||
      file.size === 0
    ) {
      setError('Elige un archivo JPG, PNG o WEBP de hasta 5 MB.');
      return;
    }
    setError(null);
    setPhoto({ url: URL.createObjectURL(file), name: file.name });
  };
  return {
    photo,
    error,
    select,
    fail: () => {
      setPhoto(null);
      setError('No pudimos leer esta imagen. Elige otro archivo válido.');
    },
    clear: () => {
      setPhoto(null);
      setError(null);
    },
  };
}
