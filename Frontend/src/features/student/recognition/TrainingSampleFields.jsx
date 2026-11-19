import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Checkbox } from '../../../components/ui/Checkbox.jsx';
import { LSV_LABELS, LSV_MOTION_LETTERS } from '../../../../../shared/lsv/labels.js';

/**
 * Presenta metadatos mínimos de muestras consentidas, sin solicitar nombres ni aprobar etiquetas automáticamente.
 * @param {{metadata: object, disabled: boolean, onChange: Function, labels?: string[],
 * experimental?: boolean}} props Valores y control.
 * @returns {import('react').ReactElement} Código, partición, etiqueta y consentimiento explícito.
 */
export function TrainingSampleFields({
  metadata,
  disabled,
  onChange,
  labels = LSV_LABELS,
  experimental = false,
}) {
  return (
    <>
      <Input
        label="Código de participante"
        value={metadata.participantId}
        disabled={disabled}
        help="Usa el mismo código para la misma persona en todas sus sesiones. No escribas nombres ni correos."
        onChange={(event) => onChange('participantId', event.target.value.toLowerCase())}
      />
      <Select
        label="Grupo de datos"
        value={metadata.partition}
        disabled={disabled}
        onChange={(event) => onChange('partition', event.target.value)}
      >
        <option value="train">Entrenamiento</option>
        {!experimental && <option value="validation">Calibración</option>}
        <option value="test">Prueba independiente</option>
      </Select>
      {metadata.requestedHand !== undefined && (
        <Select
          label="Mano que se solicita capturar"
          value={metadata.requestedHand}
          disabled={disabled}
          onChange={(event) => onChange('requestedHand', event.target.value)}
        >
          <option value="AUTO">Cualquiera · detectar automáticamente</option>
          <option value="Left">Izquierda · ejecución real</option>
          <option value="Right">Derecha · ejecución real</option>
        </Select>
      )}
      <Select
        label="Etiqueta de la muestra"
        value={metadata.label}
        disabled={disabled}
        onChange={(event) => onChange('label', event.target.value)}
      >
        {labels.map((label) => (
          <option key={label} value={label}>
            {label === 'NONE' ? 'NONE · postura que no es una letra del experimento' : label}
          </option>
        ))}
      </Select>
      {LSV_MOTION_LETTERS.includes(metadata.label) && (
        <p className="text-muted">
          Registra la ejecución temporal completa de {metadata.label}, sin congelarla ni repetir
          fotogramas. Su movimiento y variante LSV requieren revisión humana.
        </p>
      )}
      <Checkbox
        checked={metadata.consent}
        disabled={disabled}
        className="w-full"
        onChange={(event) => onChange('consent', event.target.checked)}
      >
        Cuento con el consentimiento de la persona participante para recopilar y exportar localmente
        estos puntos de manos y entrenar el modelo experimental.
      </Checkbox>
      <p className="text-muted">
        {experimental
          ? 'La comparación A/B/C reserva la prueba por persona. El modelo provisional no calibra umbrales.'
          : 'Cada persona debe pertenecer a un solo grupo.'}{' '}
        Las muestras no se envían automáticamente.
      </p>
    </>
  );
}
