import { Button } from '../../../components/ui/Button.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';

/**
 * Selección nativa/arrastrada con ayuda y error asociados; no realiza ninguna carga de red.
 * @param {{error?: string, onSelect: Function, onChoose: Function}} props Validación y selector de archivo.
 * @returns {import('react').ReactElement} Zona de selección accesible mediante botón.
 */
export function PhotoPicker({ error, onSelect, onChoose }) {
  return (
    <>
      <p className="admin-muted">Agrega una foto para reconocer tu cuenta de un vistazo.</p>
      <div
        className="admin-photo-drop"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onSelect(event.dataTransfer.files?.[0]);
        }}
      >
        <Icon name="modern-plus" size={32} />
        {error ? (
          <div role="alert">
            <strong>No pudimos usar esta imagen.</strong>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <h3>Arrastra tu imagen hasta aquí</h3>
            <p>JPG, PNG o WEBP · Máximo 5 MB</p>
          </>
        )}
        <Button variant="secondary" icon={null} onClick={onChoose}>
          {error ? 'Elegir otra imagen' : 'Elegir archivo'}
        </Button>
      </div>
      <p className="admin-demo-note">
        Usaremos un recorte cuadrado con vista circular. La foto puede quitarse después.
      </p>
    </>
  );
}
