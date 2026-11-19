import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Checkbox } from '../../../components/ui/Checkbox.jsx';
import { LSV_LETTERS, LSV_MOTION_LETTERS } from '../../../../../shared/lsv/labels.js';

const references = {
  consentReference: 'Referencia de consentimiento',
  permissionReference: 'Referencia de permiso para entrenamiento',
  reviewReference: 'Referencia de revisión lingüística',
  variantReference: 'Referencia de fuente y variante LSV',
};

/**
 * Registra códigos de documentos privados tras la revisión de una ejecución, sin subir esos documentos.
 * @param {{label: string, value: object, onChange: Function}} props Etiqueta, referencias y cambio controlado.
 * @returns {import('react').ReactElement} Referencias, revisión temporal y alcance explícito de NONE.
 */
export function TrainingEvidenceFields({ label, value, onChange }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend>Documentación de esta ejecución</legend>
      <p className="text-muted">
        Registra códigos sin nombres ni rutas privadas. Conserva por separado los documentos que
        autorizan este uso y la revisión de la ejecución original; un código no certifica
        competencia LSV.
      </p>
      {Object.entries(references).map(([field, title]) => (
        <Input
          key={field}
          label={title}
          value={value[field] ?? ''}
          onChange={(event) => onChange(field, event.target.value)}
          pattern="[a-zA-Z0-9_-]{1,64}"
          maxLength={64}
          required
        />
      ))}
      {LSV_MOTION_LETTERS.includes(label) && (
        <Checkbox
          required
          checked={value.motionReviewed ?? false}
          onChange={(event) => onChange('motionReviewed', event.target.checked)}
        >
          Se revisó el movimiento completo y la variante LSV de {label} con la fuente declarada.
        </Checkbox>
      )}
      {label === 'NONE' && (
        <>
          <Select
            label="Alcance revisado de NONE"
            value={
              value.negativeFor?.length === 27
                ? 'alphabet'
                : value.negativeFor?.length
                  ? 'vowels'
                  : ''
            }
            onChange={(event) =>
              onChange(
                'negativeFor',
                event.target.value === 'alphabet' ? [...LSV_LETTERS] : ['A', 'E', 'I', 'O', 'U'],
              )
            }
            required
          >
            <option value="" disabled>
              Selecciona el alcance comprobado
            </option>
            <option value="alphabet">No representa ninguna de las 27 letras</option>
            <option value="vowels">Negativo solo para las cinco vocales</option>
          </Select>
          <Input
            label="Postura o transición observada en NONE"
            value={value.negativeDescription ?? ''}
            onChange={(event) => onChange('negativeDescription', event.target.value)}
            minLength={10}
            maxLength={240}
            required
          />
          <p className="text-muted">
            Una B usada como negativo de vocales requiere nueva revisión al añadir B al modelo.
          </p>
        </>
      )}
    </fieldset>
  );
}
