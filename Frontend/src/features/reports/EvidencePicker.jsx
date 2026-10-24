import { useId, useRef } from 'react';
import { Button } from '../../components/ui/Button.jsx';
import { Icon } from '../../components/ui/Icon.jsx';

/**
 * Selección local opcional; la validación confiable permanece en el backend existente.
 * @param {{selection: object | null, onSelect: Function, disabled: boolean, invalid?: boolean}} props Borrador y acciones.
 * @returns {import('react').ReactElement} Selector, vista previa y eliminación antes del envío.
 */
export function EvidencePicker({ selection, onSelect, disabled, invalid }) {
  const input = useRef();
  const help = useId();
  return (
    <section className="account-panel report-evidence-picker">
      <h2>Una imagen ayuda</h2>
      <p className="account-caption">Evidencia (opcional)</p>
      <input
        ref={input}
        className="vs-file-input"
        type="file"
        tabIndex={-1}
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        aria-label="Imagen de evidencia (opcional)"
        aria-describedby={help}
        onChange={(event) => {
          onSelect(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      <div className="report-evidence-drop">
        {selection ? (
          <>
            <img src={selection.src} alt="Vista previa de la evidencia" />
            <p className="report-evidence-name">{selection.file.name}</p>
            <p className="account-caption">
              {selection.file.type.replace('image/', '').toUpperCase()} ·{' '}
              {Math.ceil(selection.file.size / 1024)} KB
            </p>
          </>
        ) : (
          <>
            <Icon name="evidence-plus" size={28} />
            <p>Agrega una captura</p>
            <p className="account-caption">PNG, JPG o WEBP</p>
            <p className="account-caption">Hasta 5 MB · Opcional</p>
          </>
        )}
        <Button
          density="compact"
          variant="secondary"
          icon={null}
          disabled={disabled}
          onClick={() => (selection || invalid ? onSelect(null) : input.current.click())}
        >
          {selection || invalid ? 'Quitar selección' : 'Elegir imagen'}
        </Button>
      </div>
      <p id={help} className="account-caption">
        Antes de adjuntar, oculta los datos privados.
      </p>
      <p className="account-caption">Una imagen de hasta 8192 px por lado y 16 megapíxeles.</p>
    </section>
  );
}
