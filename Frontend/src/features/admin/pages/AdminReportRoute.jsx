import { useParams } from 'react-router';
import { useReportResource } from '../../reports/use-report-resource.js';
import { AdminFeedback } from '../components/AdminFeedback.jsx';
import { AdminReportDetail } from './AdminReportDetail.jsx';

/**
 * Consulta detalle autorizado; conserva la presentación de Figma y la dependencia de resolución.
 * @returns {import('react').ReactElement} Detalle o carga/error recuperable real.
 */
export function AdminReportRoute() {
  const { id } = useParams();
  const result = useReportResource(id);
  if (result.status !== 'ready')
    return (
      <AdminFeedback
        status={result.status}
        error={result.error}
        retry={result.retry}
        noun="el reporte"
      />
    );
  return <AdminReportDetail report={result.data} />;
}
