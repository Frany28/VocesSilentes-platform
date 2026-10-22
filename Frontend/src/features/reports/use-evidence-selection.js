import { useEffect, useRef, useState } from 'react';

/**
 * Valida la selección para UX y libera cada URL local al reemplazar, fallar o salir.
 * @returns {object} Selección, validación, error y acción select; no sustituye la validación del backend.
 */
export function useEvidenceSelection() {
  const [selection, setSelection] = useState(null);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const version = useRef(0);
  useEffect(() => () => { version.current += 1; }, []);
  useEffect(() => () => { if (selection?.src) URL.revokeObjectURL(selection.src); }, [selection]);
  const select = async (file) => {
    const current = ++version.current;
    setError('');
    setSelection(null);
    setValidating(false);
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5242880 || !file.size) {
      setError('Selecciona JPEG, PNG o WEBP de hasta 5 MB.');
      return;
    }
    const src = URL.createObjectURL(file);
    const image = new Image();
    image.src = src;
    setValidating(true);
    try {
      await image.decode();
      if (image.naturalWidth > 8192 || image.naturalHeight > 8192 ||
          image.naturalWidth * image.naturalHeight > 16000000) throw new Error('dimensions');
      if (version.current === current) setSelection({ file, src });
      else URL.revokeObjectURL(src);
    } catch {
      URL.revokeObjectURL(src);
      if (version.current === current) setError('No se pudo leer la imagen o sus dimensiones son excesivas.');
    } finally {
      if (version.current === current) setValidating(false);
    }
  };
  return { selection, select, clear: () => setSelection(null), validating, error };
}
