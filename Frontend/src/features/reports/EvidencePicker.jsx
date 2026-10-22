import { Button } from '../../components/ui/Button.jsx';

/**
 * Selección opcional local: no hace peticiones ni sustituye la validación confiable del servidor.
 * @param {{selection: object | null, onSelect: Function, disabled: boolean, invalid?: boolean}} props Borrador y acciones.
 * @returns {import('react').ReactElement} Selector, previsualización y eliminación previa al envío.
 */
export function EvidencePicker({ selection, onSelect, disabled, invalid }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-2">
        Imagen de evidencia (opcional)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          onChange={(event) => {
            onSelect(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>
      <p className="text-muted">
        Una imagen JPEG, PNG o WEBP, hasta 5 MB, 8192 px por lado y 16 megapíxeles.
      </p>
      {(selection || invalid) && (
        <>
          {selection && (
            <img
              className="max-h-64 w-full rounded-xl object-contain"
              src={selection.src}
              alt="Vista previa de la evidencia"
            />
          )}
          <Button
            type="button"
            variant="secondary"
            disabled={disabled}
            onClick={() => onSelect(null)}
          >
            Quitar selección
          </Button>
        </>
      )}
    </div>
  );
}
