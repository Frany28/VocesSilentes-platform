import { ReportEvidence } from './ReportEvidence.jsx';
import { AuthorizedEvidence } from './AuthorizedEvidence.jsx';

/**
 * Selecciona evidencia remota confirmada o estado sin imagen; mantiene el visor visual reutilizable.
 * @param {{report: object}} props Reporte autorizado o fixture explícito de presentación.
 * @returns {import('react').ReactElement} Evidencia o estado de carga todavía sin confirmar.
 */
export function ReportAttachment({ report }) {
  if (report.evidence?.state === 'READY') return <AuthorizedEvidence report={report} />;
  return (
    <>
      <ReportEvidence evidence={report.evidence} />
      {report.evidence?.state && <p role="status">La imagen todavía no está confirmada.</p>}
    </>
  );
}
