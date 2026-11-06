import { Input } from '../../../components/ui/Input.jsx';
import { Checkbox } from '../../../components/ui/Checkbox.jsx';

/**
 * Registra declaraciones de procedencia y autorización por archivo, sin verificarlas ni solicitar documentos privados.
 * @param {{source: object, disabled: boolean, onChange: Function}} props Valores y cambios controlados.
 * @returns {import('react').ReactElement} Crédito/procedencia, referencia de autorización y código de ejecución.
 */
export function VideoSourceFields({ source, disabled, onChange }) {
  return (
    <>
      <Input
        label="Procedencia y crédito del video"
        value={source.origin}
        maxLength={240}
        disabled={disabled}
        help="Autor y referencia de origen. No incluyas rutas privadas ni datos de contacto."
        onChange={(event) => onChange('origin', event.target.value)}
      />
      <Input
        label="Referencia de autorización"
        value={source.authorization}
        maxLength={240}
        disabled={disabled}
        help="Indica la licencia aplicable o un código de permiso verificable; conserva la evidencia por separado."
        onChange={(event) => onChange('authorization', event.target.value)}
      />
      <Checkbox
        checked={source.authorized}
        disabled={disabled}
        onChange={(event) => onChange('authorized', event.target.checked)}
      >
        Declaro que este archivo fue obtenido legalmente y está autorizado para extraer puntos,
        exportarlos y entrenar este modelo.
      </Checkbox>
      <Input
        label="Código de ejecución"
        value={source.executionId}
        maxLength={64}
        disabled={disabled}
        help="Una repetición completa, un código estable. No dividas una misma ejecución en varias muestras."
        onChange={(event) => onChange('executionId', event.target.value.toLowerCase())}
      />
    </>
  );
}
