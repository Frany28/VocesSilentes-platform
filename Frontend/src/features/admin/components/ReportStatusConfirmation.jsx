import { AdminConfirmation } from './AdminConfirmation.jsx';

/**
 * Confirma resolución o reapertura reutilizando el diálogo administrativo existente.
 * @param {{target: string, reference: string, operation: object, comment: string,
 * enabled: boolean, onClose: Function}} props Transición elegida y operación proporcionada por el consumidor.
 * @returns {import('react').ReactElement} Confirmación sin éxito antes de guardar.
 */
export function ReportStatusConfirmation({
  target,
  reference,
  operation,
  comment,
  enabled,
  onClose,
}) {
  const reopen = target === 'PENDING';
  return (
    <AdminConfirmation
      title={reopen ? 'Reabrir reporte' : 'Resolver reporte'}
      confirm={reopen ? 'Confirmar reapertura' : 'Confirmar resolución'}
      pending={operation.pending}
      error={operation.error}
      disabled={!enabled}
      onCancel={onClose}
      onConfirm={async () => {
        if (await operation.submit(comment, target)) onClose();
      }}
    >
      <p>Confirma el cambio de estado de {reference}.</p>
      <p>
        {enabled
          ? `Esta acción actualizará el reporte a ${reopen ? 'Pendiente' : 'Resuelto'}.`
          : 'Acción no disponible: falta el servicio de resolución y guardado de comentarios.'}
      </p>
    </AdminConfirmation>
  );
}
