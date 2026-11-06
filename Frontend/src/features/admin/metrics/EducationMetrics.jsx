import { MetricsCards } from './MetricsCards.jsx';
import { metricValue } from './metrics-format.js';

/**
 * Separa catálogo actual y progreso del período, sin interpretar la lectura como competencia LSV.
 * @param {{data: object}} props Estadísticas educativas del servidor.
 * @returns {import('react').ReactElement} Conteos y tasa con su denominador real.
 */
export function EducationMetrics({ data }) {
  const { catalog, education } = data;
  return <>
    <MetricsCards title="Contenido disponible" items={[
      { label: 'Módulos publicados', value: catalog?.modulesPublished, detail: 'Catálogo publicado actual.' },
      { label: 'Lecciones publicadas', value: catalog?.lessonsPublished, detail: 'Lección y módulo publicados.' },
      { label: 'Ejercicios disponibles', value: catalog?.exercisesAvailable,
        detail: 'Ejercicios manuales y preguntas listas para responder.' },
    ]} />
    <MetricsCards title="Progreso del período" items={[
      { label: 'Lecciones completadas', value: education?.lessonsCompleted,
        detail: 'Finalizaciones registradas de estudiantes.' },
      { label: 'Ejercicios completados', value: education?.exercisesCompleted,
        detail: 'Avances guardados como completados.' },
      { label: 'Finalización de lecciones iniciadas', value: education?.completionPercentage, unit: '%',
        detail: education?.completionUnavailableReason ??
          `${metricValue(education?.cohortCompleted)} de ${metricValue(education?.lessonsStarted)} iniciadas en el período, completadas antes de su cierre.` },
    ]} />
  </>;
}
