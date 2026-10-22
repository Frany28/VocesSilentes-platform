import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Representa carga y fallo reales de una imagen; el reintento vuelve a cargar el recurso recibido.
 * @param {{src?: string, alt: string, loading?: boolean, error?: object,
 * onRenew?: Function}} props Imagen y renovación del consumidor.
 * @returns {import('react').ReactElement} Imagen contenida en su visor sin estirar la proporción.
 */
export function EvidenceImage({ src, alt, loading = false, error, onRenew }) {
  const [status, setStatus] = useState('loading');
  const [revision, setRevision] = useState(0);
  const displayStatus = error ? 'error' : loading ? 'loading' : status;
  return (
    <div className="admin-evidence-image" aria-busy={displayStatus === 'loading'}>
      {displayStatus !== 'ready' && <Icon name="modern-image" size={28} />}
      {displayStatus === 'loading' && <p role="status">Cargando imagen…</p>}
      {displayStatus === 'error' && (
        <div role="alert">
          <p>{error?.message || 'No pudimos cargar la imagen.'}</p>
          <Button
            density="compact"
            variant="secondary"
            icon={null}
            onClick={() => {
              if (onRenew) return onRenew();
              setStatus('loading');
              setRevision((value) => value + 1);
            }}
          >
            Reintentar imagen
          </Button>
        </div>
      )}
      {src && !loading && !error && (
        <img
          key={revision}
          src={src}
          alt={alt}
          hidden={status !== 'ready'}
          onLoad={() => setStatus('ready')}
          onError={() => setStatus('error')}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
