import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';

/**
 * Marca manualmente los límites de una ejecución, con campos nativos operables por teclado.
 * @param {{range: object, duration: number, disabled: boolean, videoRef: object,
 * onChange: Function}} props Segundos, reproductor y actualización de límites.
 * @returns {import('react').ReactElement} Campos y marcadores sin inferencia automática de letras.
 */
export function VideoIntervalFields({ range, duration, disabled, videoRef, onChange }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3" disabled={disabled}>
      <legend className="[font:var(--type-h3)]">Intervalo de una ejecución</legend>
      <p>
        Duración del archivo: {duration.toFixed(2)} s. Marca entre 1,5 y 6 s sin incluir otra letra.
      </p>
      {['start', 'end'].map((field) => (
        <div key={field} className="flex min-w-0 flex-col gap-2">
          <Input
            label={field === 'start' ? 'Inicio (segundos)' : 'Fin (segundos)'}
            type="number"
            min="0"
            max={duration}
            step="0.01"
            value={range[field]}
            disabled={disabled}
            onChange={(event) => onChange(field, event.target.value)}
          />
          <Button
            variant="secondary"
            density="compact"
            icon={null}
            disabled={disabled}
            onClick={() =>
              onChange(field, String(Math.round(videoRef.current.currentTime * 1000) / 1000))
            }
          >
            {field === 'start' ? 'Marcar inicio aquí' : 'Marcar fin aquí'}
          </Button>
        </div>
      ))}
    </fieldset>
  );
}
