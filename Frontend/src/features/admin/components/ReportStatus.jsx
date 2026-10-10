import { Badge } from '../../../components/ui/Badge.jsx';
/**
 * Estado del reporte sin depender exclusivamente del color.
 * @param {{status: string}} props Estado PENDING/RESOLVED.
 * @returns {import('react').ReactElement} Badge.
 */
export function ReportStatus({ status }) {
  return (
    <Badge tone={status === 'RESOLVED' ? 'success' : 'warning'}>
      {status === 'RESOLVED' ? 'Resuelto' : 'Pendiente'}
    </Badge>
  );
}
