import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Encuadre local circular del archivo seleccionado; el zoom permanece entre 100 y 135 % como en Figma.
 * @param {{photo: object, onError: Function, onChoose: Function}} props Archivo, fallo de decodificación y reemplazo.
 * @returns {import('react').ReactElement} Vista previa con controles de teclado y guardado deshabilitado.
 */
export function PhotoCropPreview({ photo, onError, onChoose }) {
  const [zoom, setZoom] = useState(100);
  return (
    <>
      <p className="account-muted">Comprueba que tu rostro quede dentro del círculo.</p>
      <div className="account-photo-preview">
        <div className="account-photo-crop">
          <img
            src={photo.url}
            alt="Vista previa local de tu foto"
            style={{ transform: `scale(${zoom / 100})` }}
            onError={onError}
          />
        </div>
      </div>
      <div className="account-photo-zoom">
        <span>Encuadre</span>
        <output aria-label="Encuadre actual">{zoom}%</output>
        <Button
          density="compact"
          variant="secondary"
          icon={null}
          aria-label="Reducir encuadre"
          disabled={zoom <= 100}
          onClick={() => setZoom((value) => Math.max(100, value - 5))}
        >
          −
        </Button>
        <Button
          density="compact"
          variant="secondary"
          icon={null}
          aria-label="Ampliar encuadre"
          disabled={zoom >= 135}
          onClick={() => setZoom((value) => Math.min(135, value + 5))}
        >
          +
        </Button>
      </div>
      <p className="account-caption">{photo.name} · Vista previa local, sin guardar</p>
      <div className="account-actions">
        <Button density="compact" variant="secondary" icon={null} onClick={onChoose}>
          Elegir otra
        </Button>
        <Button density="compact" icon={null} disabled aria-describedby="photo-unavailable">
          Usar esta foto
        </Button>
      </div>
    </>
  );
}
