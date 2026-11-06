import { useEffect, useRef, useState } from 'react';

/**
 * Conserva archivos locales por huella y libera sus URLs; nunca descarga URLs externas ni sube bytes.
 * @returns {object} Selección, reproducción de procedencia, errores y estado de lectura local.
 */
export function useLocalVideos() {
  const assets = useRef(new Map());
  const generation = useRef(0);
  const [asset, setAsset] = useState(null);
  const [replay, setReplay] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(
    () => () => {
      generation.current += 1;
      for (const item of assets.current.values()) URL.revokeObjectURL(item.url);
      assets.current.clear();
    },
    [],
  );
  const select = async (file) => {
    const request = ++generation.current;
    setError('');
    setPending(true);
    try {
      if (
        !file ||
        !/\.(mp4|webm)$/i.test(file.name) ||
        !['', 'video/mp4', 'video/webm'].includes(file.type) ||
        file.size === 0 ||
        file.size > 128 * 1024 * 1024
      )
        throw new Error('Selecciona un MP4 o WebM local, no vacío, de hasta 128 MB.');
      const bytes = await file.arrayBuffer();
      const header = new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 12));
      const mp4 = String.fromCharCode(...header.slice(4, 8)) === 'ftyp';
      const webm = [0x1a, 0x45, 0xdf, 0xa3].every((value, index) => header[index] === value);
      if (!mp4 && !webm)
        throw new Error('El contenido del archivo no corresponde a un MP4/WebM admitido.');
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      if (generation.current !== request) return;
      const sha256 = [...new Uint8Array(hash)]
        .map((value) => value.toString(16).padStart(2, '0'))
        .join('');
      if (!assets.current.has(sha256))
        assets.current.set(sha256, {
          sha256,
          url: URL.createObjectURL(file),
          name: file.name,
        });
      setAsset(assets.current.get(sha256));
      setReplay(null);
    } catch (failure) {
      if (generation.current === request) setError(failure.message);
    } finally {
      if (generation.current === request) setPending(false);
    }
  };
  const preview = (sample) => {
    const original = assets.current.get(sample.source?.sha256);
    if (!original) {
      setError('Selecciona el archivo original para revisar esta ejecución.');
      return false;
    }
    setError('');
    setAsset(original);
    setReplay({ ...sample.source, requestId: crypto.randomUUID() });
    return true;
  };
  return { asset, replay, pending, error, select, preview };
}
