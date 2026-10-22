import { Button } from '../../../components/ui/Button.jsx';
import { ReportEvidence } from './ReportEvidence.jsx';
import { useEvidenceAccess } from '../../reports/use-evidence-access.js';

/**
 * Conecta el visor existente a enlaces temporales sin llevar peticiones a componentes visuales.
 * @param {{report: object}} props Reporte consultado y autorizado.
 * @returns {import('react').ReactElement} Evidencia real y recuperación de enlaces caducados.
 */
export function AuthorizedEvidence({ report }) {
  const access = useEvidenceAccess(report.id);
  return (
    <>
      {access.status === 'loading' && <p role="status">Obteniendo acceso a la imagen…</p>}
      {access.status === 'error' && (
        <div role="alert">
          <p>{access.error.message}</p>
          <Button variant="secondary" onClick={access.retry}>
            Reintentar acceso
          </Button>
        </div>
      )}
      <ReportEvidence
        evidence={{ ...report.evidence, src: access.src }}
        loading={access.status !== 'ready'}
        onRenew={access.retry}
      />
    </>
  );
}
