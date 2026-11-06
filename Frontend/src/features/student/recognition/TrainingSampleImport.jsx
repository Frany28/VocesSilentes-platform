import { useState } from 'react';
import { Alert } from '../../../components/ui/Alert.jsx';

/**
 * Lee únicamente JSON elegido por la persona; el lote valida todo antes de incorporar una muestra.
 * @param {{collection: object, busy?: boolean}} props Colección y operación activa.
 * @returns {import('react').ReactElement} Importación de exportaciones o cuarentena local.
 */
export function TrainingSampleImport({ collection, busy }) {
  const [error, setError] = useState('');
  return (
    <>
      <label className="model-file-label">
        Importar muestras locales (.json)
        <input
          type="file"
          accept=".json,application/json"
          disabled={busy}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            setError('');
            try {
              if (file.size > 16 * 1024 * 1024) throw new Error('El lote supera 16 MB');
              collection.importData(JSON.parse(await file.text()));
            } catch (failure) {
              setError(failure.message);
            }
          }}
        />
      </label>
      {error && (
        <Alert tone="error" title="No se pudo importar">
          {error}
        </Alert>
      )}
    </>
  );
}
