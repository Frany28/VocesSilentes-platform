import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { Checkbox } from '../../../components/ui/Checkbox.jsx';
import { TrainingEvidenceFields } from './TrainingEvidenceFields.jsx';

/**
 * Recoge la revisión explícita de una ejecución y sus referencias; no la deduce desde los puntos.
 * @param {{sample: object, reviewer: string, collection: object, busy?: boolean}} props Muestra y acción local.
 * @returns {import('react').ReactElement} Formulario de documentación o confirmación provisional separada.
 */
export function TrainingSampleReview({ sample, reviewer, collection, busy }) {
  const [observed, setObserved] = useState(false);
  const [evidence, setEvidence] = useState({});
  const experimental = collection.experimental;
  return (
    <form
      className="flex min-w-0 flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        collection.review(sample.id, reviewer, {
          ...evidence,
          language: 'LSV',
          reviewedAt: new Date().toISOString(),
        });
      }}
    >
      {!experimental && (
        <TrainingEvidenceFields
          label={sample.label}
          value={evidence}
          onChange={(field, value) => setEvidence((previous) => ({ ...previous, [field]: value }))}
        />
      )}
      <Checkbox checked={observed} onChange={(event) => setObserved(event.target.checked)}>
        {experimental
          ? `Observé la ejecución original y confirmo su etiqueta provisional ${sample.label}.`
          : 'Una persona competente en LSV revisó esta ejecución original en vivo o en el video, y confirmó su etiqueta. Inspeccionar solo los puntos no basta.'}
      </Checkbox>
      <Button
        type="submit"
        density="compact"
        variant="secondary"
        icon={null}
        disabled={busy || !observed || !/^[a-z0-9_-]{1,64}$/.test(reviewer)}
      >
        {experimental ? 'Confirmar etiqueta provisional' : 'Confirmar revisión LSV'}
      </Button>
    </form>
  );
}
