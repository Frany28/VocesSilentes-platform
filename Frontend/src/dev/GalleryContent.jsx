import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { PasswordInput } from '../components/ui/PasswordInput.jsx';
import { Checkbox } from '../components/ui/Checkbox.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Alert } from '../components/ui/Alert.jsx';

/**
 * Ejercita contenido variable y extensiones accesibles, separado de los especímenes de Figma.
 * @returns {import('react').ReactElement} Ejemplos adaptables sin backend ni credenciales reales.
 */
export function GalleryContent() {
  return (
    <section
      className="gallery-section gallery-content"
      aria-label="Contenido variable y accesibilidad"
    >
      <h2>Contenido variable y accesibilidad</h2>
      <p>
        Reduce el ancho del navegador y usa Tab, Espacio y las flechas para revisar los controles.
      </p>
      {['light', 'dark'].map((theme) => (
        <div className="gallery-content-row" data-theme={theme} key={theme}>
          <Button>Ir</Button>
          <Button variant="secondary">
            Continuar con las instrucciones de la siguiente actividad
          </Button>
          <Input
            label="Nombre de usuario"
            help="La ayuda puede ocupar varias líneas sin cortar información importante."
          />
          <Input
            label="Correo"
            error="No pudimos validar este correo. Revisa la dirección e inténtalo nuevamente."
          />
          <PasswordInput
            label="Contraseña"
            name="password"
            autoComplete="new-password"
            help="Extensión accesible de Input; el diseño no especifica un control de visibilidad."
          />
          <PasswordInput
            label="Contraseña deshabilitada"
            disabled
            autoComplete="current-password"
          />
          <Checkbox>
            He leído todas las instrucciones y quiero continuar con el ejercicio de práctica.
          </Checkbox>
          <Badge tone="warning">Este texto largo describe un estado que requiere revisión</Badge>
          <Alert tone="error" title="No se pudo completar la acción solicitada">
            Este es un mensaje de ejemplo largo para comprobar ajuste de texto y ausencia de
            desbordamientos.
          </Alert>
        </div>
      ))}
    </section>
  );
}
