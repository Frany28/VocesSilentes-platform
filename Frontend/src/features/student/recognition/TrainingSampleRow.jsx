import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Checkbox } from '../../../components/ui/Checkbox.jsx';
import { SamplePreview } from './SamplePreview.jsx';

/**
 * Ofrece inspección y revisión humana declarada por ejecución, sin aprobar geometría como LSV automáticamente.
 * @param {{sample: object, reviewer: string, collection: object, onPreview?: Function,
 * busy?: boolean}} props Muestra, código de revisor y acciones de lote.
 * @returns {import('react').ReactElement} Fila accesible con descarte y procedencia exportable.
 */
export function TrainingSampleRow({ sample, reviewer, collection, onPreview, busy }) {
  const [observed, setObserved] = useState(false);
  const approved = sample.reviewStatus === 'APPROVED_LSV';
  const experimental = collection.experimental;
  const confirmed = experimental ? Boolean(sample.labelConfirmation) : approved;
  return (
    <li className="training-sample-row flex min-w-0 flex-col gap-3">
      <p>
        {sample.label} · {sample.participantId ?? sample.observedSignant ?? 'Persona sin confirmar'}{' '}
        ·{sample.partition ?? 'Sin partición'} · {sample.frames.length} observaciones
      </p>
      {experimental && (
        <p>
          {confirmed ? 'Etiqueta provisional confirmada' : 'Etiqueta por confirmar'}.{' '}
          Consentimiento: {sample.consent ? 'declarado' : 'documentación pendiente'}.
        </p>
      )}
      <p className="text-muted">
        {approved ? `Revisión declarada por ${sample.reviewerId}` : 'Pendiente de revisión LSV'}
      </p>
      {sample.source?.type === 'LOCAL_VIDEO' && (
        <details className="model-command">
          <summary>Procedencia de esta ejecución</summary>
          <p>{sample.source.origin}</p>
          <p>
            Autorización:{' '}
            {sample.source.authorization ??
              sample.source.authorizationStatus ??
              'Captura consentida'}
          </p>
          <p>
            Ejecución: {sample.source.executionId}. Intervalo: {sample.source.startMs / 1000}–
            {sample.source.endMs / 1000} s.
          </p>
        </details>
      )}
      <details>
        <summary>Inspeccionar puntos extraídos</summary>
        <SamplePreview sample={sample} />
      </details>
      {!confirmed && (
        <Checkbox checked={observed} onChange={(event) => setObserved(event.target.checked)}>
          {experimental
            ? `Observé la ejecución original y confirmo su etiqueta provisional ${sample.label}.`
            : 'Una persona competente en LSV revisó esta ejecución original en vivo o en el video, y confirmó su etiqueta. Inspeccionar solo los puntos no basta.'}
        </Checkbox>
      )}
      <div className="camera-actions">
        {sample.source?.type === 'LOCAL_VIDEO' && onPreview && (
          <Button
            density="compact"
            variant="secondary"
            icon={null}
            disabled={busy}
            onClick={() => onPreview(sample)}
          >
            Ver video original
          </Button>
        )}
        <Button
          density="compact"
          variant="secondary"
          icon={null}
          disabled={busy || confirmed || !observed || !/^[a-z0-9_-]{1,64}$/.test(reviewer)}
          onClick={() => collection.review(sample.id, reviewer)}
        >
          {experimental ? 'Confirmar etiqueta provisional' : 'Confirmar revisión LSV'}
        </Button>
        <Button
          density="compact"
          variant="secondary"
          icon={null}
          disabled={busy}
          onClick={() => collection.remove(sample.id)}
        >
          Descartar muestra
        </Button>
      </div>
    </li>
  );
}
