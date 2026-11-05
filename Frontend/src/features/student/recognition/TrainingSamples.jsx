import { useState } from 'react';
import { Input } from '../../../components/ui/Input.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';

/**
 * Identifica la revisión humana como declarada y exporta el lote, sin aprobar datos ni métricas automáticamente.
 * @param {{collection: object}} props Colección consentida únicamente en memoria.
 * @returns {import('react').ReactElement} Revisión por muestra y descarga para entrenamiento reproducible.
 */
export function TrainingSamples({ collection }) {
  const [reviewer, setReviewer] = useState('');
  return (
    <section className="education-card flex flex-col gap-4" aria-label="Muestras recopiladas">
      <h2 className="[font:var(--type-h3)]">Muestras en memoria: {collection.samples.length}</h2>
      <p className="text-muted">
        Confirma una revisión solo si una persona competente en LSV observó la ejecución en vivo.
        Los puntos por sí solos no acreditan la etiqueta. Exporta antes de cerrar esta página.
      </p>
      <Input
        label="Código de quien revisa LSV"
        value={reviewer}
        onChange={(event) => setReviewer(event.target.value.toLowerCase())}
        help="Código sin nombres personales."
      />
      <ul className="flex w-full list-none flex-col gap-3 p-0">
        {collection.samples.map((sample) => (
          <li key={sample.id} className="training-sample-row">
            <p>
              {sample.label} · {sample.participantId} · {sample.partition} · {sample.frames.length}{' '}
              frames
            </p>
            <p className="text-muted">
              {sample.reviewStatus === 'APPROVED_LSV'
                ? `Revisión declarada por ${sample.reviewerId}`
                : 'Pendiente de revisión LSV'}
            </p>
            <div className="camera-actions">
              <Button
                density="compact"
                variant="secondary"
                icon={null}
                disabled={
                  sample.reviewStatus === 'APPROVED_LSV' || !/^[a-z0-9_-]{1,64}$/.test(reviewer)
                }
                onClick={() => collection.review(sample.id, reviewer)}
              >
                Confirmar revisión LSV
              </Button>
              <Button
                density="compact"
                variant="secondary"
                icon={null}
                onClick={() => collection.remove(sample.id)}
              >
                Descartar muestra
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button disabled={!collection.samples.length} onClick={collection.download}>
        Exportar muestras (.json)
      </Button>
      {collection.error && (
        <Alert tone="error" title="Revisa los datos">
          {collection.error}
        </Alert>
      )}
      <p className="text-muted">
        El entrenador rechazará muestras sin consentimiento o revisión, y personas mezcladas entre
        grupos.
      </p>
    </section>
  );
}
