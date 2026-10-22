import { Input } from '../../components/ui/Input.jsx';
import { Alert } from '../../components/ui/Alert.jsx';

/**
 * Campos compactos del reporte; conserva las categorías reales del backend y los errores por campo.
 * @param {{draft: object}} props Borrador controlado por el hook de envío.
 * @returns {import('react').ReactElement} Campos etiquetados, sin peticiones desde la presentación.
 */
export function ReportFields({ draft }) {
  return (
    <fieldset disabled={draft.pending || draft.submitted} className="report-fields">
      {Object.keys(draft.errors).length > 0 && (
        <Alert tone="error" title="Revisa los campos obligatorios.">
          El título, el tipo y la descripción nos ayudan a entender el problema.
        </Alert>
      )}
      <Input
        density="compact"
        appearance="plain"
        label="Título del problema *"
        className="report-title-field"
        value={draft.title}
        required
        maxLength={120}
        placeholder="Ej.: el video no carga"
        error={draft.errors.title}
        onChange={(event) => draft.setTitle(event.target.value)}
      />
      <div className="report-field-pair">
        <div className="report-select">
          <label htmlFor="report-category">Tipo de error *</label>
          <select
            id="report-category"
            value={draft.category}
            required
            aria-invalid={Boolean(draft.errors.category)}
            aria-describedby={draft.errors.category ? 'report-category-error' : undefined}
            onChange={(event) => draft.setCategory(event.target.value)}
          >
            <option value="">Elige un tipo</option>
            <option value="TECHNICAL">Problema técnico</option>
            <option value="CONTENT">Contenido</option>
            <option value="OTHER">Otro</option>
          </select>
          {draft.errors.category && (
            <p id="report-category-error" className="report-field-error">
              {draft.errors.category}
            </p>
          )}
        </div>
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
      <div className="report-description">
        <label htmlFor="report-description">Descripción del problema *</label>
        <textarea
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
          className={draft.errors.description ? 'report-field-error' : 'account-caption'}
        >
          {draft.errors.description || 'Incluye los pasos necesarios para repetir el error.'}
        </p>
      </div>
    </fieldset>
  );
}
