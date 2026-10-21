import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Encuadre local circular del archivo seleccionado; el zoom permanece entre 100 y 135 % como en Figma.
 * @param {{photo: object, onError: Function, onChoose: Function}} props Archivo, fallo de decodificación y reemplazo.
 * @returns {import('react').ReactElement} Vista previa con teclado/range y guardado deshabilitado.
 */
export function PhotoCropPreview({ photo, onError, onChoose }) {
  const [zoom, setZoom] = useState(100);
  return (
    <>
      <p className="admin-muted">Comprueba que tu rostro quede dentro del círculo.</p>
      <div className="admin-photo-preview">
        <div className="admin-photo-crop">
          <img
            src={photo.url}
            alt="Vista previa local de tu foto"
            style={{ transform: `scale(${zoom / 100})` }}
            onError={onError}
          />
        </div>
      </div>
      <div className="admin-photo-zoom">
        <label htmlFor="admin-photo-zoom">Encuadre</label>
        <input
          id="admin-photo-zoom"
          type="range"
          min="100"
          max="135"
          step="5"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
        <output htmlFor="admin-photo-zoom">{zoom}%</output>
        <Button
          variant="secondary"
          icon={null}
          aria-label="Reducir encuadre"
          disabled={zoom <= 100}
          onClick={() => setZoom((value) => Math.max(100, value - 5))}
        >
          −
        </Button>
        <Button
          variant="secondary"
          icon={null}
          aria-label="Ampliar encuadre"
          disabled={zoom >= 135}
          onClick={() => setZoom((value) => Math.min(135, value + 5))}
        >
          +
        </Button>
      </div>
      <p className="admin-demo-note">{photo.name} · Vista previa local, sin guardar</p>
      <div className="admin-actions">
        <Button variant="secondary" icon={null} onClick={onChoose}>
          Elegir otra
        </Button>
        <Button icon={null} disabled aria-describedby="photo-unavailable">
          Usar esta foto
        </Button>
      </div>
    </>
  );
}
