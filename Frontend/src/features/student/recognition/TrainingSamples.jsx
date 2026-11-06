import { useState } from 'react';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';
import { TrainingSampleRow } from './TrainingSampleRow.jsx';

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
        Cada fila representa una ejecución. Confirma una revisión solo si una persona competente
        observó la ejecución original en vivo o en el video. Exporta antes de cerrar.
      </p>
      <Input
        label="Código de quien revisa LSV"
        value={reviewer}
        onChange={(event) => setReviewer(event.target.value.toLowerCase())}
        help="Código sin nombres personales."
      />
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
        El entrenador rechaza muestras sin consentimiento o revisión, ejecuciones duplicadas o
        solapadas y personas mezcladas entre grupos.
      </p>
    </section>
  );
}
