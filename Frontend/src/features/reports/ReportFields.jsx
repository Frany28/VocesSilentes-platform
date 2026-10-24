import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

/**
 * Campos compactos del reporte; conserva las categorías reales del backend y los errores por campo.
 * @param {{draft: object}} props Borrador controlado por el hook de envío.
 * @returns {import('react').ReactElement} Campos etiquetados, sin peticiones desde la presentación.
 */
export function ReportFields({ draft }) {
  return (
    <fieldset
      disabled={draft.pending || draft.submitted}
      className="m-0 flex min-w-0 flex-col gap-4 border-0 border-current p-0"
    >
      {Object.keys(draft.errors).length > 0 && (
        <Alert density="compact" tone="error" title="Revisa los campos obligatorios.">
          El título, el tipo y la descripción nos ayudan a entender el problema.
        </Alert>
      )}
      <Input
        density="compact"
        appearance="plain"
        label="Título del problema *"
        className="max-w-80"
        value={draft.title}
        required
        maxLength={120}
        placeholder="Ej.: el video no carga"
        error={draft.errors.title}
        onChange={(event) => draft.setTitle(event.target.value)}
      />
      <div className="grid grid-cols-2 gap-4 max-[360px]:grid-cols-1">
        <Select
          label="Tipo de error *"
          value={draft.category}
          required
          error={draft.errors.category}
          onChange={(event) => draft.setCategory(event.target.value)}
        >
          <option value="">Elige un tipo</option>
          <option value="TECHNICAL">Problema técnico</option>
          <option value="CONTENT">Contenido</option>
          <option value="OTHER">Otro</option>
        </Select>
        <Input
          density="compact"
          appearance="plain"
          label="Ubicación (opcional)"
          value={draft.location}
          maxLength={160}
          placeholder="Ej.: una lección"
          onChange={(event) => draft.setLocation(event.target.value)}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <label htmlFor="report-description">Descripción del problema *</label>
        <textarea
          className="box-border min-h-28 w-full max-w-112 resize-y rounded-md border border-border
            bg-surface px-4 py-3 font-field text-sm/5 text-content placeholder:text-muted
            placeholder:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2
            focus-visible:outline-focus aria-invalid:border-error disabled:bg-action-disabled
            disabled:text-disabled"
          id="report-description"
          value={draft.description}
          required
          maxLength={3600}
          aria-invalid={Boolean(draft.errors.description)}
          aria-describedby="report-description-help"
          placeholder="Describe qué intentabas hacer, qué esperabas y qué pasó."
          onChange={(event) => draft.setDescription(event.target.value)}
        />
        <p
          id="report-description-help"
          className={
            draft.errors.description ? 'font-brand text-xs/5 text-error' : 'account-caption'
          }
        >
          {draft.errors.description || 'Incluye los pasos necesarios para repetir el error.'}
        </p>
      </div>
    </fieldset>
  );
}
