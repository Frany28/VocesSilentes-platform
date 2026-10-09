import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Checkbox } from '../components/ui/Checkbox.jsx';
import { Radio } from '../components/ui/Radio.jsx';
import { Icon } from '../components/ui/Icon.jsx';
import { GallerySection } from './GallerySection.jsx';

const buttonStates = ['Normal', 'Hover', 'Presionado', 'Foco', 'Deshabilitado', 'Cargando'];
const selectionStates = ['Sin seleccionar', 'Seleccionado', 'Foco', 'Deshabilitado'];

function previewClass(state) {
  return (
    { Hover: 'vs-preview-hover', Presionado: 'vs-preview-pressed', Foco: 'vs-preview-focus' }[
      state
    ] || ''
  );
}

/**
 * Muestra variantes y estados funcionales reales de botones, campos y selecciones.
 * @returns {import('react').ReactElement} Inventario de controles, sin red ni datos de negocio.
 */
export function GalleryControls() {
  return (
    <>
      {['primary', 'secondary'].map((variant) => (
        <GallerySection
          key={variant}
          title={`Button/${variant === 'primary' ? 'Primario' : 'Secundario'}`}
          states={buttonStates}
          width={208}
          render={(state) => (
            <Button
              variant={variant}
              className={previewClass(state)}
              disabled={state === 'Deshabilitado'}
              loading={state === 'Cargando'}
              loadingLabel="Cargando..."
            >
              {variant === 'primary' ? 'Continuar' : 'Ver módulo'}
            </Button>
          )}
        />
      ))}
      <GallerySection
        title="Input"
        width={304}
        states={['Vacío', 'Con valor', 'Foco', 'Error', 'Deshabilitado']}
        render={(state) => (
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="Ingresa tu correo"
            defaultValue={state === 'Con valor' ? 'hola@ejemplo.com' : undefined}
            help="Usaremos este correo para tu cuenta."
            error={state === 'Error' ? 'Introduce un correo válido.' : undefined}
            disabled={state === 'Deshabilitado'}
            className={previewClass(state)}
            icon={
              <Icon
                name="mail"
                size={20}
                tone={
                  state === 'Error' ? 'error' : state === 'Deshabilitado' ? 'disabled' : 'default'
                }
              />
            }
          />
        )}
      />
      {[Checkbox, Radio].map((Control, index) => (
        <GallerySection
          key={index}
          title={index ? 'Radio' : 'Checkbox'}
          states={selectionStates}
          width={260}
          render={(state, theme) => (
            <Control
              defaultChecked={state === 'Seleccionado'}
              disabled={state === 'Deshabilitado'}
              className={previewClass(state)}
              name={index ? `radio-${theme}` : undefined}
            >
              {index ? 'Opción de respuesta' : 'Recordar mi sesión'}
            </Control>
          )}
        />
      ))}
    </>
  );
}
