import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Representa carga y fallo reales de una imagen; el reintento vuelve a cargar el recurso recibido.
 * @param {{src: string, alt: string}} props Imagen proporcionada por el consumidor.
 * @returns {import('react').ReactElement} Imagen contenida en su visor sin estirar la proporción.
 */
export function EvidenceImage({ src, alt }) {
  const [status, setStatus] = useState('loading');
  const [revision, setRevision] = useState(0);
  return (
    <div className="admin-evidence-image" aria-busy={status === 'loading'}>
      {status === 'loading' && <p role="status">Cargando imagen…</p>}
      {status === 'error' && (
        <div role="alert">
          <p>No pudimos cargar la imagen.</p>
          <Button
            variant="secondary"
            icon={null}
            onClick={() => {
              setStatus('loading');
              setRevision((value) => value + 1);
            }}
          >
            Reintentar imagen
          </Button>
        </div>
      )}
      <img
        key={revision}
        src={src}
        alt={alt}
        hidden={status !== 'ready'}
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}
