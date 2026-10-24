import { Button } from '../../../components/ui/Button.jsx';
import { Icon } from '../../../components/ui/Icon.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';

/**
 * Selección nativa/arrastrada con ayuda y error asociados; no realiza ninguna carga de red.
 * @param {{error?: string, onSelect: Function, onChoose: Function}} props Validación y selector de archivo.
 * @returns {import('react').ReactElement} Zona de selección accesible mediante botón.
 */
export function PhotoPicker({ error, onSelect, onChoose }) {
  if (error)
    return (
      <>
        <Alert tone="error" title="No pudimos usar esta imagen." icon={<Icon name="photo-alert" />}>
          {error}
        </Alert>
        <Button density="compact" icon={null} onClick={onChoose}>
          Elegir otra imagen
        </Button>
      </>
    );
  return (
    <>
      <p className="account-muted">Agrega una foto para reconocer tu cuenta de un vistazo.</p>
      <div
        className="account-photo-drop"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onSelect(event.dataTransfer.files?.[0]);
        }}
      >
        <Icon name="modern-plus" size={32} />
        <h3>Arrastra tu imagen hasta aquí</h3>
        <p>JPG, PNG o WEBP · Máximo 5 MB</p>
        <Button density="compact" icon={null} onClick={onChoose}>
          Elegir archivo
        </Button>
      </div>
      <p className="account-caption">
        Usaremos un recorte cuadrado con vista circular. La foto puede quitarse después.
      </p>
    </>
  );
}
