import { useState } from 'react';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { TrainingSampleRow } from './TrainingSampleRow.jsx';
import { TrainingSampleImport } from './TrainingSampleImport.jsx';

/**
 * Conserva revisión declarada por ejecución y exportación de lotes, sin aprobar datos automáticamente.
 * @param {{collection: object, onPreview?: Function, busy?: boolean}} props Lote y acceso al archivo original.
 * @returns {import('react').ReactElement} Inspección, revisión, descarte y descarga local.
 */
export function TrainingSamples({ collection, onPreview, busy }) {
  const [reviewer, setReviewer] = useState('');
  return (
    <section
      className="education-card flex min-w-0 flex-col gap-4"
      aria-label="Muestras recopiladas"
    >
      <h2 className="[font:var(--type-h3)]">Muestras en memoria: {collection.samples.length}</h2>
      <p className="text-muted">
        {collection.experimental
          ? 'Confirma provisionalmente la etiqueta tras observar la ejecución. No es revisión experta LSV.'
          : 'Confirma revisión LSV solo si una persona competente observó la ejecución original.'}{' '}
        Exporta antes de cerrar.
      </p>
      <Input
        label={
          collection.experimental
            ? 'Código de quien confirma la etiqueta'
            : 'Código de quien revisa LSV'
        }
        value={reviewer}
        onChange={(event) => setReviewer(event.target.value.toLowerCase())}
        help="Código sin nombres personales."
      />
      <TrainingSampleImport collection={collection} busy={busy} />
      <ul className="flex w-full list-none flex-col gap-3 p-0">
        {collection.samples.map((sample) => (
          <TrainingSampleRow
            key={sample.id}
            sample={sample}
            reviewer={reviewer}
            collection={collection}
            onPreview={onPreview}
            busy={busy}
          />
        ))}
      </ul>
      <Button disabled={!collection.samples.length || busy} onClick={collection.download}>
        Exportar muestras (.json)
      </Button>
      {collection.error && (
        <Alert tone="error" title="Revisa los datos">
          {collection.error}
        </Alert>
      )}
      <p className="text-muted">
        {collection.experimental
          ? 'Flujo local provisional: conserva permisos y consentimiento pendientes del metraje original; exige confirmación.'
          : 'El entrenador exige consentimiento, revisión y personas independientes, sin ejecuciones duplicadas.'}
      </p>
    </section>
  );
}
