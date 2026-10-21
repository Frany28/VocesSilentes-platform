import { useRef } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { AdminDialog } from '../components/AdminDialog.jsx';
import { usePhotoDraft } from './use-photo-draft.js';
import { PhotoCropPreview } from './PhotoCropPreview.jsx';
import { PhotoPicker } from './PhotoPicker.jsx';

/**
 * Foto local sin persistencia ficticia; libera el archivo al cerrar y conserva la foto real del perfil.
 * @param {{onClose: Function}} props Cierre del diálogo.
 * @returns {import('react').ReactElement} Selector/encuadre y dependencia de guardado explicada.
 */
export function PhotoDialog({ onClose }) {
  const draft = usePhotoDraft();
  const input = useRef();
  return (
    <AdminDialog
      title={draft.photo ? 'Encuentra tu mejor encuadre' : 'Tu imagen, tu elección'}
      onClose={onClose}
      className="admin-photo-dialog"
    >
      <input
        ref={input}
        className="admin-file-input"
        type="file"
        tabIndex={-1}
        accept="image/jpeg,image/png,image/webp"
        aria-label="Elegir foto de perfil"
        onChange={(event) => {
          draft.select(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      {draft.photo ? (
        <PhotoCropPreview
          key={draft.photo.url}
          photo={draft.photo}
          onError={draft.fail}
          onChoose={draft.clear}
        />
      ) : (
        <PhotoPicker
          error={draft.error}
          onSelect={draft.select}
          onChoose={() => input.current.click()}
        />
      )}
      <p id="photo-unavailable" className="admin-demo-note">
        Guardado no disponible: falta el servicio de carga, recorte y persistencia de fotos. El
        archivo permanece en este dispositivo.
      </p>
      <div className="admin-actions">
        <Button variant="secondary" icon={null} onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </AdminDialog>
  );
}
