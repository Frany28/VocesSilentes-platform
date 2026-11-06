import { CommunityMetrics } from './CommunityMetrics.jsx';
import { EducationMetrics } from './EducationMetrics.jsx';
import { MetricsTrend } from './MetricsTrend.jsx';
import { ModuleCompletion } from './ModuleCompletion.jsx';
import { SummaryPriority } from './SummaryPriority.jsx';

/**
 * Compone estadísticas del backend y sus límites, sin fixtures ni valores de recuperación inventados.
 * @param {{data: object}} props Instantánea real del resumen administrativo.
 * @returns {import('react').ReactElement} Gráficos con alternativa tabular y metodología visible.
 */
export function MetricsDashboard({ data }) {
  return <>
    <CommunityMetrics data={data} />
    <EducationMetrics data={data} />
    <div className="admin-metrics-charts">
      <MetricsTrend title="Actividad de usuarios" data={data.activity?.daily}
        description="Personas distintas por día con sesión iniciada o acción en bitácora. No equivale a cuentas habilitadas."
        series={[{ key: 'users', label: 'Usuarios con actividad' }]} />
      <MetricsTrend title="Progreso educativo" data={data.education?.daily}
        description="Registros de estudiantes en lecciones y módulos actualmente publicados."
        series={[{ key: 'started', label: 'Lecciones iniciadas' }, { key: 'lessons', label: 'Lecciones completadas' },
          { key: 'exercises', label: 'Ejercicios completados' }]} />
    </div>
    <ModuleCompletion modules={data.education?.byModule} />
    <SummaryPriority reports={data.reports} />
    <details className="admin-panel admin-metrics-methodology">
      <summary>Cómo se calculan estos indicadores</summary>
      <p>Registrados excluye cuentas eliminadas. Habilitados y deshabilitados representan permiso de acceso;
        activos requiere una sesión iniciada o una acción registrada, incluso si la cuenta fue deshabilitada después.</p>
      <p>La tasa usa las lecciones iniciadas dentro del período y completadas antes de su cierre.
        Sin inicios, el porcentaje no está disponible. Las finalizaciones se cuentan por estudiante y contenido.</p>
      <ul>{data.limitations?.map((text) => <li key={text}>{text}</li>)}</ul>
    </details>
  </>;
}
