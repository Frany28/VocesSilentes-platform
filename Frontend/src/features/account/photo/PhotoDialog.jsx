import { useRef } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Dialog } from '../../../components/ui/Dialog.jsx';
import { usePhotoDraft } from './use-photo-draft.js';
import { PhotoCropPreview } from './PhotoCropPreview.jsx';
import { PhotoPicker } from './PhotoPicker.jsx';
import '../styles/account-photo.css';
import { useAuth } from '../../auth/use-auth.js';
import { accountApi } from '../account.api.js';
import { useAccountOperation } from '../use-account-operation.js';
import { Alert } from '../../../components/ui/Alert.jsx';

/**
 * Selecciona foto local y guarda su encuadre con validación en el servidor.
 * @param {{onClose: Function}} props Cierre del diálogo.
 * @returns {import('react').ReactElement} Selector, encuadre y guardado confirmado con recuperación de errores.
 */
export function PhotoDialog({ onClose }) {
  const draft = usePhotoDraft();
  const auth = useAuth();
  const operation = useAccountOperation();
  const input = useRef();
  return (
    <Dialog
      title={draft.photo ? 'Encuentra tu mejor encuadre' : 'Tu imagen, tu elección'}
      onClose={onClose}
      className="account-photo-dialog"
      pending={operation.pending}
    >
      <input
        ref={input}
        className="vs-file-input"
        type="file"
        tabIndex={-1}
        accept="image/jpeg,image/png,image/webp"
        aria-label="Elegir foto de perfil"
        disabled={operation.pending}
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
          pending={operation.pending}
          onSave={(zoom) =>
            operation.run(
              (signal) => accountApi.photo(draft.photo.file, zoom, signal),
              (saved) => {
                auth.updateUser(saved);
                onClose();
              },
            )
          }
        />
      ) : (
        <PhotoPicker
          error={draft.error}
          onSelect={draft.select}
          onChoose={() => input.current.click()}
        />
      )}
      <p className="account-caption">
        Al guardar, se recortará la imagen seleccionada y se actualizará tu perfil.
      </p>
      {operation.error && (
        <Alert tone="error" title="No se pudo guardar la foto">
          {operation.error}
        </Alert>
      )}
      <div className="account-actions">
        <Button
          density="compact"
          variant="secondary"
          icon={null}
          onClick={onClose}
          disabled={operation.pending}
        >
          Cancelar
        </Button>
      </div>
    </Dialog>
  );
}
