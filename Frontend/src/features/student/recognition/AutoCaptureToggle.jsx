/**
 * Interruptor de captura automática para estudiantes. Activada, el intento empieza solo cuando la mano
 * está quieta en el recuadro; desactivada, se usa el botón con cuenta atrás.
 * @param {{checked: boolean, onChange: Function}} props Estado y cambio.
 * @returns {import('react').ReactElement} Casilla con etiqueta y explicación.
 */
export function AutoCaptureToggle({ checked, onChange }) {
  return (
    <label className="auto-capture">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>
        <strong>Captura automática</strong>
        <small>Empieza sola cuando tu mano está quieta dentro del recuadro.</small>
      </span>
    </label>
  );
}
