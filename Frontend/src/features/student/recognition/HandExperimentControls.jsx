import { useState } from 'react';
import { Checkbox } from '../../../components/ui/Checkbox.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Alert } from '../../../components/ui/Alert.jsx';

/**
 * Activa comparaciones locales y, opcionalmente, una política de reflejo validada externamente.
 * @param {{samples: object[], operation: object}} props Capturas y controlador del worker.
 * @returns {import('react').ReactElement} Opciones explícitas; no declara revisión lingüística.
 */
export function HandExperimentControls({ samples, operation }) {
  const [enabled, setEnabled] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [error, setError] = useState('');
  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        checked={enabled}
        disabled={operation.pending}
        onChange={(event) => setEnabled(event.target.checked)}
      >
        Incluir aumento por reflejo previamente validado (experimento C)
      </Checkbox>
      {enabled && (
        <label>
          Validación documental del reflejo (JSON)
          <input
            type="file"
            accept="application/json,.json"
            disabled={operation.pending}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              setPolicy(null);
              setError('');
              if (!file) return;
              try {
                if (file.size > 65536) throw new Error('La política debe ser menor de 64 KiB');
                setPolicy(JSON.parse(await file.text()));
              } catch {
                setError('No se pudo leer la validación documental.');
              }
            }}
          />
        </label>
      )}
      <p className="text-muted">
        A: reales derechas. B: reales de ambas manos. C: reales y reflejos validados. Se reserva la
        misma prueba por participante; sin capturas independientes no habrá exactitud. El modelo
        anterior permanece disponible al recargar la práctica.
      </p>
      <Button
        variant="secondary"
        disabled={!samples.length || operation.pending || (enabled && !policy)}
        onClick={() =>
          operation.train(samples, true, {
            compareHands: true,
            augmentation: enabled ? policy : null,
          })
        }
      >
        Comparar A/B/C y preparar modelo {enabled ? 'C' : 'B'}
      </Button>
      {error && (
        <Alert tone="error" title="Validación no cargada">
          {error}
        </Alert>
      )}
    </div>
  );
}
